"""Take screenshots of all 4 preview HTML files."""
import os
from playwright.sync_api import sync_playwright

previews_dir = os.path.dirname(os.path.abspath(__file__))
imgs_dir = os.path.join(previews_dir, "imgs")
os.makedirs(imgs_dir, exist_ok=True)

files = [
    ("preview_dark.html",  "preview_dark.png"),
    ("preview_light.html", "preview_light.png"),
    ("preview_bold.html",  "preview_bold.png"),
    ("preview_shop.html",  "preview_shop.png"),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for html_file, out_name in files:
        path = os.path.join(previews_dir, html_file)
        url  = "file:///" + path.replace("\\", "/")
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        try:
            page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            pass
        out_path = os.path.join(imgs_dir, out_name)
        page.screenshot(path=out_path, full_page=False)
        page.close()
        print(f"Saved: {out_path}")
    browser.close()
print("Done!")
