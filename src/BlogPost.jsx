import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X, ArrowLeft } from 'lucide-react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${SERVER_URL}/api/posts/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setPost(data.post); setLoading(false); }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  return (
    <div className="min-h-screen bg-white" style={{
      '--je-spacing-unit': '16px',
      '--je-primary-rgb': '0, 0, 0',
      '--je-transition-speed': '0.25s',
      '--je-transition-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      scrollBehavior: 'smooth'
    }}>

      <Helmet>
        <title>{post ? `${post.title} | Jesse A. Eisenbalm` : 'Journal | Jesse A. Eisenbalm'}</title>
        {post && <>
          <meta name="description" content={post.excerpt || post.title} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={`https://jesseaeisenbalm.com/blog/${post.slug}`} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://jesseaeisenbalm.com/blog/${post.slug}`} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt || post.title} />
          <meta property="og:image" content={post.cover_image || 'https://jesseaeisenbalm.com/images/products/eisenbalm-1.png'} />
          <meta property="og:site_name" content="Jesse A. Eisenbalm" />
          <meta property="article:published_time" content={post.created_at} />
          <meta property="article:author" content={post.author} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.excerpt || post.title} />
          <meta name="twitter:image" content={post.cover_image || 'https://jesseaeisenbalm.com/images/products/eisenbalm-1.png'} />
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt || '',
            "image": post.cover_image || 'https://jesseaeisenbalm.com/images/products/eisenbalm-1.png',
            "author": { "@type": "Person", "name": post.author },
            "publisher": {
              "@type": "Organization",
              "name": "Jesse A. Eisenbalm",
              "url": "https://jesseaeisenbalm.com"
            },
            "datePublished": post.created_at,
            "dateModified": post.updated_at,
            "mainEntityOfPage": `https://jesseaeisenbalm.com/blog/${post.slug}`
          })}</script>
        </>}
        {notFound && <meta name="robots" content="noindex" />}
      </Helmet>

      <style>{`
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .luxury-focus:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
        .blog-tag {
          display: inline-block; font-size: 0.625rem; letter-spacing: 0.15em;
          padding: 2px 10px; border: 1px solid #e5e5e5;
          margin-right: 6px; text-transform: uppercase;
        }
        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .post-content h1, .post-content h2, .post-content h3, .post-content h4 {
          font-weight: 300; letter-spacing: -0.02em; margin: 2.5rem 0 1rem; line-height: 1.3;
        }
        .post-content h1 { font-size: 2rem; }
        .post-content h2 { font-size: 1.5rem; }
        .post-content h3 { font-size: 1.25rem; }
        .post-content h4 { font-size: 1.1rem; }
        .post-content p { margin-bottom: 1.5rem; line-height: 1.85; color: #374151; }
        .post-content ul, .post-content ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .post-content li { margin-bottom: 0.5rem; line-height: 1.75; color: #374151; }
        .post-content blockquote {
          border-left: 3px solid #000; padding: 0.5rem 0 0.5rem 1.5rem;
          margin: 2rem 0; font-style: italic; color: #6b7280; font-size: 1.1rem;
        }
        .post-content a { text-decoration: underline; text-underline-offset: 3px; }
        .post-content a:hover { opacity: 0.7; }
        .post-content code {
          background: #f3f4f6; padding: 0.15rem 0.4rem;
          font-size: 0.875em; border-radius: 2px; font-family: monospace;
        }
        .post-content pre { background: #f3f4f6; padding: 1.5rem; overflow-x: auto; margin-bottom: 1.5rem; }
        .post-content pre code { background: none; padding: 0; }
        .post-content hr { border: none; border-top: 1px solid #e5e5e5; margin: 3rem 0; }
        .post-content strong { font-weight: 500; }
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
                <Link to="/blog" className="text-sm tracking-[0.15em] text-black transition-all duration-300 relative group">
                  JOURNAL
                  <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                </Link>
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
              <Link to="/blog" className="block text-sm tracking-[0.15em] text-black">JOURNAL</Link>
              <Link to="/faq" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">FAQ</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Loading */}
      {loading && (
        <div className="max-w-3xl mx-auto px-6 py-32 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-24 mb-8"></div>
          <div className="h-10 bg-gray-100 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-100 rounded w-1/2 mb-12"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
          </div>
        </div>
      )}

      {/* 404 */}
      {notFound && !loading && (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-400 mb-6">404</p>
          <h1 className="text-4xl font-light mb-6">Post not found.</h1>
          <p className="text-gray-500 mb-12">This post doesn't exist or has been unpublished.</p>
          <Link to="/blog" className="inline-flex items-center text-sm tracking-[0.15em] text-black hover:opacity-70 transition-opacity">
            <ArrowLeft size={16} className="mr-2" />
            BACK TO JOURNAL
          </Link>
        </div>
      )}

      {/* Post */}
      {post && !loading && (
        <>
          {/* Cover image hero */}
          {post.cover_image ? (
            <div className="w-full h-[60vh] overflow-hidden bg-gray-100">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
          )}

          {/* Post header */}
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all mb-10 group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              BACK TO JOURNAL
            </Link>

            {post.tags?.length > 0 && (
              <div className="mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="blog-tag text-gray-500">{tag}</span>
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-500 font-light leading-relaxed mb-8">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400 tracking-wide border-b border-gray-100 pb-10">
              <span>{post.author}</span>
              <span>&middot;</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          {/* Post content */}
          <div className="max-w-3xl mx-auto px-6 pb-24">
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>

          {/* Back to journal CTA */}
          <div className="border-t border-gray-100 py-16 px-6 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm tracking-[0.2em] text-gray-500 hover:text-black transition-all group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              BACK TO JOURNAL
            </Link>
          </div>
        </>
      )}

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
              <Link to="/blog" className="text-xs text-gray-500 hover:text-white transition tracking-widest">JOURNAL</Link>
              <Link to="/faq" className="text-xs text-gray-500 hover:text-white transition tracking-widest">FAQ</Link>
              <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition tracking-widest">PRIVACY POLICY</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
