"""Screenshot services section on mobile."""
from playwright.sync_api import sync_playwright

url = "https://deepcoreec.github.io/deepcore-web/"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844},
                            device_scale_factor=3,
                            is_mobile=True,
                            has_touch=True)
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        page.wait_for_load_state("networkidle", timeout=8000)
    except:
        pass

    # Scroll to services section
    page.evaluate("document.getElementById('servicios')?.scrollIntoView()")
    page.wait_for_timeout(800)
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/mobile_services.png")

    # Check computed grid columns for svc-grid
    grid_info = page.evaluate("""() => {
        const grid = document.querySelector('.svc-grid');
        if (!grid) return 'no grid found';
        const style = window.getComputedStyle(grid);
        return {
            templateColumns: style.gridTemplateColumns,
            width: grid.offsetWidth,
            scrollWidth: grid.scrollWidth,
            windowWidth: window.innerWidth
        };
    }""")
    print("Grid info:", grid_info)
    browser.close()
