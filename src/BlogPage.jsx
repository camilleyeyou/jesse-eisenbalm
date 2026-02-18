import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X } from 'lucide-react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-100"></div>
      <div className="p-8">
        <div className="h-3 bg-gray-100 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-gray-100 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-6"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/posts`)
      .then(r => r.json())
      .then(data => { setPosts(data.posts || []); setLoading(false); })
      .catch(() => { setError('Could not load posts. Please try again later.'); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) progressBar.style.width = `${scrolled}%`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('js-reveal');
    const all = Array.from(document.querySelectorAll('.scroll-reveal'));
    all.forEach(el => el.classList.add('reveal-target'));
    let ticking = false;
    const threshold = 0.15;
    const check = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll('.reveal-target:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        const height = rect.height || 1;
        const visiblePx = Math.min(vh, Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)));
        if (visiblePx / Math.min(vh, height) >= threshold) el.classList.add('visible');
      });
    };
    const onScrollOrResize = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    requestAnimationFrame(check);
    return () => {
      html.classList.remove('js-reveal');
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{
      '--je-spacing-unit': '16px',
      '--je-primary-rgb': '0, 0, 0',
      '--je-secondary-rgb': '255, 255, 255',
      '--je-transition-speed': '0.25s',
      '--je-transition-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      scrollBehavior: 'smooth'
    }}>

      <Helmet>
        <title>Journal | Jesse A. Eisenbalm</title>
        <meta name="description" content="Thoughts on staying human in an increasingly automated world. Philosophy, culture, and meditations on humanity from Jesse A. Eisenbalm." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jesseaeisenbalm.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jesseaeisenbalm.com/blog" />
        <meta property="og:title" content="Journal | Jesse A. Eisenbalm" />
        <meta property="og:description" content="Thoughts on staying human in an increasingly automated world." />
        <meta property="og:image" content="https://jesseaeisenbalm.com/images/products/eisenbalm-1.png" />
        <meta property="og:site_name" content="Jesse A. Eisenbalm" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Journal | Jesse A. Eisenbalm" />
        <meta name="twitter:description" content="Thoughts on staying human in an increasingly automated world." />
        <meta name="twitter:image" content="https://jesseaeisenbalm.com/images/products/eisenbalm-1.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Jesse A. Eisenbalm Journal",
          "url": "https://jesseaeisenbalm.com/blog",
          "description": "Thoughts on staying human in an increasingly automated world.",
          "publisher": {
            "@type": "Organization",
            "name": "Jesse A. Eisenbalm",
            "url": "https://jesseaeisenbalm.com"
          }
        })}</script>
      </Helmet>

      <div id="scroll-progress" className="scroll-progress"></div>

      <style>{`
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .luxury-hover { transition: all var(--je-transition-speed) var(--je-transition-ease); }
        .luxury-hover:hover { transform: translateY(-2px); }
        .luxury-focus:focus-visible { outline: 2px solid rgba(var(--je-primary-rgb), 1); outline-offset: 2px; }
        .scroll-reveal {
          opacity: 1; transform: none;
          transition: opacity 0.8s var(--je-transition-ease), transform 0.8s var(--je-transition-ease);
        }
        .js-reveal .reveal-target { opacity: 0; transform: translateY(30px); }
        .js-reveal .reveal-target.visible { opacity: 1 !important; transform: translateY(0) !important; }
        .scroll-progress {
          position: fixed; top: 0; left: 0; height: 2px;
          background: linear-gradient(90deg, #000 0%, #666 100%);
          z-index: 9999; transform-origin: left; transition: width 0.1s linear;
        }
        .blog-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f3f4f6;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
          border-color: #e5e5e5;
        }
        .blog-tag {
          display: inline-block; font-size: 0.625rem; letter-spacing: 0.15em;
          padding: 2px 8px; border: 1px solid #e5e5e5;
          margin-right: 4px; margin-bottom: 4px;
          text-transform: uppercase;
        }
        .fade-in { animation: fadeIn 0.6s var(--je-transition-ease) forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .parallax-bg { transition: transform 0.1s linear; will-change: transform; }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95" role="navigation">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <Link to="/" className="text-2xl font-light tracking-[0.2em] transition-all duration-300 hover:tracking-[0.25em]">
                JESSE A. EISENBALM
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link to="/" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PRODUCT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/about" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <span className="text-sm tracking-[0.15em] text-black relative">
                  JOURNAL
                  <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                </span>
                <Link to="/faq" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  FAQ
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>
            <button
              className="md:hidden luxury-focus"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 fade-in">
            <div className="px-6 py-6 space-y-6">
              <Link to="/" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PRODUCT</Link>
              <Link to="/about" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">ABOUT</Link>
              <span className="block text-sm tracking-[0.15em] text-black">JOURNAL</span>
              <Link to="/faq" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">FAQ</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 parallax-bg" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-96 h-96 bg-black rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-black rounded-full blur-3xl"></div>
          </div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 scroll-reveal">THOUGHTS & MEDITATIONS</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 scroll-reveal">
            The Journal
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto scroll-reveal">
            Dispatches from the intersection of humanity and automation. Stop. Breathe. Read.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Posts Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Loading state */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-24">
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xs tracking-[0.3em] text-gray-400 mb-4">COMING SOON</p>
              <p className="text-2xl font-light text-gray-600">No posts yet. Check back soon.</p>
            </div>
          )}

          {/* Posts */}
          {!loading && !error && posts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <article
                  key={post.id}
                  className="blog-card bg-white scroll-reveal"
                  style={{ transitionDelay: `${idx * 0.08}s` }}
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  {!post.cover_image && (
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <span className="text-4xl opacity-20">💄</span>
                    </div>
                  )}
                  <div className="p-8">
                    {post.tags?.length > 0 && (
                      <div className="mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="blog-tag text-gray-500">{tag}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-xl font-light tracking-tight mb-3 leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 tracking-wide">{formatDate(post.created_at)}</span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs tracking-[0.15em] text-black border-b border-black pb-0.5 hover:pb-1 transition-all duration-200"
                      >
                        READ MORE
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-sm tracking-widest mb-6">CONTACT</h3>
              <p className="text-sm text-gray-400 leading-relaxed">For inquiries, please reach out through our LinkedIn page or email us.</p>
            </div>
            <div>
              <h3 className="text-sm tracking-widest mb-6">FOLLOW OR TALK TO US</h3>
              <div className="space-y-2">
                <a href="https://www.linkedin.com/company/108396769/" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="mailto:contact@jesseaeisenbalm.com?subject=Inquiry&body=Hello, I would like to..." className="block text-sm text-gray-400 hover:text-white transition">Email Us</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm tracking-widest mb-6">PHILOSOPHY</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Premium natural lip care for humans. Stay present, stay human, stay moisturized.</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 tracking-widest">&copy; 2026 JESSE A. EISENBALM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link to="/about" className="text-xs text-gray-500 hover:text-white transition tracking-widest">ABOUT</Link>
              <Link to="/faq" className="text-xs text-gray-500 hover:text-white transition tracking-widest">FAQ</Link>
              <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition tracking-widest">PRIVACY POLICY</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
