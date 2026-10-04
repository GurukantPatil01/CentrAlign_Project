from __future__ import annotations

import os
from pathlib import Path
from typing import TYPE_CHECKING
from urllib.parse import urlparse

from backend.app.browser.errors import InvalidInputError, NavigationTimeoutError, PageNotFoundError

if TYPE_CHECKING:
    from playwright.sync_api import Browser, BrowserContext, Page


ALLOWED_DOMAINS = {"localhost", "127.0.0.1", "0.0.0.0"}


class BrowserSession:
    """Manages an isolated, sandboxed browser context and page."""

    def __init__(self, browser: Browser, screenshots_dir: Path) -> None:
        self.browser = browser
        self.screenshots_dir = screenshots_dir
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        self.context: BrowserContext = self.browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="CentrAlignEnterpriseWorker/1.0",
        )
        self.page: Page = self.context.new_page()

    def validate_url(self, url: str, base_url: str) -> str:
        """Enforces security boundaries: restricts navigation to sandbox origins only."""
        if url.startswith("/"):
            # Relative URL resolved against base portal URL
            clean_base = base_url.rstrip("/")
            return f"{clean_base}{url}"

        parsed = urlparse(url)
        if not parsed.scheme or parsed.scheme not in ("http", "https"):
            raise InvalidInputError(f"Disallowed URL scheme: {parsed.scheme}")

        hostname = parsed.hostname or ""
        if hostname not in ALLOWED_DOMAINS and not hostname.endswith(".internal"):
            raise InvalidInputError(
                f"Security boundary violation: External navigation to '{hostname}' blocked. "
                f"Worker is strictly restricted to enterprise sandbox domains."
            )
        return url

    def navigate(self, url: str, base_url: str, timeout_ms: int = 10000) -> None:
        target_url = self.validate_url(url, base_url)
        try:
            response = self.page.goto(target_url, timeout=timeout_ms, wait_until="domcontentloaded")
            if response and response.status == 404:
                raise PageNotFoundError(target_url)
        except Exception as exc:
            if "timeout" in str(exc).lower():
                raise NavigationTimeoutError(target_url, timeout_ms) from exc
            if isinstance(exc, (PageNotFoundError, InvalidInputError)):
                raise
            raise

    def take_screenshot(self, name: str) -> Path:
        """Capture screenshot checkpoint to safe screenshots directory."""
        filename = f"{name}.png"
        filepath = self.screenshots_dir / filename
        self.page.screenshot(path=str(filepath), full_page=False)
        return filepath

    def close(self) -> None:
        try:
            self.page.close()
        except Exception:
            pass
        try:
            self.context.close()
        except Exception:
            pass
