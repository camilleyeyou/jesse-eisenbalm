/**
 * prerender-blog.js
 *
 * Generates build/blog/[slug]/index.html for every published blog post.
 * Each file has post-specific meta tags (title, description, canonical,
 * Open Graph, Article JSON-LD) baked into the static HTML so Googlebot
 * sees them on first load without executing JavaScript.
 *
 * The React app still loads and hydrates normally on the client side.
 */

const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';
const SITE_URL = 'https://jesseaeisenbalm.com';
const SHELL_PATH = path.join(__dirname, '../build/200.html');
const BLOG_DIR = path.join(__dirname, '../build/blog');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
}

function buildHtml(shell, post) {
  const title = escapeHtml(`${post.title} | Jesse A. Eisenbalm Journal`);
  const description = escapeHtml(truncate(post.excerpt || post.meta_description || `${post.title} — From the Jesse A. Eisenbalm Journal.`, 155));
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const image = post.cover_image || `${SITE_URL}/images/products/eisenbalm-1.png`;
  const datePublished = post.created_at || new Date().toISOString();
  const dateModified = post.updated_at || datePublished;

  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt || post.meta_description || '',
    'image': image,
    'author': {
      '@type': 'Organization',
      'name': 'Jesse A. Eisenbalm',
      'url': SITE_URL
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Jesse A. Eisenbalm',
      'url': SITE_URL,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo192.png`,
        'width': 192,
        'height': 192
      }
    },
    'datePublished': datePublished,
    'dateModified': dateModified,
    'mainEntityOfPage': canonical,
    'isPartOf': {
      '@type': 'Blog',
      'name': 'Jesse A. Eisenbalm Journal',
      'url': `${SITE_URL}/blog`
    }
  });

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Journal', 'item': `${SITE_URL}/blog` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': canonical }
    ]
  });

  const metaTags = `
    <title>${title}</title>
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:site_name" content="Jesse A. Eisenbalm" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <script type="application/ld+json">${articleSchema}</script>
    <script type="application/ld+json">${breadcrumbSchema}</script>`;

  // Inject before </head>
  return shell.replace('</head>', `${metaTags}\n  </head>`);
}

async function fetchPosts() {
  const response = await fetch(`${SERVER_URL}/api/posts`);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data = await response.json();
  return data.posts || [];
}

async function main() {
  console.log('📝 Generating blog post pre-renders...');

  if (!fs.existsSync(SHELL_PATH)) {
    console.warn('⚠️  build/200.html not found — run `npm run build` first');
    process.exit(0);
  }

  const shell = fs.readFileSync(SHELL_PATH, 'utf-8');

  let posts;
  try {
    posts = await fetchPosts();
    console.log(`📡 Fetched ${posts.length} posts from API`);
  } catch (err) {
    console.warn(`⚠️  Could not fetch posts: ${err.message} — skipping blog pre-render`);
    process.exit(0);
  }

  if (!posts.length) {
    console.log('ℹ️  No published posts found');
    process.exit(0);
  }

  let written = 0;
  for (const post of posts) {
    if (!post.slug) continue;

    const dir = path.join(BLOG_DIR, post.slug);
    fs.mkdirSync(dir, { recursive: true });

    const html = buildHtml(shell, post);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
    written++;
  }

  console.log(`✅ Pre-rendered ${written} blog posts to build/blog/[slug]/index.html`);
}

main().catch(err => {
  console.error('❌ Blog pre-render failed:', err.message);
  process.exit(0); // Don't fail the build
});
