const fs = require('fs');
const path = require('path');
const REDIRECTED_SLUGS = require('./redirected-slugs');

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';

async function generateSitemap() {
  try {
    console.log('📍 Fetching sitemap from server...');
    const response = await fetch(`${SERVER_URL}/api/sitemap`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    let sitemapXML = await response.text();

    // Remove deprecated changefreq and priority tags (ignored by Google since 2023)
    sitemapXML = sitemapXML
      .replace(/\s*<changefreq>[^<]*<\/changefreq>/g, '')
      .replace(/\s*<priority>[^<]*<\/priority>/g, '');

    // Remove redirected blog posts from sitemap using XML block extraction
    // (regex approach failed due to whitespace/formatting mismatches from server)
    const urlBlocks = sitemapXML.match(/<url>[\s\S]*?<\/url>/g) || [];
    const filteredBlocks = urlBlocks.filter(block => {
      const locMatch = block.match(/<loc>([^<]*)<\/loc>/);
      if (!locMatch) return true;
      const loc = locMatch[1].replace(/\/$/, ''); // strip trailing slash
      for (const slug of REDIRECTED_SLUGS) {
        if (loc.endsWith(`/blog/${slug}`)) {
          console.log(`🗑️  Removed redirected URL: ${loc}`);
          return false;
        }
      }
      return true;
    });

    // Reconstruct sitemap XML
    const header = sitemapXML.match(/^[\s\S]*?(?=<url>)/)?.[0] || '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const footer = '</urlset>';
    sitemapXML = header + filteredBlocks.join('\n') + '\n' + footer;

    const outputPath = path.join(__dirname, '../public/sitemap.xml');

    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
    console.log('✅ Sitemap generated at public/sitemap.xml');
    console.log(`📊 Size: ${(sitemapXML.length / 1024).toFixed(2)} KB`);

    // Count URLs and validate no redirected slugs remain
    const urlCount = (sitemapXML.match(/<loc>/g) || []).length;
    console.log(`🔗 Total URLs: ${urlCount}`);

    // Post-generation validation
    let leaked = 0;
    for (const slug of REDIRECTED_SLUGS) {
      if (sitemapXML.includes(`/blog/${slug}`)) {
        console.error(`❌ LEAKED: /blog/${slug} still in sitemap!`);
        leaked++;
      }
    }
    if (leaked > 0) {
      console.error(`❌ ${leaked} redirected URLs leaked into sitemap!`);
      process.exit(1);
    }
    console.log(`✅ Validated: 0 redirected URLs in sitemap`);

  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error.message);
    // Don't fail the build - use fallback if server is down
    console.log('⚠️  Using fallback static sitemap');
    process.exit(0);
  }
}

generateSitemap();
