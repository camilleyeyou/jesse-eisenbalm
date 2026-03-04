from playwright.sync_api import sync_playwright
import json

URL = "https://jesseaeisenbalm.com"
OUT = "/Users/user/jesse-eisenbalm/screenshots"

def analyze(url):
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # --- MOBILE (375x812) ---
        mobile_page = browser.new_page(viewport={'width': 375, 'height': 812}, device_scale_factor=2,
                                        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15")
        mobile_page.goto(url, wait_until='load', timeout=60000)
        mobile_page.wait_for_timeout(3000)
        mobile_page.screenshot(path=f"{OUT}/mobile_above_fold.png", full_page=False)
        mobile_page.screenshot(path=f"{OUT}/mobile_full_page.png", full_page=True)

        mobile_metrics = mobile_page.evaluate("""() => {
            const body = document.body;
            const html = document.documentElement;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const hasHScroll = body.scrollWidth > vw || html.scrollWidth > vw;

            const h1 = document.querySelector('h1');
            const h1Text = h1 ? h1.innerText : 'NO H1 FOUND';
            const h1Rect = h1 ? h1.getBoundingClientRect() : null;
            const h1Visible = h1Rect ? (h1Rect.top < vh && h1Rect.bottom > 0) : false;

            const clickables = [...document.querySelectorAll('a, button, input[type="submit"], [role="button"], .btn')];
            const smallTargets = [];
            clickables.forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) {
                    smallTargets.push({ tag: el.tagName, text: (el.innerText || el.getAttribute('aria-label') || '').substring(0, 50), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) });
                }
            });

            const textEls = [...document.querySelectorAll('p, span, li, a, h1, h2, h3, h4, h5, h6, label, td, th')];
            const fontSizes = {};
            textEls.forEach(el => { const s = window.getComputedStyle(el).fontSize; fontSizes[s] = (fontSizes[s]||0)+1; });

            const ctaKW = ['shop', 'buy', 'add to cart', 'order', 'get', 'subscribe'];
            const aboveFoldCTAs = clickables.filter(el => {
                const r = el.getBoundingClientRect();
                const t = (el.innerText || '').toLowerCase();
                return r.top < vh && ctaKW.some(kw => t.includes(kw));
            }).map(el => ({ text: el.innerText.substring(0, 60), tag: el.tagName, top: Math.round(el.getBoundingClientRect().top) }));

            const nav = document.querySelector('nav, [role="navigation"], .nav, .navbar, .menu, #nav, #menu');
            const hamburger = document.querySelector('.hamburger, .menu-toggle, [aria-label*="menu"], .navbar-toggler, button[class*="menu"]');
            const metaVP = document.querySelector('meta[name="viewport"]');

            const aboveFold = [];
            document.querySelectorAll('h1, h2, h3, p, img, a, button').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.top >= 0 && r.top < vh && r.width > 0) {
                    aboveFold.push({ tag: el.tagName, text: (el.innerText || el.getAttribute('alt') || '').substring(0, 80), top: Math.round(r.top), classes: el.className ? String(el.className).substring(0, 100) : '' });
                }
            });

            return { viewportWidth: vw, viewportHeight: vh, hasHorizontalScroll: hasHScroll, h1Text, h1Visible, smallTargets: smallTargets.slice(0, 25), fontSizes, aboveFoldCTAs, hasNav: !!nav, hasHamburger: !!hamburger, metaViewport: metaVP ? metaVP.getAttribute('content') : 'MISSING', aboveFoldElements: aboveFold.slice(0, 30), pageTitle: document.title, bodyScrollWidth: body.scrollWidth, htmlScrollWidth: html.scrollWidth };
        }""")
        results['mobile'] = mobile_metrics
        mobile_page.close()

        # --- DESKTOP (1440x900) ---
        desktop_page = browser.new_page(viewport={'width': 1440, 'height': 900})
        desktop_page.goto(url, wait_until='load', timeout=60000)
        desktop_page.wait_for_timeout(3000)
        desktop_page.screenshot(path=f"{OUT}/desktop_above_fold.png", full_page=False)
        desktop_page.screenshot(path=f"{OUT}/desktop_full_page.png", full_page=True)

        desktop_metrics = desktop_page.evaluate("""() => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            const h1 = document.querySelector('h1');
            const h1Text = h1 ? h1.innerText : 'NO H1 FOUND';
            const h1Rect = h1 ? h1.getBoundingClientRect() : null;
            const h1Visible = h1Rect ? (h1Rect.top < vh && h1Rect.bottom > 0) : false;

            const aboveFold = [];
            document.querySelectorAll('h1, h2, h3, p, img, a, button').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.top >= 0 && r.top < vh && r.width > 0) {
                    aboveFold.push({ tag: el.tagName, text: (el.innerText || el.getAttribute('alt') || '').substring(0, 80), top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) });
                }
            });

            const ctaKW = ['shop', 'buy', 'add to cart', 'order', 'get', 'subscribe'];
            const clickables = [...document.querySelectorAll('a, button, [role="button"], .btn')];
            const aboveFoldCTAs = clickables.filter(el => {
                const r = el.getBoundingClientRect();
                const t = (el.innerText || '').toLowerCase();
                return r.top < vh && ctaKW.some(kw => t.includes(kw));
            }).map(el => ({ text: el.innerText.substring(0, 60), tag: el.tagName, top: Math.round(el.getBoundingClientRect().top), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));

            const images = [...document.querySelectorAll('img')].filter(img => {
                const r = img.getBoundingClientRect();
                return r.top < vh && r.bottom > 0 && r.width > 0;
            }).map(img => ({ src: img.src.substring(0, 120), alt: img.getAttribute('alt') || 'NO ALT', width: Math.round(img.getBoundingClientRect().width), height: Math.round(img.getBoundingClientRect().height), naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, loading: img.getAttribute('loading') || 'default' }));

            const textEls = [...document.querySelectorAll('p, span, li, a')];
            const fontSizes = {};
            textEls.forEach(el => { const s = window.getComputedStyle(el).fontSize; fontSizes[s] = (fontSizes[s]||0)+1; });

            const navLinks = [...document.querySelectorAll('nav a, header a')].map(a => ({ text: a.innerText.substring(0, 40), href: a.getAttribute('href') || '' })).slice(0, 20);

            return { viewportWidth: vw, viewportHeight: vh, h1Text, h1Visible, aboveFoldElements: aboveFold.slice(0, 30), aboveFoldCTAs, aboveFoldImages: images, fontSizes, navLinks, pageTitle: document.title };
        }""")
        results['desktop'] = desktop_metrics
        desktop_page.close()

        browser.close()
    return results

if __name__ == '__main__':
    data = analyze(URL)
    with open(f"{OUT}/analysis_data.json", 'w') as f:
        json.dump(data, f, indent=2)
    print(json.dumps(data, indent=2))
