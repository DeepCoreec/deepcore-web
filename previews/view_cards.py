from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    page.goto("file:///C:/Users/adaria/Desktop/DeepCore/index.html", wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(1500)
    page.evaluate("document.getElementById('servicios').scrollIntoView()")
    page.wait_for_timeout(500)
    # screenshot 1: top of services
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/c1.png")
    page.evaluate("window.scrollBy(0, 700)")
    page.wait_for_timeout(300)
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/c2.png")
    page.evaluate("window.scrollBy(0, 700)")
    page.wait_for_timeout(300)
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/c3.png")
    page.evaluate("window.scrollBy(0, 700)")
    page.wait_for_timeout(300)
    page.screenshot(path="C:/Users/adaria/Desktop/DeepCore/previews/imgs/c4.png")
    print("done")
    browser.close()
