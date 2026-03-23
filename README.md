# Jesse A. Eisenbalm

Premium beeswax lip balm e-commerce site. Limited edition, hand-numbered. All proceeds go to charity.

**Live:** [jesseaeisenbalm.com](https://jesseaeisenbalm.com)

## Tech Stack

- **Frontend:** React 19, React Router, Tailwind CSS
- **Backend:** Express 5, Stripe (payments), Supabase (data/images)
- **Hosting:** Vercel (frontend + serverless backend)
- **Analytics:** Google Analytics 4 with Core Web Vitals reporting
- **SEO:** Pre-rendered pages, XML sitemap, RSS/Atom feeds, JSON-LD schema

## Project Structure

```
├── src/                    # React frontend
│   ├── EisenbalmShop.jsx   # Homepage / shop (hero, product, checkout)
│   ├── BlogPage.jsx        # Blog listing
│   ├── BlogPost.jsx        # Individual blog post
│   ├── AboutPage.jsx       # About page
│   ├── AdminPage.jsx       # Admin panel
│   ├── FaqPage.jsx         # FAQ
│   └── PrivacyPolicy.jsx   # Privacy policy
├── server/                 # Express API (deployed separately on Vercel)
│   └── server.js           # Stripe checkout, Supabase blog CRUD
├── scripts/                # Build-time scripts
│   ├── generate-sitemap.js # XML sitemap generator
│   ├── generate-rss.js     # RSS + Atom feed generator
│   ├── prerender.js        # Static page pre-rendering
│   ├── prerender-blog.js   # Blog post pre-rendering
│   ├── redirected-slugs.js # Consolidated blog post redirect list
│   └── ping-search-engines.js
├── public/                 # Static assets
└── vercel.json             # Redirects, rewrites, headers, CSP
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Frontend

```bash
npm install
npm start
```

Runs on [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd server
npm install
npm start
```

Requires a `.env` file in `server/` with:

```
STRIPE_SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_URL=http://localhost:3000
```

## Build & Deploy

```bash
npm run build
```

This runs the full pipeline:
1. **prebuild** — generates sitemap.xml, rss.xml, atom.xml
2. **build** — CRA production build
3. **postbuild** — pre-renders static HTML pages, pre-renders blog posts, pings search engines

Deployed automatically via Vercel on push to `main`.

## Blog System

Blog posts are stored in Supabase and managed via the admin panel (`/admin`). An automated content generation system is documented in `BLOG_CONTENT_PROMPT.md`.

Consolidated posts (39 redirected to 19 canonical posts) are managed via 301 redirects in `vercel.json` and filtered from sitemap/feeds by `scripts/redirected-slugs.js`.
