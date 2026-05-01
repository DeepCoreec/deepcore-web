"""Check local version mobile layout."""
import time
from playwright.sync_api import sync_playwright

local = "file:///C:/Users/adaria/Desktop/DeepCore/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    page.goto(local, wait_until="domcontentloaded", timeout=15000)
    time.sleep(2)

    info = page.evaluate("""() => {
        const grid = document.querySelector('.svc-grid');
        const c = window.getComputedStyle(grid);
        return {
            cols: c.gridTemplateColumns,
            width: grid.offsetWidth,
            windowW: window.innerWidth,
            matches768: window.matchMedia('(max-width:768px)').matches
        };
    }""")
    print("Grid cols:", info['cols'])
    print("Grid width:", info['width'])
    print("Window width:", info['windowW'])
    print("Matches 768px query:", info['matches768'])

    page.evaluate("document.getElementById('servicios')?.scrollIntoView()")
    page.wait_for_timeout(600)
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/mobile_local.png")
    print("Screenshot saved.")
    browser.close()
