from __future__ import annotations

from typing import Any

from backend.app.browser.manager import browser_manager


def browser_open(url: str) -> dict[str, Any]:
    return browser_manager.open_page(url)


def browser_observe() -> dict[str, Any]:
    return browser_manager.observe()


def browser_click(selector: str, target: str | None = None) -> dict[str, Any]:
    return browser_manager.click(selector, target)


def browser_type(selector: str, text: str) -> dict[str, Any]:
    return browser_manager.type_text(selector, text)


def browser_select(selector: str, value: str) -> dict[str, Any]:
    session = browser_manager.get_session()
    loc = session.page.locator(selector).first
    loc.select_option(value=value)
    return browser_observe()


def browser_extract(selector: str | None = None) -> dict[str, Any]:
    return browser_manager.extract(selector)


def browser_screenshot(name: str | None = None) -> dict[str, Any]:
    return browser_manager.take_screenshot(name)


def browser_back() -> dict[str, Any]:
    return browser_manager.go_back()


def browser_wait(ms: int = 500) -> dict[str, Any]:
    return browser_manager.wait(ms)
