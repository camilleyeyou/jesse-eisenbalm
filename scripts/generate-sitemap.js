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

    // Remove redirected blog posts from sitemap
    for (const slug of REDIRECTED_SLUGS) {
      const urlPattern = new RegExp(`\\s*<url>\\s*<loc>[^<]*\\/blog\\/${slug}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
      sitemapXML = sitemapXML.replace(urlPattern, '');
    }

    const outputPath = path.join(__dirname, '../public/sitemap.xml');

    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
    console.log('✅ Sitemap generated at public/sitemap.xml');
    console.log(`📊 Size: ${(sitemapXML.length / 1024).toFixed(2)} KB`);

    // Count URLs
    const urlCount = (sitemapXML.match(/<loc>/g) || []).length;
    console.log(`🔗 Total URLs: ${urlCount}`);

  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error.message);
    // Don't fail the build - use fallback if server is down
    console.log('⚠️  Using fallback static sitemap');
    process.exit(0);
  }
}

generateSitemap();
