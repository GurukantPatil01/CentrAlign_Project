from __future__ import annotations

from pathlib import Path
import pytest
from backend.app.browser.errors import ElementNotFoundError
from backend.app.browser.manager import BrowserManager, browser_manager


def test_browser_full_lifecycle_and_actions():
    # 1. Open invoice page
    obs = browser_manager.open_page("/portal/invoices")
    assert "Invoices" in obs["title"]
    assert obs["url"].endswith("/portal/invoices")
    assert len(obs["visible_elements"]) > 0

    # 2. Locate invoice
    obs_elements = obs["visible_elements"]
    has_invoice_row = any("INV-1024" in el.get("testid", "") or "INV-1024" in el.get("text", "") for el in obs_elements)
    assert has_invoice_row

    # 3. Open invoice
    click_res = browser_manager.click("[data-testid='view-invoice-INV-1024']", target="View Invoice INV-1024")
    assert click_res["action"] == "click"
    assert "INV-1024" in click_res["url_after"]

    # 4. Extract invoice details
    details = browser_manager.extract("[data-testid='invoice-details']")
    assert "Acme Corp" in details["text"]
    assert "145,000" in details["text"]

    # 5. Process invoice
    proc_res = browser_manager.click("[data-testid='process-invoice']", target="Process Invoice")
    assert proc_res["action"] == "click"

    # 6. Verify UI state changes (asynchronous fetch settles)
    post_obs = browser_manager.wait(600)
    assert "PROCESSED" in post_obs.get("text", "").upper() or "PROCESSED" in str(post_obs.get("visible_elements", []))

    # 7. Screenshot checkpoint
    shot_res = browser_manager.take_screenshot("test_checkpoint")
    assert Path(shot_res["path"]).exists()
    assert shot_res["screenshot_name"] == "test_checkpoint.png"


def test_browser_missing_element_and_recovery():
    # 1. Simulate missing element with invalid selector
    with pytest.raises(ElementNotFoundError) as exc_info:
        browser_manager.click("[data-testid='non-existent-button-xyz']", target="NonExistentButton")
    assert "ELEMENT_NOT_FOUND" in exc_info.value.code

    # 2. Recovery: observe current page to locate alternative valid target
    obs = browser_manager.observe()
    assert obs["url"] != ""

    # 3. Resilient selector fallback recovers by using visible text / semantic locator
    back_res = browser_manager.click("Back to Invoices", target="Back to Invoices")
    assert back_res["action"] == "click"
    assert "/portal/invoices" in back_res["url_after"]
