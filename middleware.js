// Vercel Edge Middleware — returns proper 404 status for unknown routes
// Valid routes are defined here; everything else gets a 404 status code
// while still serving the SPA shell so React can render the 404 UI

const VALID_ROUTES = new Set([
  '/',
  '/about',
  '/privacy-policy',
  '/faq',
  '/blog',
  '/admin',
]);

// Patterns that should always pass through (static assets, API, etc.)
const PASSTHROUGH_PATTERNS = [
  /^\/static\//,
  /^\/images\//,
  /^\/videos\//,
  /^\/blog\/.+/,       // blog post slugs — validated client-side
  /\.\w{2,5}$/,        // files with extensions (.js, .css, .png, etc.)
];

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // Let static assets and known patterns pass through
  for (const pattern of PASSTHROUGH_PATTERNS) {
    if (pattern.test(pathname)) return;
  }

  // Let valid routes pass through
  if (VALID_ROUTES.has(pathname)) return;

  // Unknown route — serve 200.html with 404 status
  return new Response(null, {
    status: 404,
    headers: {
      'x-middleware-rewrite': new URL('/200.html', request.url).toString(),
    },
  });
}

export const config = {
  matcher: '/((?!_next|api).*)',
};
