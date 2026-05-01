"""Check what CSS rules are actually applied to svc-grid on mobile."""
from playwright.sync_api import sync_playwright

url = "https://deepcoreec.github.io/deepcore-web/"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        page.wait_for_load_state("networkidle", timeout=6000)
    except:
        pass

    info = page.evaluate("""() => {
        const grid = document.querySelector('.svc-grid');
        const computed = window.getComputedStyle(grid);

        // Check all stylesheets for svc-grid rules
        const rules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    const text = rule.cssText || '';
                    if (text.includes('svc-grid')) {
                        rules.push(text.slice(0, 200));
                    }
                }
            } catch(e) {}
        }

        return {
            windowInnerWidth: window.innerWidth,
            computedGridCols: computed.gridTemplateColumns,
            matchesMedia768: window.matchMedia('(max-width: 768px)').matches,
            matchesMedia1024: window.matchMedia('(max-width: 1024px)').matches,
            rulesFound: rules
        };
    }""")

    print(f"window.innerWidth: {info['windowInnerWidth']}")
    print(f"matches (max-width:768px): {info['matchesMedia768']}")
    print(f"matches (max-width:1024px): {info['matchesMedia1024']}")
    print(f"computed grid-template-columns: {info['computedGridCols']}")
    print(f"\nCSS rules for svc-grid:")
    for r in info['rulesFound']:
        print(f"  {r}")

    browser.close()
