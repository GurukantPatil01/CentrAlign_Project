from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from playwright.sync_api import Page


@dataclass
class BrowserObservation:
    url: str
    title: str
    visible_elements: list[dict[str, Any]] = field(default_factory=list)
    text_content: str = ""
    action_result: str = "success"
    screenshot_name: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "url": self.url,
            "title": self.title,
            "visible_elements": self.visible_elements,
            "text": self.text_content[:1000] if self.text_content else "",
            "action_result": self.action_result,
            "screenshot": self.screenshot_name,
            **self.metadata,
        }


def extract_page_observation(page: Page, action_result: str = "success", screenshot_name: str | None = None, extra: dict[str, Any] | None = None) -> BrowserObservation:
    """Extract structured, observable representation of the current browser page."""
    current_url = page.url
    title = page.title()
    text_snippet = ""
    visible_elements: list[dict[str, Any]] = []

    try:
        # Extract meaningful interactive and structural elements
        elements_data = page.evaluate("""() => {
            const results = [];
            const interactive = document.querySelectorAll('button, a, input, select, tr[data-testid], [data-testid]');
            interactive.forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
                if (isVisible) {
                    results.push({
                        tag: el.tagName.toLowerCase(),
                        testid: el.getAttribute('data-testid') || '',
                        role: el.getAttribute('role') || el.tagName.toLowerCase(),
                        text: (el.innerText || el.value || el.getAttribute('placeholder') || '').trim().slice(0, 100),
                        disabled: el.hasAttribute('disabled')
                    });
                }
            });
            return {
                elements: results.slice(0, 25),
                bodyText: document.body ? document.body.innerText.slice(0, 1200) : ''
            };
        }""")
        visible_elements = elements_data.get("elements", [])
        text_snippet = elements_data.get("bodyText", "")
    except Exception:
        # Fallback if evaluation is constrained
        try:
            text_snippet = page.inner_text("body")[:500]
        except Exception:
            text_snippet = ""

    return BrowserObservation(
        url=current_url,
        title=title,
        visible_elements=visible_elements,
        text_content=text_snippet,
        action_result=action_result,
        screenshot_name=screenshot_name,
        metadata=extra or {},
    )
