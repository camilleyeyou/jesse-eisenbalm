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
const SHELL_200 = path.join(__dirname, '../build/200.html');
const SHELL_INDEX = path.join(__dirname, '../build/index.html');
const SHELL_PATH = fs.existsSync(SHELL_200) ? SHELL_200 : SHELL_INDEX;
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

  // Replace existing <title> to avoid duplicates, then inject before </head>
  let html = shell.replace(/<title>[^<]*<\/title>/, '');
  return html.replace('</head>', `${metaTags}\n  </head>`);
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
    console.warn('⚠️  build/200.html and build/index.html not found — run `npm run build` first');
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

  // --- Homepage pre-rendering ---
  prerenderHomepage(shell);

  // --- Secondary pages pre-rendering ---
  prerenderSecondaryPages(shell);
}

function prerenderHomepage(shell) {
  console.log('🏠 Pre-rendering homepage with SEO metadata...');

  const title = 'Jesse A. Eisenbalm | Premium Beeswax Lip Balm — $8.99 | 100% Charity';
  const description = 'Premium beeswax lip balm. Petrolatum-free barrier restoration for business professionals. Limited Edition Release 001. $8.99. 100% proceeds to charity.';
  const canonical = `${SITE_URL}/`;
  const image = `${SITE_URL}/images/products/eisenbalm-1.webp`;

  const productSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': 'Jesse A. Eisenbalm - The Original',
    'image': [
      `${SITE_URL}/images/products/eisenbalm-1.webp`,
      `${SITE_URL}/images/products/eisenbalm-2.webp`,
      `${SITE_URL}/images/products/eisenbalm-3.webp`
    ],
    'description': 'Premium beeswax lip balm designed as a digital wellness ritual for business professionals. Petrolatum-free barrier restoration. Limited Edition Release 001. Hand numbered. 4.5g / 0.15 oz.',
    'material': 'Premium Natural Beeswax',
    'brand': { '@type': 'Brand', 'name': 'Jesse A. Eisenbalm' },
    'offers': {
      '@type': 'Offer',
      'url': `${SITE_URL}/`,
      'priceCurrency': 'USD',
      'price': '8.99',
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition'
    }
  });

  const orgSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Jesse A. Eisenbalm',
    'url': SITE_URL,
    'logo': {
      '@type': 'ImageObject',
      'url': `${SITE_URL}/logo192.png`,
      'width': 192,
      'height': 192
    },
    'description': 'Human-centered skincare for digital wellness. Premium beeswax lip balm for business professionals. 100% charity proceeds.',
    'email': 'contact@jesseaeisenbalm.com',
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'contact@jesseaeisenbalm.com',
      'contactType': 'customer service',
      'availableLanguage': 'English'
    },
    'sameAs': ['https://www.linkedin.com/company/108396769/']
  });

  const websiteSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Jesse A. Eisenbalm',
    'url': SITE_URL
  });

  const homeTags = `
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="1536" />
    <meta property="og:site_name" content="Jesse A. Eisenbalm" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="preconnect" href="https://jesse-eisenbalm-server.vercel.app" crossorigin />
    <link rel="preload" as="image" href="${SITE_URL}/images/products/eisenbalm-1.webp" fetchpriority="high" />
    <script type="application/ld+json">${productSchema}</script>
    <script type="application/ld+json">${orgSchema}</script>
    <script type="application/ld+json">${websiteSchema}</script>`;

  // Replace existing <title> and inject
  let html = shell.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace('</head>', `${homeTags}\n  </head>`);

  // Write to both index.html and 200.html
  const indexPath = path.join(__dirname, '../build/index.html');
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✅ Homepage pre-rendered with SEO metadata (build/index.html)');
}

function prerenderSecondaryPages(shell) {
  console.log('📄 Pre-rendering secondary pages...');

  const pages = [
    {
      path: 'about',
      title: 'About Jesse A. Eisenbalm | Our Story & Mission',
      description: 'Jesse A. Eisenbalm is a human-centered skincare brand. Premium beeswax lip balm for business professionals. 100% proceeds to charity.',
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'name': 'About Jesse A. Eisenbalm',
          'url': `${SITE_URL}/about`,
          'mainEntity': {
            '@type': 'Organization',
            'name': 'Jesse A. Eisenbalm',
            'url': SITE_URL,
            'logo': { '@type': 'ImageObject', 'url': `${SITE_URL}/logo192.png`, 'width': 192, 'height': 192 },
            'description': 'Human-centered skincare brand. 100% charity proceeds.',
            'sameAs': ['https://www.linkedin.com/company/108396769/']
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': `${SITE_URL}/about` }
          ]
        }
      ]
    },
    {
      path: 'blog',
      title: 'Journal | Jesse A. Eisenbalm',
      description: 'Thoughts on staying human in an increasingly automated world. Digital wellness, mindful skincare, and the philosophy behind Jesse A. Eisenbalm.',
      ogType: 'blog',
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          'name': 'Jesse A. Eisenbalm Journal',
          'url': `${SITE_URL}/blog`,
          'description': 'Thoughts on staying human in an increasingly automated world.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Jesse A. Eisenbalm',
            'url': SITE_URL,
            'logo': { '@type': 'ImageObject', 'url': `${SITE_URL}/logo192.png`, 'width': 192, 'height': 192 }
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Journal', 'item': `${SITE_URL}/blog` }
          ]
        }
      ]
    },
    {
      path: 'faq',
      title: 'FAQ - Jesse A. Eisenbalm | Frequently Asked Questions',
      description: 'Frequently asked questions about Jesse A. Eisenbalm premium beeswax lip balm. Learn about ingredients, shipping, pricing, and our charity mission.',
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'FAQ', 'item': `${SITE_URL}/faq` }
          ]
        }
      ]
    },
    {
      path: 'privacy-policy',
      title: 'Privacy Policy | Jesse A. Eisenbalm',
      description: 'Privacy policy for Jesse A. Eisenbalm. Learn how we collect, use, and protect your personal information.',
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Privacy Policy', 'item': `${SITE_URL}/privacy-policy` }
          ]
        }
      ]
    }
  ];

  for (const page of pages) {
    const canonical = `${SITE_URL}/${page.path}`;
    const image = `${SITE_URL}/images/products/eisenbalm-1.webp`;
    const ogType = page.ogType || 'website';

    const schemaBlocks = page.schemas
      .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join('\n    ');

    const metaTags = `
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:site_name" content="Jesse A. Eisenbalm" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    ${schemaBlocks}`;

    let html = shell.replace(/<title>[^<]*<\/title>/, '');
    html = html.replace('</head>', `${metaTags}\n  </head>`);

    const dir = path.join(__dirname, `../build/${page.path}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  }

  console.log(`✅ Pre-rendered ${pages.length} secondary pages (about, blog, faq, privacy-policy)`);
}

main().catch(err => {
  console.error('❌ Blog pre-render failed:', err.message);
  process.exit(0); // Don't fail the build
});
