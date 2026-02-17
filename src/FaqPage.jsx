import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X, ArrowLeft, ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "What is Jesse A. Eisenbalm made of?",
    answer: "Jesse A. Eisenbalm is made with a premium natural beeswax formula designed for all-day hydration. It's crafted to keep your lips moisturized while serving as a daily reminder of your humanity."
  },
  {
    question: "How much does it cost?",
    answer: "Each tube is $8.99 USD with free shipping on all orders. All proceeds go to charity."
  },
  {
    question: "Is shipping free?",
    answer: "Yes, shipping is free on all orders. We ship to the US, Canada, UK, Australia, Germany, France, Italy, Spain, Netherlands, and Belgium."
  },
  {
    question: "What does 'Limited Edition Release 001' mean?",
    answer: "Each tube is individually hand numbered as part of our first limited production run, Release 001. This makes every unit unique and collectible."
  },
  {
    question: "Where do the proceeds go?",
    answer: "All proceeds from Jesse A. Eisenbalm go to charity. We believe premium lip care can do good in the world while keeping you human."
  },
  {
    question: "What is the 'Stop. Breathe. Balm.' ritual?",
    answer: "It's a mindfulness practice built into the product experience. Before applying, you stop what you're doing, take a deep breath, and then apply the balm. It's a small human ritual for an AI-everywhere world — a moment to be present in your body."
  },
  {
    question: "Is Jesse A. Eisenbalm cruelty-free?",
    answer: "Yes. Our products are ethically made and we are committed to cruelty-free practices."
  },
  {
    question: "How do I contact you?",
    answer: "You can reach us at contact@jesseaeisenbalm.com or connect with us on LinkedIn. For privacy-related inquiries, email privacy@jesseaeisenbalm.com."
  }
];

export default function FaqPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);

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
    all.forEach((el) => {
      el.classList.add('reveal-target');
    });

    let ticking = false;
    const threshold = 0.15;
    const check = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const nodes = document.querySelectorAll('.reveal-target:not(.visible)');
      nodes.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const height = rect.height || 1;
        const visiblePx = Math.min(vh, Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)));
        const visibleRatio = visiblePx / Math.min(vh, height);
        if (visibleRatio >= threshold) {
          el.classList.add('visible');
        }
      });
    };
    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };
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
        <title>FAQ - Jesse A. Eisenbalm | Frequently Asked Questions</title>
        <meta name="description" content="Frequently asked questions about Jesse A. Eisenbalm premium beeswax lip balm. Learn about ingredients, shipping, pricing, and our charity mission." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jesseaeisenbalm.com/faq" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jesseaeisenbalm.com/faq" />
        <meta property="og:title" content="FAQ - Jesse A. Eisenbalm" />
        <meta property="og:description" content="Answers to common questions about our premium beeswax lip balm, shipping, ingredients, and charity mission." />
        <meta property="og:site_name" content="Jesse A. Eisenbalm" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="FAQ - Jesse A. Eisenbalm" />
        <meta name="twitter:description" content="Answers to common questions about our premium beeswax lip balm." />

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqData.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer
            }
          }))
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
          opacity: 1;
          transform: none;
          transition: opacity 0.8s var(--je-transition-ease), transform 0.8s var(--je-transition-ease);
        }
        .js-reveal .reveal-target {
          opacity: 0;
          transform: translateY(30px);
        }
        .js-reveal .reveal-target.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .scroll-progress {
          position: fixed; top: 0; left: 0; height: 2px;
          background: linear-gradient(90deg, #000 0%, #666 100%);
          z-index: 9999; transform-origin: left;
          transition: width 0.1s linear;
        }

        .faq-item {
          border-bottom: 1px solid #e5e5e5;
          transition: all 0.3s ease;
        }
        .faq-item:hover {
          background: linear-gradient(90deg, rgba(0,0,0,0.02) 0%, transparent 100%);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .faq-answer.open {
          max-height: 500px;
        }

        .fade-in { animation: fadeIn 0.6s var(--je-transition-ease) forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .parallax-bg {
          transition: transform 0.1s linear;
          will-change: transform;
        }
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
                  FAQ
                  <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                </span>
                <Link to="/privacy-policy" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PRIVACY
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
              <span className="block text-sm tracking-[0.15em] text-black">FAQ</span>
              <Link to="/privacy-policy" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PRIVACY</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div
          className="absolute inset-0 parallax-bg"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-96 h-96 bg-black rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-black rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all mb-8 group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO SHOP
          </Link>

          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 scroll-reveal">HELP</p>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 scroll-reveal">
            Frequently Asked Questions
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto scroll-reveal">
            Everything you need to know about Jesse A. Eisenbalm, our products, and our mission.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* FAQ Content */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div>
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className="faq-item scroll-reveal"
                style={{ transitionDelay: `${idx * 0.05}s` }}
              >
                <button
                  className="w-full py-8 px-4 md:px-8 flex justify-between items-center text-left group"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <h2 className="text-lg md:text-xl font-light tracking-tight pr-8 group-hover:text-gray-600 transition-colors">
                    {item.question}
                  </h2>
                  <ChevronDown
                    size={20}
                    strokeWidth={1.5}
                    className={`flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
                  <p className="px-4 md:px-8 pb-8 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-8 scroll-reveal">💬</div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6 scroll-reveal">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-400 mb-10 scroll-reveal">
            We're here to help. Reach out anytime and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:contact@jesseaeisenbalm.com?subject=Question&body=Hello, I have a question about..."
            className="inline-block bg-white text-black px-12 py-4 text-sm tracking-[0.2em] hover:bg-gray-100 transition-all scroll-reveal"
          >
            CONTACT US
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-sm tracking-widest mb-6">CONTACT</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                For inquiries, please reach out through our LinkedIn page or email us.
              </p>
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
              <p className="text-sm text-gray-400 leading-relaxed">
                Premium natural lip care for humans. Stay present, stay human, stay moisturized.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 tracking-widest">&copy; 2026 JESSE A. EISENBALM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link to="/" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                HOME
              </Link>
              <Link to="/about" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                ABOUT
              </Link>
              <Link to="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                PRIVACY POLICY
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
