from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from playwright.sync_api import Locator, Page

from backend.app.browser.errors import ElementNotFoundError


def resolve_locator(page: Page, selector: str, target: str | None = None) -> Locator:
    """Resolve a target element using resilient selector strategies with semantic fallbacks.
    
    Tries:
    1. Exact selector
    2. [data-testid="{target}"]
    3. [aria-label="{target}"]
    4. Button/link with matching text
    5. Case-insensitive text search
    """
    candidates = [selector]
    effective_target = target or selector

    # If selector looks like a pure identifier or text, generate smart variations
    clean_target = effective_target.strip("[]\"'")
    if clean_target.startswith("data-testid="):
        clean_target = clean_target.split("=", 1)[1].strip("\"'")

    candidates.extend([
        f"[data-testid='{clean_target}']",
        f"[data-testid*='{clean_target}']",
        f"[aria-label='{clean_target}']",
        f"button:has-text('{clean_target}')",
        f"a:has-text('{clean_target}')",
        f"text='{clean_target}'",
    ])

    # If target has words like "Process Invoice"
    words = clean_target.replace("-", " ").replace("_", " ").title()
    candidates.extend([
        f"button:has-text('{words}')",
        f"a:has-text('{words}')",
        f"text='{words}'",
    ])

    for cand in candidates:
        try:
            loc = page.locator(cand).first
            if loc.count() > 0 and loc.is_visible():
                return loc
        except Exception:
            continue

    # Second pass: check if element is present in DOM even if slightly off-viewport
    for cand in candidates:
        try:
            loc = page.locator(cand).first
            if loc.count() > 0:
                return loc
        except Exception:
            continue

    raise ElementNotFoundError(selector=selector, target=target)
