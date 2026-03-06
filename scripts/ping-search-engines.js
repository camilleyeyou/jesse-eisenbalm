/**
 * ping-search-engines.js
 *
 * Notifies search engines about sitemap updates after each build:
 * 1. Google Sitemap Ping (deprecated but still processed)
 * 2. IndexNow API (Bing, Yandex, Seznam, Naver)
 *
 * Run after sitemap generation: node scripts/ping-search-engines.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://jesseaeisenbalm.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

async function pingSitemap() {
  // Google sitemap ping was deprecated June 2023.
  // Google now discovers sitemap updates via crawling.
  // Primary notification channel: IndexNow (Bing, Yandex, etc.)
  // For Google specifically: use Search Console API or manual "Request Indexing".
  console.log('ℹ️  Google sitemap ping deprecated — relying on crawl-based discovery + IndexNow');
}

async function submitIndexNow() {
  if (!INDEXNOW_KEY) {
    console.log('ℹ️  INDEXNOW_KEY not set — skipping IndexNow submission');
    console.log('   To enable: set INDEXNOW_KEY env var and place key file at public/{key}.txt');
    return;
  }

  // Parse sitemap to get all URLs
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn('⚠️  sitemap.xml not found — skipping IndexNow');
    return;
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

  if (!urls.length) {
    console.log('ℹ️  No URLs in sitemap — skipping IndexNow');
    return;
  }

  // IndexNow batch API (max 10,000 URLs per request)
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'jesseaeisenbalm.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls
      })
    });
    console.log(`📡 IndexNow submission: ${res.status} ${res.statusText} (${urls.length} URLs)`);
  } catch (err) {
    console.warn(`⚠️  IndexNow submission failed: ${err.message}`);
  }
}

async function main() {
  console.log('🔔 Pinging search engines...');
  await Promise.all([pingSitemap(), submitIndexNow()]);
  console.log('✅ Search engine notifications complete');
}

main().catch(err => {
  console.error('❌ Search engine ping failed:', err.message);
});
