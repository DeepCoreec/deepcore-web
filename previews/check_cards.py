from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    page.goto("file:///C:/Users/adaria/Desktop/DeepCore/index.html", wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(1500)

    info = page.evaluate("""() => {
        const cards = [...document.querySelectorAll('.svc-card')];
        const grid = document.querySelector('.svc-grid');
        const gc = window.getComputedStyle(grid);
        return {
            gridCols: gc.gridTemplateColumns,
            gridGap: gc.gap,
            cards: cards.map((c, i) => {
                const s = window.getComputedStyle(c);
                return {
                    i,
                    height: c.offsetHeight,
                    paddingTop: s.paddingTop,
                    paddingLeft: s.paddingLeft,
                    minHeight: s.minHeight,
                    isLarge: c.classList.contains('svc-large'),
                    gridColumn: s.gridColumn
                };
            })
        };
    }""")

    print(f"Grid columns: {info['gridCols']}")
    print(f"Grid gap: {info['gridGap']}")
    for c in info['cards']:
        print(f"\nCard {c['i']} (large={c['isLarge']}): height={c['height']}px | pad={c['paddingTop']}/{c['paddingLeft']} | minH={c['minHeight']} | gridCol={c['gridColumn']}")

    browser.close()
