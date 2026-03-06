/**
 * generate-rss.js
 *
 * Generates public/rss.xml (RSS 2.0) and public/atom.xml (Atom 1.0)
 * from the blog API so search engines and feed readers can discover
 * new posts immediately.
 */

const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';
const SITE_URL = 'https://jesseaeisenbalm.com';

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(iso) {
  return new Date(iso).toUTCString();
}

function toRfc3339(iso) {
  return new Date(iso).toISOString();
}

async function generateFeeds() {
  console.log('📰 Generating RSS and Atom feeds...');

  let posts;
  try {
    const response = await fetch(`${SERVER_URL}/api/posts`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    posts = data.posts || [];
  } catch (err) {
    console.warn(`⚠️  Could not fetch posts: ${err.message} — skipping feed generation`);
    return;
  }

  if (!posts.length) {
    console.log('ℹ️  No posts found, skipping feed generation');
    return;
  }

  const now = new Date().toUTCString();
  const nowIso = new Date().toISOString();

  // --- RSS 2.0 ---
  const rssItems = posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <pubDate>${toRfc822(post.created_at)}</pubDate>
      <author>contact@jesseaeisenbalm.com (Jesse A. Eisenbalm)</author>${post.cover_image ? `
      <enclosure url="${escapeXml(post.cover_image)}" type="image/png" length="0" />` : ''}${post.tags?.length ? post.tags.map(t => `
      <category>${escapeXml(t)}</category>`).join('') : ''}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jesse A. Eisenbalm Journal</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts on staying human in an increasingly automated world. Digital wellness, mindful skincare, and the philosophy behind Jesse A. Eisenbalm.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo192.png</url>
      <title>Jesse A. Eisenbalm Journal</title>
      <link>${SITE_URL}/blog</link>
    </image>
${rssItems}
  </channel>
</rss>`;

  // --- Atom 1.0 ---
  const atomEntries = posts.map(post => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${SITE_URL}/blog/${post.slug}" rel="alternate" type="text/html" />
    <id>${SITE_URL}/blog/${post.slug}</id>
    <published>${toRfc3339(post.created_at)}</published>
    <updated>${toRfc3339(post.updated_at || post.created_at)}</updated>
    <summary>${escapeXml(post.excerpt || post.title)}</summary>
    <author><name>Jesse A. Eisenbalm</name></author>${post.cover_image ? `
    <link href="${escapeXml(post.cover_image)}" rel="enclosure" type="image/png" />` : ''}
  </entry>`).join('\n');

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Jesse A. Eisenbalm Journal</title>
  <subtitle>Thoughts on staying human in an increasingly automated world.</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${SITE_URL}/blog" rel="alternate" type="text/html" />
  <id>${SITE_URL}/blog</id>
  <updated>${nowIso}</updated>
  <author><name>Jesse A. Eisenbalm</name></author>
  <icon>${SITE_URL}/logo192.png</icon>
${atomEntries}
</feed>`;

  const publicDir = path.join(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'atom.xml'), atom, 'utf-8');

  console.log(`✅ RSS feed generated (${posts.length} items) → public/rss.xml`);
  console.log(`✅ Atom feed generated → public/atom.xml`);
}

generateFeeds().catch(err => {
  console.error('❌ Feed generation failed:', err.message);
});
