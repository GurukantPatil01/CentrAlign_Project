from __future__ import annotations


class BrowserError(Exception):
    """Base error for browser runtime exceptions."""

    def __init__(self, message: str, code: str = "BROWSER_ERROR") -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class ElementNotFoundError(BrowserError):
    def __init__(self, selector: str, target: str | None = None) -> None:
        desc = f"'{target}' ({selector})" if target else f"'{selector}'"
        super().__init__(f"Element not found on page: {desc}", code="ELEMENT_NOT_FOUND")
        self.selector = selector
        self.target = target


class PageNotFoundError(BrowserError):
    def __init__(self, url: str) -> None:
        super().__init__(f"Page not found (HTTP 404): {url}", code="PAGE_NOT_FOUND")
        self.url = url


class NavigationTimeoutError(BrowserError):
    def __init__(self, url: str, timeout_ms: int) -> None:
        super().__init__(f"Navigation to {url} timed out after {timeout_ms}ms", code="NAVIGATION_TIMEOUT")
        self.url = url
        self.timeout_ms = timeout_ms


class StalePageError(BrowserError):
    def __init__(self, message: str = "DOM element is stale or page context disconnected") -> None:
        super().__init__(message, code="STALE_PAGE")


class ActionTimeoutError(BrowserError):
    def __init__(self, action: str, target: str, timeout_ms: int) -> None:
        super().__init__(f"Action '{action}' on '{target}' timed out after {timeout_ms}ms", code="ACTION_TIMEOUT")
        self.action = action
        self.target = target
        self.timeout_ms = timeout_ms


class InvalidInputError(BrowserError):
    def __init__(self, message: str) -> None:
        super().__init__(message, code="INVALID_INPUT")


class BrowserCrashError(BrowserError):
    def __init__(self, message: str = "Browser process crashed unexpectedly") -> None:
        super().__init__(message, code="BROWSER_CRASH")


class SessionExpiredError(BrowserError):
    def __init__(self, message: str = "Browser session or context has expired") -> None:
        super().__init__(message, code="SESSION_EXPIRED")
