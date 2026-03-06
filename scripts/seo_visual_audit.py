from playwright.sync_api import sync_playwright
import json
import os

SCREENSHOTS_DIR = "/Users/user/jesse-eisenbalm/screenshots"
BASE_URL = "https://jesseaeisenbalm.com"

PAGES = [
    {"name": "homepage", "path": "/"},
    {"name": "blog", "path": "/blog"},
]

VIEWPORTS = [
    {"name": "mobile", "width": 375, "height": 812},
    {"name": "desktop", "width": 1920, "height": 1080},
]

WAIT_UNTIL = "load"
TIMEOUT = 60000

def audit_page(page, url, name, viewport_name):
    results = {}
    output_path = os.path.join(SCREENSHOTS_DIR, f"{name}_{viewport_name}.png")
    page.screenshot(path=output_path, full_page=False)
    print(f"  Saved: {output_path}")
    full_path = os.path.join(SCREENSHOTS_DIR, f"{name}_{viewport_name}_full.png")
    page.screenshot(path=full_path, full_page=True)
    print(f"  Saved: {full_path}")

    h1_elements = page.query_selector_all("h1")
    results["h1_count"] = len(h1_elements)
    results["h1_texts"] = [h.inner_text() for h in h1_elements]
    if h1_elements:
        h1_box = h1_elements[0].bounding_box()
        if h1_box:
            results["h1_above_fold"] = h1_box["y"] + h1_box["height"] < page.viewport_size["height"]
            results["h1_position_y"] = h1_box["y"]
        else:
            results["h1_above_fold"] = False

    cta_selectors = [
        "a[href*='contact']", "a[href*='book']", "a[href*='schedule']",
        "a[href*='get-started']", "a[href*='free']",
        ".cta", "[class*='cta']", "[class*='CTA']",
        "a:has-text('Contact')", "a:has-text('Book')",
    ]
    cta_found = []
    for sel in cta_selectors:
        try:
            els = page.query_selector_all(sel)
            for el in els:
                box = el.bounding_box()
                if box:
                    above = box["y"] + box["height"] < page.viewport_size["height"]
                    text = el.inner_text().strip()[:80]
                    if text:
                        cta_found.append({"text": text, "above_fold": above, "y": round(box["y"])})
        except:
            pass
    seen = set()
    unique_ctas = []
    for c in cta_found:
        if c["text"] not in seen:
            seen.add(c["text"])
            unique_ctas.append(c)
    results["ctas"] = unique_ctas

    images = page.query_selector_all("img")
    img_audit = []
    for img in images:
        src = img.get_attribute("src") or ""
        alt = img.get_attribute("alt")
        img_audit.append({"src": src[:100], "has_alt": alt is not None and alt.strip() != "", "alt": (alt or "")[:100]})
    results["images"] = img_audit
    results["images_missing_alt"] = [i for i in img_audit if not i["has_alt"]]

    nav = page.query_selector("nav")
    results["has_nav"] = nav is not None
    if nav:
        nav_box = nav.bounding_box()
        results["nav_visible"] = nav_box is not None
        nav_links = nav.query_selector_all("a")
        results["nav_link_count"] = len(nav_links)
        results["nav_links"] = [a.inner_text().strip() for a in nav_links if a.inner_text().strip()]

    hamburger_selectors = [
        "[class*='hamburger']", "[class*='menu-toggle']", "[class*='mobile-menu']",
        "[aria-label*='menu']", "[aria-label*='Menu']", "button.menu",
        "[class*='MenuIcon']", "[class*='menuIcon']", "[class*='burger']",
    ]
    results["hamburger_found"] = False
    for sel in hamburger_selectors:
        try:
            if page.query_selector(sel):
                results["hamburger_found"] = True
                break
        except:
            pass

    body_font = page.evaluate("""() => {
        const body = document.querySelector('body');
        return body ? window.getComputedStyle(body).fontSize : null;
    }""")
    results["body_font_size"] = body_font

    has_overflow = page.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
    results["has_horizontal_overflow"] = has_overflow

    meta_desc = page.evaluate("""() => {
        const el = document.querySelector('meta[name="description"]');
        return el ? el.getAttribute('content') : null;
    }""")
    results["meta_description"] = meta_desc
    results["page_title"] = page.title()

    ld_json = page.evaluate("""() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        return Array.from(scripts).map(s => s.textContent);
    }""")
    results["structured_data_count"] = len(ld_json)

    contrast_info = page.evaluate("""() => {
        const els = document.querySelectorAll('h1, h2, p, a, button');
        const results = [];
        for (let i = 0; i < Math.min(els.length, 20); i++) {
            const s = window.getComputedStyle(els[i]);
            results.push({
                tag: els[i].tagName,
                text: els[i].textContent.trim().substring(0, 50),
                color: s.color,
                bg: s.backgroundColor,
                fontSize: s.fontSize,
            });
        }
        return results;
    }""")
    results["contrast_samples"] = contrast_info

    return results

def find_blog_post(page):
    page.goto(f"{BASE_URL}/blog", wait_until=WAIT_UNTIL, timeout=TIMEOUT)
    page.wait_for_timeout(3000)
    links = page.query_selector_all("a[href*='/blog/']")
    for link in links:
        href = link.get_attribute("href")
        if href and href != "/blog" and href != "/blog/":
            return href if href.startswith("http") else BASE_URL + href
    return None

def main():
    all_results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        temp_page = browser.new_page()
        blog_post_url = find_blog_post(temp_page)
        temp_page.close()
        if blog_post_url:
            print(f"Found blog post: {blog_post_url}")
            PAGES.append({"name": "blog_post", "path": blog_post_url.replace(BASE_URL, "")})
        else:
            print("No blog post found")

        for vp in VIEWPORTS:
            print(f"\n=== Viewport: {vp['name']} ({vp['width']}x{vp['height']}) ===")
            page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
            for pg in PAGES:
                url = BASE_URL + pg["path"]
                print(f"\nAuditing: {url}")
                try:
                    page.goto(url, wait_until=WAIT_UNTIL, timeout=TIMEOUT)
                    page.wait_for_timeout(3000)
                    key = f"{pg['name']}_{vp['name']}"
                    all_results[key] = audit_page(page, url, pg["name"], vp["name"])
                except Exception as e:
                    print(f"  ERROR: {e}")
                    all_results[f"{pg['name']}_{vp['name']}"] = {"error": str(e)}
            page.close()
        browser.close()

    output_file = os.path.join(SCREENSHOTS_DIR, "audit_results.json")
    with open(output_file, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\nResults saved to: {output_file}")

if __name__ == "__main__":
    main()
