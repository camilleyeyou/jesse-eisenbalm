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
const REDIRECTED_SLUGS = require('./redirected-slugs');

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
    ${post.cover_image ? `<link rel="preload" as="image" href="${escapeHtml(post.cover_image)}" fetchpriority="high" />` : ''}
    <script type="application/ld+json">${articleSchema}</script>
    <script type="application/ld+json">${breadcrumbSchema}</script>`;

  // Build static article body for Googlebot (replaced by React on hydration)
  const publishedDate = new Date(datePublished).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const articleBody = `<main>
      <article>
        <nav aria-label="breadcrumb" style="padding:1rem 0;font-size:0.875rem;color:#6b7280">
          <a href="/" style="color:#6b7280">Home</a> &rsaquo;
          <a href="/blog" style="color:#6b7280">Journal</a> &rsaquo;
          <span>${escapeHtml(post.title)}</span>
        </nav>
        ${post.cover_image ? `<img src="${escapeHtml(post.cover_image)}" alt="${escapeHtml(post.title)}" width="1200" height="630" style="max-width:100%;height:auto" />` : ''}
        <h1>${escapeHtml(post.title)}</h1>
        ${post.excerpt ? `<p><em>${escapeHtml(post.excerpt)}</em></p>` : ''}
        <p style="color:#6b7280;font-size:0.875rem">${escapeHtml(post.author || 'Jesse A. Eisenbalm')} &middot; ${publishedDate}</p>
        <hr />
        <div>${post.content || ''}</div>
      </article>
      <p><a href="/blog">&larr; Back to Journal</a></p>
    </main>`;

  // Replace existing <title> to avoid duplicates, then inject before </head>
  let html = shell.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace('</head>', `${metaTags}\n  </head>`);
  // Inject article body inside <div id="root"> for Googlebot
  html = html.replace('<div id="root"></div>', `<div id="root">${articleBody}</div>`);
  return html;
}

async function fetchPosts() {
  const response = await fetch(`${SERVER_URL}/api/posts`);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data = await response.json();
  const posts = data.posts || [];

  // Fetch full content for each post (list endpoint omits content)
  const fullPosts = await Promise.all(
    posts.map(async (post) => {
      try {
        const res = await fetch(`${SERVER_URL}/api/posts/${post.slug}`);
        if (!res.ok) return post;
        const detail = await res.json();
        return detail.post || post;
      } catch {
        return post; // Fall back to summary if individual fetch fails
      }
    })
  );

  return fullPosts;
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
    if (!post.slug || REDIRECTED_SLUGS.has(post.slug)) continue;

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
  prerenderSecondaryPages(shell, posts);
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
    <link rel="preconnect" href="https://jesse-eisenbalm-server.vercel.app" crossorigin />
    <link rel="preload" as="image" href="${SITE_URL}/images/products/eisenbalm-1.webp" fetchpriority="high" />
    <script type="application/ld+json">${productSchema}</script>
    <script type="application/ld+json">${orgSchema}</script>
    <script type="application/ld+json">${websiteSchema}</script>`;

  // Replace existing <title> and inject
  let html = shell.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace('</head>', `${homeTags}\n  </head>`);

  // Inject body content into <div id="root"> for crawlers
  const homeBody = `<main>
      <h1>Premium Beeswax Lip Balm | Jesse A. Eisenbalm</h1>
      <p>Petrolatum-free barrier restoration for business professionals. Limited Edition Release 001. Hand numbered.</p>
      <p>$8.99 | 100% proceeds to charity</p>
      <h2>What Sets Us Apart</h2>
      <ul>
        <li><strong>Premium Beeswax Formula</strong> — Natural beeswax forms a bio-compatible barrier that prevents transepidermal water loss (TEWL). No synthetic fragrances, parabens, or petroleum derivatives.</li>
        <li><strong>100% Charity Proceeds</strong> — Every dollar goes directly to charitable causes.</li>
        <li><strong>Limited Edition, Hand Numbered</strong> — Release 001 is individually numbered for verifiable authenticity.</li>
      </ul>
      <p>Stop. Breathe. Balm. A human-only ritual for an AI-everywhere world.</p>
      <p><a href="/about">About Us</a> | <a href="/blog">Journal</a> | <a href="/faq">FAQ</a></p>
    </main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${homeBody}</div>`);

  // Write to both index.html and 200.html
  const indexPath = path.join(__dirname, '../build/index.html');
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✅ Homepage pre-rendered with SEO metadata + body content (build/index.html)');
}

function prerenderSecondaryPages(shell, posts) {
  console.log('📄 Pre-rendering secondary pages...');

  // Build blog listing body from fetched posts (exclude redirected slugs)
  const blogListItems = (posts || []).filter(p => !REDIRECTED_SLUGS.has(p.slug)).slice(0, 20).map(p => {
    const date = new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a> — <span>${date}</span>${p.excerpt ? `<br/><span>${escapeHtml(truncate(p.excerpt, 120))}</span>` : ''}</li>`;
  }).join('\n        ');

  const pages = [
    {
      path: 'about',
      title: 'About Jesse A. Eisenbalm | Our Story & Mission',
      description: 'Jesse A. Eisenbalm is a human-centered skincare brand. Premium beeswax lip balm for business professionals. 100% proceeds to charity.',
      bodyContent: `<main>
      <h1>About Jesse A. Eisenbalm</h1>
      <p>Jesse A. Eisenbalm is a human-centered skincare brand offering premium beeswax lip balm for business professionals. 100% of proceeds go to charity.</p>
      <h2>Our Mission</h2>
      <p>We believe in staying human in an increasingly automated world. Our lip balm is designed as a mindful ritual — a tactile pause in the digital workday.</p>
      <h2>The Product</h2>
      <p>Premium natural beeswax formula. Petrolatum-free barrier restoration. Limited Edition Release 001. Hand numbered. $8.99 with free shipping.</p>
      <h2>Stop. Breathe. Balm.</h2>
      <p>A three-word cognitive reset for the modern professional. Break continuous partial attention, reduce cognitive load, and reconnect with the non-digital world.</p>
      <p><a href="/">Shop Now</a> | <a href="/blog">Read Our Journal</a> | <a href="/faq">FAQ</a></p>
    </main>`,
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
      bodyContent: `<main>
      <h1>Journal — Jesse A. Eisenbalm</h1>
      <p>Thoughts on staying human in an increasingly automated world. Digital wellness, mindful skincare, and the philosophy behind Jesse A. Eisenbalm.</p>
      <ul>${blogListItems}</ul>
      <p><a href="/">Back to Home</a></p>
    </main>`,
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
      bodyContent: `<main>
      <h1>Frequently Asked Questions</h1>
      <h2>How can lip balm help with digital fatigue?</h2>
      <p>Jesse A. Eisenbalm is designed as a neurocosmetic ritual for business professionals experiencing digital fatigue. The 'Stop. Breathe. Balm.' practice serves as a cognitive reset tool — a tactile interruption that helps manage decision fatigue caused by extended screen time.</p>
      <h2>Why is beeswax better than petrolatum for professionals?</h2>
      <p>Beeswax provides petrolatum-free barrier restoration without the outdated petroleum base. It forms a bio-compatible occlusive layer that prevents transepidermal water loss (TEWL) during 8+ hour workdays in climate-controlled office environments.</p>
      <h2>What is the 'Stop. Breathe. Balm.' ritual?</h2>
      <p>It's a three-word cognitive reset practice designed for workplace wellness: Stop (break continuous partial attention), Breathe (reduce cognitive load), Balm (tactile sensory anchor to the non-digital world).</p>
      <h2>What is Jesse A. Eisenbalm made of?</h2>
      <p>Premium natural beeswax formula designed for all-day barrier restoration. Petrolatum-free, free from synthetic fragrances, parabens, and petroleum derivatives.</p>
      <h2>How much does it cost and where do proceeds go?</h2>
      <p>Each tube is $8.99 USD with free shipping. 100% of proceeds go to charity.</p>
      <h2>Is shipping free?</h2>
      <p>Yes, shipping is free on all orders. We ship to the US, Canada, UK, Australia, Germany, France, Italy, Spain, Netherlands, and Belgium.</p>
      <h2>Is Jesse A. Eisenbalm cruelty-free?</h2>
      <p>Yes. Our products are ethically made and we are committed to cruelty-free practices.</p>
      <h2>How do I contact you?</h2>
      <p>Email us at contact@jesseaeisenbalm.com or connect on <a href="https://www.linkedin.com/company/108396769/">LinkedIn</a>.</p>
      <p><a href="/">Back to Home</a></p>
    </main>`,
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
      bodyContent: `<main>
      <h1>Privacy Policy — Jesse A. Eisenbalm</h1>
      <p>Last updated: 2026. This Privacy Policy describes how Jesse A. Eisenbalm collects, uses, and protects your personal information when you visit our website or make a purchase.</p>
      <h2>Information We Collect</h2>
      <p>We collect information you provide directly, such as your name, email address, and shipping address when you make a purchase. We also collect usage data through cookies and analytics.</p>
      <h2>How We Use Your Information</h2>
      <p>We use your information to process orders, improve our website, and communicate with you about your purchases.</p>
      <h2>Contact</h2>
      <p>For privacy-related inquiries, email privacy@jesseaeisenbalm.com.</p>
      <p><a href="/">Back to Home</a></p>
    </main>`,
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
    // Inject body content inside <div id="root"> for Googlebot
    if (page.bodyContent) {
      html = html.replace('<div id="root"></div>', `<div id="root">${page.bodyContent}</div>`);
    }

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
