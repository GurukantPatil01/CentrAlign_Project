#!/usr/bin/env python3
"""
Automated Demo Video Recorder for CentrAlign Autonomous AI Task Worker.
Uses Playwright to capture a smooth, high-resolution video of the complete workflow:
1. Loading the Flagship Company X prompt
2. Real-time browser navigation, DOM inspection & extraction
3. Pausing at the corporate policy threshold (₹128,450 >= ₹100,000)
4. Human supervisor granting digital authorization
5. Portal payment dispatch & independent verification (5/5 checks passed)
6. Reviewing the Submission Deliverables dossier (Architecture, Decisions, Criteria)
"""

import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

OUTPUT_DIR = Path("demo_video")
VIDEO_NAME = "autonomous_ai_worker_demo.webm"


async def record_demo():
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("🎬 STARTING AUTOMATED DEMO RECORDING")
    print("=" * 60)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={"width": 1440, "height": 900},
        )

        page = await context.new_page()

        print("1. Navigating to Autonomous AI Task Worker Console (http://localhost:3000)...")
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(3000)

        # Ensure we are on the new-task console
        print("2. Displaying New Task Operations Console with Flagship Presets...")
        await page.wait_for_timeout(2000)

        # Locate the Company X scenario card
        print("3. Loading Flagship: Company X Invoice Extraction & Entry Scenario...")
        company_x_btn = page.locator("button:has-text('Company X')").first
        if await company_x_btn.count() > 0:
            await company_x_btn.click()
            await page.wait_for_timeout(1500)

        # Click Execute Autonomous Task
        print("4. Executing Autonomous Worker Pipeline...")
        run_btn = page.locator("button:has-text('Execute Autonomous Task')").first
        if await run_btn.count() > 0:
            await run_btn.click()
        else:
            # Fallback: click Run Flagship Demo in header
            demo_btn = page.locator("button:has-text('Flagship')").first
            if await demo_btn.count() > 0:
                await demo_btn.click()

        # Switch to active-task view
        print("5. Monitoring live autonomous execution steps (Browser, DOM extraction, Policy)...")
        for _ in range(30):
            await page.wait_for_timeout(500)
            # Check if approval banner is visible
            approval_banner = page.locator("button:has-text('Authorize & Proceed')")
            if await approval_banner.count() > 0 and await approval_banner.is_visible():
                print(">>> 🛑 Corporate Policy Gate Reached: Invoice amount ₹128,450 >= ₹100,000 threshold.")
                print(">>> 👤 Execution paused in state 'waiting_approval' awaiting supervisor sign-off.")
                await page.wait_for_timeout(3000)  # Pause so viewer clearly sees the approval banner

                print(">>> ✍️ Supervisor granting digital authorization...")
                await approval_banner.click()
                print(">>> ✅ Authorization granted! Resuming worker execution...")
                break

        # Wait for task completion
        print("6. Waiting for portal payment execution and independent verification...")
        for _ in range(30):
            await page.wait_for_timeout(500)
            completed_badge = page.locator("span:has-text('COMPLETED'), span:has-text('COMPLETE')")
            if await completed_badge.count() > 0:
                print(">>> 🎯 Task Completed & Independently Verified!")
                break

        await page.wait_for_timeout(4000)  # Showcase verified certificate and summary

        # Navigate to Submission Deliverables Dossier
        print("7. Navigating to Submission Deliverables & Technical Dossier...")
        deliverables_btn = page.locator("button[title*='Submission Deliverables']").first
        if await deliverables_btn.count() > 0:
            await deliverables_btn.click()
            await page.wait_for_timeout(2500)

            # Click Architecture Tab
            print("   - Showcasing System Architecture...")
            arch_tab = page.locator("button:has-text('Architecture')").first
            if await arch_tab.count() > 0:
                await arch_tab.click()
                await page.wait_for_timeout(2500)

            # Click Technical Decisions Tab
            print("   - Showcasing Technical Decisions & Rationale...")
            dec_tab = page.locator("button:has-text('Technical Decisions')").first
            if await dec_tab.count() > 0:
                await dec_tab.click()
                await page.wait_for_timeout(2500)

            # Click Evaluation Criteria Tab
            print("   - Showcasing Evaluation Criteria Alignment...")
            crit_tab = page.locator("button:has-text('Evaluation Criteria')").first
            if await crit_tab.count() > 0:
                await crit_tab.click()
                await page.wait_for_timeout(2500)

        print("8. Finalizing video capture...")
        await page.wait_for_timeout(2000)

        # Close context to write out video file
        video_path = await page.video.path()
        await context.close()
        await browser.close()

        final_dest = OUTPUT_DIR / VIDEO_NAME
        if os.path.exists(video_path):
            shutil.move(video_path, final_dest)
            file_size_mb = round(final_dest.stat().st_size / (1024 * 1024), 2)
            print("=" * 60)
            print(f"🎉 DEMO VIDEO RECORDED SUCCESSFULLY!")
            print(f"📁 Video Location: {final_dest.resolve()}")
            print(f"📊 Video Size: {file_size_mb} MB")
            print("=" * 60)
            return final_dest

    return None


if __name__ == "__main__":
    asyncio.run(record_demo())
