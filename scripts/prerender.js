const { run } = require('react-snap');

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';

const STATIC_ROUTES = ['/', '/about', '/privacy-policy', '/faq', '/blog'];

async function getBlogRoutes() {
  try {
    console.log('📡 Fetching blog posts for pre-rendering...');
    const response = await fetch(`${SERVER_URL}/api/posts`);
    if (!response.ok) throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    const { posts } = await response.json();
    const routes = (posts || []).map(post => `/blog/${post.slug}`);
    console.log(`📝 Found ${routes.length} blog posts to pre-render`);
    return routes;
  } catch (error) {
    console.warn('⚠️  Could not fetch blog posts for pre-rendering:', error.message);
    console.warn('⚠️  Falling back to static routes only');
    return [];
  }
}

async function prerender() {
  const blogRoutes = await getBlogRoutes();
  const allRoutes = [...STATIC_ROUTES, ...blogRoutes];

  console.log(`🔄 Pre-rendering ${allRoutes.length} routes (${STATIC_ROUTES.length} static + ${blogRoutes.length} blog posts)...`);

  await run({
    include: allRoutes,
    skipThirdPartyRequests: true,
  });

  console.log('✅ Pre-rendering complete!');
}

prerender().catch(err => {
  console.error('❌ Pre-rendering failed:', err.message);
  process.exit(0); // Don't fail the build — pre-rendering is an enhancement, not required
});
