from __future__ import annotations

import logging
import queue
import socket
import threading
import time
from concurrent.futures import Future
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from uuid import uuid4

import uvicorn
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, sync_playwright

from backend.app.browser.errors import (
    ActionTimeoutError,
    BrowserCrashError,
    BrowserError,
    ElementNotFoundError,
    NavigationTimeoutError,
)
from backend.app.browser.observations import BrowserObservation, extract_page_observation
from backend.app.browser.selectors import resolve_locator
from backend.app.browser.session import BrowserSession

logger = logging.getLogger(__name__)

SCREENSHOTS_DIR = Path(__file__).resolve().parent / "screenshots"


import urllib.request


def _is_portal_healthy(port: int, host: str = "127.0.0.1") -> bool:
    try:
        req = urllib.request.Request(f"http://{host}:{port}/api/health", headers={"User-Agent": "HealthCheck"})
        with urllib.request.urlopen(req, timeout=0.4) as resp:
            return resp.status == 200
    except Exception:
        return False


def _find_free_port(start_port: int = 8000) -> int:
    for port in (start_port, 8899, 8898, 8897, 8896):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.1)
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    # Fallback to ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


class BrowserManager:
    """Thread-safe Singleton runtime manager for Playwright browser execution.
    
    Uses a dedicated worker thread for all Playwright interactions to avoid
    greenlet cross-thread switching issues across AnyIO / FastAPI thread pools.
    """

    _instance: BrowserManager | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self.screenshots_dir = SCREENSHOTS_DIR
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        self.portal_port = 8000
        self.base_url = f"http://127.0.0.1:{self.portal_port}"
        self._server_thread: threading.Thread | None = None
        self._server: uvicorn.Server | None = None

        self._activity_log: list[dict[str, Any]] = []

        # Thread dispatch queue
        self._work_queue: queue.Queue[tuple[Callable, tuple, dict, Future] | None] = queue.Queue()
        self._worker_thread = threading.Thread(target=self._worker_loop, daemon=True, name="PlaywrightWorker")
        self._worker_thread.start()

    @classmethod
    def get_instance(cls) -> BrowserManager:
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _worker_loop(self) -> None:
        """Dedicated thread owning Playwright lifecycle and greenlet context."""
        playwright: Playwright | None = None
        browser: Browser | None = None
        session: BrowserSession | None = None

        try:
            playwright = sync_playwright().start()
            browser = playwright.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            session = BrowserSession(browser, self.screenshots_dir)

            while True:
                item = self._work_queue.get()
                if item is None:
                    break

                func, args, kwargs, future = item
                try:
                    result = func(session, *args, **kwargs)
                    future.set_result(result)
                except Exception as exc:
                    future.set_exception(exc)
                finally:
                    self._work_queue.task_done()
        finally:
            if session:
                session.close()
            if browser:
                browser.close()
            if playwright:
                playwright.stop()

    def _dispatch(self, func: Callable, *args: Any, **kwargs: Any) -> Any:
        self.ensure_portal_server()
        future: Future = Future()
        self._work_queue.put((func, args, kwargs, future))
        return future.result(timeout=25.0)

    def ensure_portal_server(self) -> None:
        """Ensures the sandbox portal server is active and responding to HTTP requests."""
        if _is_portal_healthy(self.portal_port):
            return

        with self._lock:
            if _is_portal_healthy(self.portal_port):
                return

            chosen_port = _find_free_port(8000)
            self.portal_port = chosen_port
            self.base_url = f"http://127.0.0.1:{chosen_port}"

            from backend.app.main import app

            config = uvicorn.Config(
                app=app,
                host="127.0.0.1",
                port=chosen_port,
                log_level="error",
                access_log=False,
            )
            self._server = uvicorn.Server(config)
            self._server_thread = threading.Thread(target=self._server.run, daemon=True)
            self._server_thread.start()

            for _ in range(50):
                if _is_portal_healthy(self.portal_port):
                    break
                time.sleep(0.05)

    def open_page(self, url: str) -> dict[str, Any]:
        def _open(session: BrowserSession, target_url: str) -> dict[str, Any]:
            start = time.perf_counter()
            if target_url.startswith("/") and not target_url.startswith("/portal"):
                target_url = f"/portal{target_url}"

            session.navigate(target_url, self.base_url)
            duration_ms = max(5, int((time.perf_counter() - start) * 1000))

            shot_name = f"nav_{uuid4().hex[:8]}"
            session.take_screenshot(shot_name)

            obs = extract_page_observation(
                session.page,
                action_result=f"Navigated to {target_url}",
                screenshot_name=shot_name,
            )
            self._record_activity("browser_open", target_url, f"Navigate to {target_url}", "SUCCESS", duration_ms, shot_name)
            return obs.to_dict()

        return self._dispatch(_open, url)

    def observe(self) -> dict[str, Any]:
        def _observe(session: BrowserSession) -> dict[str, Any]:
            obs = extract_page_observation(session.page, action_result="Page observed")
            return obs.to_dict()

        return self._dispatch(_observe)

    def click(self, selector: str, target: str | None = None) -> dict[str, Any]:
        def _click(session: BrowserSession, sel: str, tgt: str | None) -> dict[str, Any]:
            start = time.perf_counter()
            target_name = tgt or sel

            try:
                loc = resolve_locator(session.page, sel, tgt)
                if loc.is_disabled():
                    text = (loc.inner_text() or "").strip()
                    shot_name = f"click_{uuid4().hex[:8]}"
                    session.take_screenshot(shot_name)
                    obs = extract_page_observation(
                        session.page,
                        action_result=f"Element '{target_name}' is disabled/already processed ({text})",
                        screenshot_name=shot_name,
                        extra={"action": "click", "target": target_name, "url_after": session.page.url, "disabled": True},
                    )
                    self._record_activity("browser_click", session.page.url, target_name, "SUCCESS", 10, shot_name)
                    return obs.to_dict()

                loc.click(timeout=8000)
                session.page.wait_for_timeout(300)
                duration_ms = max(5, int((time.perf_counter() - start) * 1000))

                shot_name = f"click_{uuid4().hex[:8]}"
                session.take_screenshot(shot_name)

                obs = extract_page_observation(
                    session.page,
                    action_result=f"Clicked '{target_name}'",
                    screenshot_name=shot_name,
                    extra={"action": "click", "target": target_name, "url_after": session.page.url},
                )
                self._record_activity("browser_click", session.page.url, target_name, "SUCCESS", duration_ms, shot_name)
                return obs.to_dict()
            except ElementNotFoundError:
                duration_ms = max(5, int((time.perf_counter() - start) * 1000))
                self._record_activity("browser_click", session.page.url, target_name, "FAILED", duration_ms, None)
                raise
            except Exception as exc:
                duration_ms = max(5, int((time.perf_counter() - start) * 1000))
                self._record_activity("browser_click", session.page.url, target_name, "FAILED", duration_ms, None)
                if "timeout" in str(exc).lower():
                    raise ActionTimeoutError("click", target_name, 8000) from exc
                raise BrowserError(f"Click failed on '{target_name}': {exc}") from exc

        return self._dispatch(_click, selector, target)

    def type_text(self, selector: str, text: str) -> dict[str, Any]:
        def _type(session: BrowserSession, sel: str, val: str) -> dict[str, Any]:
            start = time.perf_counter()
            try:
                loc = resolve_locator(session.page, sel)
                loc.fill(val, timeout=8000)
                session.page.wait_for_timeout(100)
                duration_ms = max(5, int((time.perf_counter() - start) * 1000))

                obs = extract_page_observation(
                    session.page,
                    action_result=f"Typed text into {sel}",
                    extra={"action": "type", "selector": sel, "value": val},
                )
                self._record_activity("browser_type", session.page.url, f"{sel} -> {val}", "SUCCESS", duration_ms, None)
                return obs.to_dict()
            except ElementNotFoundError:
                raise
            except Exception as exc:
                raise BrowserError(f"Type failed on '{sel}': {exc}") from exc

        return self._dispatch(_type, selector, text)

    def extract(self, selector: str | None = None) -> dict[str, Any]:
        def _extract(session: BrowserSession, sel: str | None) -> dict[str, Any]:
            if not sel:
                return extract_page_observation(session.page).to_dict()

            loc = resolve_locator(session.page, sel)
            text = loc.inner_text()
            return {
                "selector": sel,
                "text": text,
                "action_result": f"Extracted content from {sel}",
                "url": session.page.url,
            }

        return self._dispatch(_extract, selector)

    def take_screenshot(self, name: str | None = None) -> dict[str, Any]:
        def _shot(session: BrowserSession, shot_name: str | None) -> dict[str, Any]:
            s_name = shot_name or f"shot_{uuid4().hex[:8]}"
            filepath = session.take_screenshot(s_name)
            return {
                "screenshot_name": f"{s_name}.png",
                "path": str(filepath),
                "url": session.page.url,
                "action_result": "Screenshot captured successfully",
            }

        return self._dispatch(_shot, name)

    def go_back(self) -> dict[str, Any]:
        def _back(session: BrowserSession) -> dict[str, Any]:
            session.page.go_back(wait_until="domcontentloaded")
            return extract_page_observation(session.page).to_dict()

        return self._dispatch(_back)

    def wait(self, ms: int = 500) -> dict[str, Any]:
        def _wait(session: BrowserSession, wait_ms: int) -> dict[str, Any]:
            session.page.wait_for_timeout(min(max(wait_ms, 50), 5000))
            return extract_page_observation(session.page).to_dict()

        return self._dispatch(_wait, ms)

    def _record_activity(
        self,
        tool: str,
        url: str,
        target: str,
        status: str,
        duration_ms: int,
        screenshot_name: str | None = None,
    ) -> None:
        event = {
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "tool": tool,
            "url": url,
            "target": target,
            "status": status,
            "duration_ms": duration_ms,
            "screenshot_url": f"/api/screenshots/{screenshot_name}.png" if screenshot_name else None,
        }
        self._activity_log.append(event)

    def get_activity_log(self) -> list[dict[str, Any]]:
        return list(self._activity_log)

    def close(self) -> None:
        self._work_queue.put(None)
        self._worker_thread.join(timeout=2.0)


browser_manager = BrowserManager.get_instance()
