import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "Privacy Policy - Jesse A. Eisenbalm | Your Privacy Matters";
    
    const setMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('description', 'Privacy Policy for Jesse A. Eisenbalm - Learn how we protect your data and respect your privacy.');
    setMetaTag('og:title', 'Privacy Policy - Jesse A. Eisenbalm', true);
    setMetaTag('og:description', 'Your privacy matters. Learn how we collect, use, and protect your information.', true);
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

  const sections = [
    {
      number: "1",
      title: "Information We Collect",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-6">
            We collect information in three main ways:
          </p>
          <div className="space-y-6">
            <div className="pl-6 border-l-2 border-gray-200">
              <p className="text-black font-medium mb-2">You give it to us.</p>
              <p className="text-gray-600 leading-relaxed">
                When you place an order, or sign up for our emails, you share things like your name, email address, shipping info, and payment details.
              </p>
            </div>
            <div className="pl-6 border-l-2 border-gray-200">
              <p className="text-black font-medium mb-2">We collect it automatically.</p>
              <p className="text-gray-600 leading-relaxed">
                Like most websites, we use cookies and analytics tools to understand how visitors browse our site and to improve your shopping experience.
              </p>
            </div>
            <div className="pl-6 border-l-2 border-gray-200">
              <p className="text-black font-medium mb-2">We get it from others.</p>
              <p className="text-gray-600 leading-relaxed">
                If you log in or pay through a third party (like Google Pay, Shop Pay, or PayPal), we may receive limited information from them to complete your purchase.
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      number: "2",
      title: "How We Use Your Information",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-6">We use your information to:</p>
          <ul className="space-y-3 mb-6">
            {[
              "Process and deliver your orders",
              "Communicate with you about purchases, returns, and updates",
              "Improve our products, website, and customer experience",
              "Send occasional marketing emails (only if you opt in)",
              "Detect and prevent fraud or abuse"
            ].map((item, idx) => (
              <li key={idx} className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 p-6 border-l-4 border-black">
            <p className="text-black font-medium">We do not sell your personal information — ever.</p>
          </div>
        </>
      )
    },
    {
      number: "3",
      title: "Cookies & Tracking",
      content: (
        <p className="text-gray-600 leading-relaxed">
          We use cookies to make our site work better and to personalize your experience. You can turn cookies off in your browser settings. Some features may not work as smoothly without them, but we respect your choice.
        </p>
      )
    },
    {
      number: "4",
      title: "How We Protect Your Data",
      content: (
        <p className="text-gray-600 leading-relaxed">
          We use secure payment processors and industry-standard encryption to protect your data in transit and at rest. Only trusted team members and service providers who need your info to fulfill your order have access to it.
        </p>
      )
    },
    {
      number: "5",
      title: "Your Rights",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-6">Depending on where you live, you may have the right to:</p>
          <ul className="space-y-3 mb-6">
            {[
              "Access, correct, or delete your personal data",
              "Opt out of marketing emails at any time",
              "Request a copy of the data we hold about you"
            ].map((item, idx) => (
              <li key={idx} className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 leading-relaxed">
            To make a request, contact us at{' '}
            <a href="mailto:privacy@jesseaeisenbalm.com" className="text-black hover:underline font-medium transition-all">
              privacy@jesseaeisenbalm.com
            </a>
          </p>
        </>
      )
    },
    {
      number: "6",
      title: "Sharing Information",
      content: (
        <>
          <p className="text-gray-600 leading-relaxed mb-6">We share limited information with:</p>
          <ul className="space-y-3 mb-6">
            {[
              "Shipping partners (to deliver your order)",
              "Payment processors (to securely handle payments)",
              "Analytics and advertising tools (to understand and improve our site)"
            ].map((item, idx) => (
              <li key={idx} className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 leading-relaxed">
            These partners are required to keep your data safe and use it only as instructed.
          </p>
        </>
      )
    },
    {
      number: "7",
      title: "Children's Privacy",
      content: (
        <p className="text-gray-600 leading-relaxed">
          Our site isn't designed for children under 13, and we don't knowingly collect their information. If you believe we've inadvertently collected data from a child, please contact us immediately.
        </p>
      )
    },
    {
      number: "8",
      title: "Changes to This Policy",
      content: (
        <p className="text-gray-600 leading-relaxed">
          We may update this policy from time to time. If we make major changes, we'll let you know by email or on our website. We encourage you to review this page periodically.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white" style={{
      '--je-spacing-unit': '16px',
      '--je-primary-rgb': '0, 0, 0',
      '--je-secondary-rgb': '255, 255, 255',
      '--je-transition-speed': '0.25s',
      '--je-transition-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      scrollBehavior: 'smooth'
    }}>
      
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

        .policy-section {
          position: relative;
          padding-left: 0;
          transition: all 0.3s ease;
        }
        
        .policy-section:hover {
          background: linear-gradient(90deg, rgba(0,0,0,0.02) 0%, transparent 100%);
        }

        .section-number {
          font-size: 4rem;
          font-weight: 200;
          color: rgba(0,0,0,0.08);
          line-height: 1;
          position: absolute;
          left: -1rem;
          top: -0.5rem;
          transition: color 0.3s ease;
        }
        
        .policy-section:hover .section-number {
          color: rgba(0,0,0,0.15);
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
                <Link to="/#product" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PRODUCT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/about" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/#philosophy" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PHILOSOPHY
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/#journal" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  JOURNAL
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/#contact" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  CONTACT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <span className="text-sm tracking-[0.15em] text-black relative">
                  PRIVACY
                  <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                </span>
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
              <Link to="/#product" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PRODUCT</Link>
              <Link to="/about" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">ABOUT</Link>
              <Link to="/#philosophy" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PHILOSOPHY</Link>
              <Link to="/#journal" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">JOURNAL</Link>
              <Link to="/#contact" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">CONTACT</Link>
              <span className="block text-sm tracking-[0.15em] text-black">PRIVACY</span>
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

          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 scroll-reveal">LEGAL</p>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 scroll-reveal">
            Privacy Policy
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto scroll-reveal">
            Your privacy matters — and we'll always be transparent about what we collect and how we use it.
          </p>

          <p className="text-sm text-gray-400 mt-8 tracking-wide scroll-reveal">
            Last updated: November 2025
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Policy Content */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="policy-section relative pl-8 md:pl-16 py-8 scroll-reveal"
                style={{ transitionDelay: `${idx * 0.05}s` }}
              >
                <span className="section-number hidden md:block">{section.number}</span>
                <h2 className="text-2xl md:text-3xl font-light mb-6 tracking-tight flex items-center gap-3">
                  <span className="text-2xl font-light text-gray-300 md:hidden">{section.number}.</span>
                  {section.title}
                </h2>
                {section.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-8 scroll-reveal">🔒</div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6 scroll-reveal">
            Questions About Your Privacy?
          </h2>
          <p className="text-lg text-gray-400 mb-10 scroll-reveal">
            We're here to help. Reach out anytime and we'll get back to you as soon as possible.
          </p>
          <a 
            href="mailto:privacy@jesseaeisenbalm.com"
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
            <p className="text-xs text-gray-500 tracking-widest">© 2025 JESSE A. EISENBALM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link to="/" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                HOME
              </Link>
              <Link to="/about" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                ABOUT
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}