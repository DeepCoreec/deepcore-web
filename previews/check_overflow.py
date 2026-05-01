"""Detect which elements cause horizontal overflow on mobile viewport."""
from playwright.sync_api import sync_playwright

url = "https://deepcoreec.github.io/deepcore-web/"

with sync_playwright() as p:
    browser = p.chromium.launch()
    # Simulate a typical Android phone
    page = browser.new_page(viewport={"width": 390, "height": 844},
                            device_scale_factor=3,
                            is_mobile=True,
                            has_touch=True)
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        page.wait_for_load_state("networkidle", timeout=8000)
    except:
        pass

    # Check document scroll width vs viewport width
    result = page.evaluate("""() => {
        const vw = window.innerWidth;
        const sw = document.documentElement.scrollWidth;
        const offenders = [];

        // Check all elements for overflow
        document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            const right = rect.left + rect.width;
            if (right > vw + 5) {
                offenders.push({
                    tag: el.tagName,
                    id: el.id || '',
                    cls: el.className ? el.className.toString().slice(0, 60) : '',
                    right: Math.round(right),
                    width: Math.round(rect.width),
                    left: Math.round(rect.left)
                });
            }
        });

        return {
            viewportWidth: vw,
            scrollWidth: sw,
            overflow: sw > vw,
            offenders: offenders.slice(0, 20)
        };
    }""")

    print(f"Viewport: {result['viewportWidth']}px")
    print(f"Scroll width: {result['scrollWidth']}px")
    print(f"Has overflow: {result['overflow']}")
    print(f"\nOffending elements ({len(result['offenders'])}):")
    for el in result['offenders']:
        print(f"  <{el['tag']}> id='{el['id']}' class='{el['cls']}'")
        print(f"    left={el['left']} width={el['width']} right={el['right']}")

    # Take screenshot for reference
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/mobile_check.png")
    browser.close()
