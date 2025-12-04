import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronRight, CheckCircle } from 'lucide-react';

export default function EisenbalmShop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  const parseExcerpt = (text) => {
    if (!text) return text;
    
    const parts = text.split(/(\[[^\]]+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]/);
      if (match) {
        return (
          <a 
            key={index}
            href="#product" 
            className="text-sm tracking-[0.15em] text-black font-medium hover:underline transition-all duration-300 luxury-focus relative group"
          >
            {match[1].toUpperCase()}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const verifyPayment = useCallback(async (sessionId) => {
    setIsVerifying(true);
    try {
      const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';
      
      const response = await fetch(`${SERVER_URL}/verify-session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      const data = await response.json();
      
      if (data.status === 'paid') {
        setOrderDetails(data);
        setShowSuccessModal(true);
        setCart([]);
        setIsPageReady(true); // Dismiss loading screen when payment is verified
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setIsPageReady(true); // Also dismiss on error so user isn't stuck
    } finally {
      setIsVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for successful payment on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyPayment]);

  // Set up meta tags and preload video
  useEffect(() => {
    document.title = "Jesse A. Eisenbalm - Premium Lip Balm | Stay Human in an AI World";
    
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

    setMetaTag('description', 'The only business lip balm that keeps you human in an AI world. Premium natural beeswax lip care with a mindful ritual. Limited Edition Release 001. Stop. Breathe. Balm. All proceeds go to charity.');
    setMetaTag('keywords', 'lip balm, premium lip care, natural beeswax, mindful ritual, Jesse Eisenbalm, luxury lip balm, human-first products, AI world, limited edition');
    setMetaTag('author', 'Jesse A. Eisenbalm');
    setMetaTag('robots', 'index, follow');

    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:title', 'Jesse A. Eisenbalm - The Only Business Lip Balm That Keeps You Human', true);
    setMetaTag('og:description', 'Premium natural lip balm with a mindful ritual for the modern professional. Stop. Breathe. Balm. Limited Edition Release 001 - All proceeds go to charity.', true);
    setMetaTag('og:image', `${window.location.origin}/images/products/eisenbalm-1.png`, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:site_name', 'Jesse A. Eisenbalm', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', window.location.href);
    setMetaTag('twitter:title', 'Jesse A. Eisenbalm - Premium Lip Balm for Humans');
    setMetaTag('twitter:description', 'The only business lip balm that keeps you human in an AI world. Stop. Breathe. Balm. Limited Edition Release 001.');
    setMetaTag('twitter:image', `${window.location.origin}/images/products/eisenbalm-1.png`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    let productSchema = document.querySelector('#product-schema');
    if (!productSchema) {
      productSchema = document.createElement('script');
      productSchema.id = 'product-schema';
      productSchema.type = 'application/ld+json';
      document.head.appendChild(productSchema);
    }
    productSchema.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Jesse A. Eisenbalm - The Original",
      "image": [
        `${window.location.origin}/images/products/eisenbalm-1.png`,
        `${window.location.origin}/images/products/eisenbalm-2.png`,
        `${window.location.origin}/images/products/eisenbalm-3.png`
      ],
      "description": "Premium natural beeswax lip balm with mindful ritual. Limited Edition Release 001. Hand numbered. The only business lip balm that keeps you human in an AI world.",
      "brand": {
        "@type": "Brand",
        "name": "Jesse A. Eisenbalm"
      },
      "offers": {
        "@type": "Offer",
        "url": `${window.location.origin}/#product`,
        "priceCurrency": "USD",
        "price": "8.99",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "247"
      }
    });

    let orgSchema = document.querySelector('#organization-schema');
    if (!orgSchema) {
      orgSchema = document.createElement('script');
      orgSchema.id = 'organization-schema';
      orgSchema.type = 'application/ld+json';
      document.head.appendChild(orgSchema);
    }
    orgSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Jesse A. Eisenbalm",
      "url": window.location.origin,
      "logo": `${window.location.origin}/images/products/eisenbalm-1.png`,
      "description": "Premium natural lip care for humans. The only business lip balm that keeps you human in an AI world.",
      "sameAs": [
        "https://www.linkedin.com/company/108396769/"
      ]
    });

    const videoPreload = document.createElement('link');
    videoPreload.rel = 'preload';
    videoPreload.as = 'video';
    videoPreload.href = 'https://cdn.jsdelivr.net/gh/camilleyeyou/jesse-eisenbalm@main/public/videos/hero-background.mp4';
    document.head.appendChild(videoPreload);

    return () => {
      if (document.head.contains(videoPreload)) {
        document.head.removeChild(videoPreload);
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('js-reveal');
    return () => html.classList.remove('js-reveal');
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const all = Array.from(document.querySelectorAll('.scroll-reveal'));
    all.forEach((el) => {
      const isSection = el.tagName === 'SECTION' || el.classList.contains('scroll-snap-section');
      const hasChildReveals = el.querySelector('.scroll-reveal') && el.querySelector('.scroll-reveal') !== el;
      if (isSection || hasChildReveals) {
        el.classList.add('skip-reveal');
      } else {
        el.classList.add('reveal-target');
      }
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

    const safety = setTimeout(() => {
      document.querySelectorAll('.reveal-target:not(.visible)').forEach((el) => {
        el.classList.add('visible');
      });
    }, 2000);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      clearTimeout(safety);
    };
  }, []);

  const products = [
    {
      id: 1,
      name: "JESSE A. EISENBALM",
      subtitle: "The Original",
      price: 8.99,
      images: [
       "/images/products/eisenbalm-1.png",
       "/images/products/eisenbalm-2.png",
       "/images/products/eisenbalm-3.png"
      ],
      description: "Limited Edition. Release 001. Hand numbered.",
      features: ["Beeswax formula", "All-day hydration", "Daily ritual", "Reminder of your humanity", "And mortality"],
      volume: "4.5g / 0.15 oz"
    }
  ];

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, image: product.images[0] }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    setIsProcessing(true);
    try {
      const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';
      
      const response = await fetch(`${SERVER_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white scroll-snap-container" style={{
      '--je-spacing-unit': '16px',
      '--je-spacing': 'calc(var(--je-spacing-unit) * 1)',
      '--je-spacing-half': 'calc(var(--je-spacing) / 2)',
      '--je-primary-rgb': '0, 0, 0',
      '--je-secondary-rgb': '255, 255, 255',
      '--je-muted-rgb': '128, 128, 128',
      '--je-transition-speed': '0.25s',
      '--je-transition-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      scrollBehavior: 'smooth'
    }}>
      
      {!isPageReady && (
        <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-light tracking-[0.3em] mb-6">
              JESSE A. EISENBALM
            </div>
            <div className="w-64 h-0.5 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-white transition-all duration-1000 animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-gray-500 text-xs tracking-widest mt-6">LOADING EXPERIENCE</p>
          </div>
        </div>
      )}

      <div id="scroll-progress" className="scroll-progress"></div>

      <style>{`
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }

        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        .luxury-hover { transition: all var(--je-transition-speed) var(--je-transition-ease); }
        .luxury-hover:hover { transform: translateY(-2px); }
        .luxury-focus:focus-visible { outline: 2px solid rgba(var(--je-primary-rgb), 1); outline-offset: 2px; }

        .luxury-button { position: relative; overflow: hidden; }
        .luxury-button::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .luxury-button:hover::before { left: 100%; }

        .fade-in { animation: fadeIn 0.6s var(--je-transition-ease) forwards; opacity: 1 !important; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

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
        .skip-reveal { opacity: 1 !important; transform: none !important; }

        .parallax-slow, .parallax-medium, .parallax-fast {
          transition: transform 0.1s linear;
          will-change: transform;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        .scroll-snap-container { scroll-snap-type: y proximity; scroll-padding-top: 80px; -webkit-overflow-scrolling: touch; }
        .scroll-snap-section { scroll-snap-align: start; scroll-snap-stop: normal; }

        .scale-on-scroll {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        .text-split { display: inline-block; overflow: visible; }
        .text-split span {
          display: inline-block; opacity: 1; transform: translateY(0);
          -webkit-transform: translateY(0);
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); -webkit-transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); -webkit-transform: translateY(0); }
        }

        .image-reveal { position: relative; overflow: hidden; }
        .image-reveal::after {
          content: '';
          position: absolute; inset: 0;
          background: #000;
          transform: scaleX(1);
          -webkit-transform: scaleX(1);
          transform-origin: left;
          -webkit-transform-origin: left;
          transition: transform 1.2s cubic-bezier(0.76, 0, 0.24, 1);
          -webkit-transition: -webkit-transform 1.2s cubic-bezier(0.76, 0, 0.24, 1);
          z-index: 10;
        }
        .js-reveal .image-reveal.reveal-target.visible::after {
          transform: scaleX(0);
          -webkit-transform: scaleX(0);
          transform-origin: right;
          -webkit-transform-origin: right;
        }
        .image-reveal img { position: relative; z-index: 1; }

        .horizontal-scroll { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none; }
        .horizontal-scroll::-webkit-scrollbar { display: none; }
        .horizontal-scroll-item { flex: 0 0 80vw; scroll-snap-align: center; margin-right: 2rem; }

        .clip-reveal { transition: clip-path 1s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.8s ease; }
        .js-reveal .clip-reveal.reveal-target { opacity: 0; clip-path: inset(0 100% 0 0); -webkit-clip-path: inset(0 100% 0 0); }
        .js-reveal .clip-reveal.reveal-target.visible { opacity: 1; clip-path: inset(0 0 0 0); -webkit-clip-path: inset(0 0 0 0); }

        .magnetic { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

        .scroll-progress {
          position: fixed; top: 0; left: 0; height: 2px;
          background: linear-gradient(90deg, #000 0%, #666 100%);
          z-index: 9999; transform-origin: left; -webkit-transform-origin: left;
          transition: width 0.1s linear;
        }

        .hero-video {
          opacity: 0;
          transition: opacity 0.5s ease-in;
        }
        .hero-video.loaded {
          opacity: 1;
        }

        @media screen and (-webkit-min-device-pixel-ratio:0) {
          .parallax-slow, .parallax-medium, .parallax-fast {
            backface-visibility: hidden; -webkit-backface-visibility: hidden;
            perspective: 1000px; -webkit-perspective: 1000px;
          }
          .scroll-reveal { -webkit-font-smoothing: antialiased; }
        }

        p, h1, h2, h3, h4, h5, h6, span, a, button, div { opacity: 1; visibility: visible; }

        .success-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }

        .success-modal {
          background: white;
          max-width: 500px;
          width: 100%;
          border-radius: 0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #10b981;
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-checkmark svg {
          animation: drawCheck 0.5s ease 0.5s both;
        }

        @keyframes drawCheck {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="success-checkmark">
                <CheckCircle size={48} className="text-white" strokeWidth={2} />
              </div>
              
              <h2 className="text-3xl font-light mb-4 tracking-tight">Payment Successful!</h2>
              
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your order{orderDetails?.customerName ? `, ${orderDetails.customerName}` : ''}.
              </p>
              
              {orderDetails && (
                <div className="mt-6 p-6 bg-gray-50 text-left">
                  <div className="space-y-3 text-sm">
                    {orderDetails.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-light">{orderDetails.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-light text-lg">
                        ${orderDetails.amountTotal?.toFixed(2)} {orderDetails.currency?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-6 mb-8 leading-relaxed">
                A confirmation email has been sent to your inbox.<br/>
                Your order will be shipped within 2-3 business days.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="luxury-button w-full bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-gray-900 transition-all"
                >
                  CONTINUE SHOPPING
                </button>
                <button
                  onClick={() => window.location.href = '#contact'}
                  className="w-full py-4 text-sm tracking-[0.2em] text-gray-600 hover:text-black transition-all"
                >
                  CONTACT US
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <Link to="/" className="text-2xl font-light tracking-[0.2em] transition-all duration-300 hover:tracking-[0.25em]">
                JESSE A. EISENBALM
              </Link>
              <div className="hidden md:flex space-x-8">
                <a href="#product" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  PRODUCT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <Link to="/about" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <a href="#philosophy" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  PHILOSOPHY
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#journal" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  JOURNAL
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#contact" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  CONTACT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <Link to="/privacy-policy" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 luxury-focus relative group">
                  PRIVACY
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative text-gray-600 hover:text-black transition-all duration-300 luxury-focus"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                className="md:hidden luxury-focus"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 fade-in">
            <div className="px-6 py-6 space-y-6">
              <a href="#product" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>PRODUCT</a>
              <Link to="/about" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>ABOUT</Link>
              <a href="#philosophy" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>PHILOSOPHY</a>
              <a href="#journal" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>JOURNAL</a>
              <a href="#contact" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>CONTACT</a>
              <Link to="/privacy-policy" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>PRIVACY</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center" role="banner">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`absolute w-full h-full object-cover hero-video ${videoLoaded ? 'loaded' : ''}`}
            onLoadedData={() => setVideoLoaded(true)}
            onCanPlayThrough={() => {
              setVideoLoaded(true);
              setIsPageReady(true);
            }}
            poster="https://cdn.jsdelivr.net/gh/camilleyeyou/jesse-eisenbalm@main/public/images/hero-poster.jpg"
          >
            <source src="https://cdn.jsdelivr.net/gh/camilleyeyou/jesse-eisenbalm@main/public/videos/hero-background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-7xl md:text-9xl font-light text-white mb-8 tracking-tight leading-none">
            ARE THESE<br />MY REAL LIPS?
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light tracking-widest">
            STOP. BREATHE. BALM.
          </p>

          <p className="text-base md:text-lg text-white/80 mb-12 max-w-xl mx-auto font-light leading-relaxed">
            A human-only ritual for an AI-everywhere world. <br />
            Limited Edition.<br /> 
            Release 001. <br /> 
            All proceeds go to charity. 
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 fade-in">
            <a href="#product" className="luxury-button bg-white text-black px-12 py-4 text-sm tracking-[0.2em] hover:bg-gray-50 transition-all inline-flex items-center justify-center group border border-white/20">
              BUY NOW
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-24 px-6 bg-white scroll-reveal scroll-snap-section" itemScope itemType="https://schema.org/Product">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {products.map((product) => {
              const currentImage = selectedImage[product.id] || product.images[0];
              return (
                <React.Fragment key={product.id}>
                  <div className="order-2 md:order-1 scale-on-scroll" style={{
                    transform: `scale(${0.95 + Math.min(scrollY * 0.0001, 0.05)})`
                  }}>
                    <div className="relative aspect-square bg-gray-50 mb-4 overflow-hidden image-reveal scroll-reveal">
                      <img
                        src={currentImage}
                        alt="Jesse A. Eisenbalm - Premium natural beeswax lip balm"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        itemProp="image"
                      />
                    </div>

                    <div className="flex space-x-3">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage({ ...selectedImage, [product.id]: img })}
                          className={`w-20 h-20 bg-gray-50 overflow-hidden border-2 transition-all duration-300 clip-reveal scroll-reveal ${
                            currentImage === img ? 'border-black scale-95' : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{ transitionDelay: `${idx * 0.1}s` }}
                          aria-label={`View product image ${idx + 1}`}
                        >
                          <img src={img} alt={`Product view ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="order-1 md:order-2">
                    <div className="mb-8">
                      <p className="text-xs tracking-widest text-gray-500 mb-2">LIP CARE</p>
                      <h3 className="text-4xl font-light mb-2 tracking-tight" itemProp="name">{product.name}</h3>
                      <p className="text-xl text-gray-600 font-light mb-6">{product.subtitle}</p>
                      <p className="text-sm text-gray-500 mb-2">{product.volume}</p>
                      <p className="text-3xl font-light mb-8" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <span itemProp="price" content={product.price}>$</span>
                        <span itemProp="priceCurrency" content="USD">{product.price}</span>
                        <meta itemProp="availability" content="https://schema.org/InStock" />
                      </p>
                    </div>

                    <div className="mb-8">
                      <p className="text-base leading-relaxed text-gray-700 mb-6" itemProp="description">
                        {product.description}
                      </p>
                      <div className="space-y-2 mb-8">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <span className="w-1 h-1 bg-black rounded-full mr-3"></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="luxury-button w-full bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-gray-900 transition-all luxury-focus"
                    >
                      ADD TO CART
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4 italic tracking-wide">
                      "Are these my real lips?"
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journal/Principles Section */}
      <section id="journal" className="py-24 px-6 bg-white scroll-snap-section scroll-reveal">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="text-xs tracking-[0.2em] text-gray-500 mb-4"></p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">PRINCIPLES</h2>
              <p className="text-lg text-gray-600 mt-4 max-w-xl">Thoughts on staying human in an increasingly automated world</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                image: "/images/grid/image-1.png",
                category: "PHILOSOPHY",
                title: "Why Rituals Matter in a Digital Age",
                excerpt: "In an era of automation and AI-generated everything, small acts of self-care become revolutionary. We explore why intentional, human-only rituals are more important than ever for maintaining our sense of self in a world that's increasingly asking us to behave like machines."
              },
              {
                image: "/images/grid/image-20.png",
                category: "INGREDIENTS OF LIFE",
                title: "Time to die",
                excerpt: "Let's face it, you're going to die some day. Lip Balm is the modern memento mori that walks you back home with smooth, moisturized lips."
              },
              {
                image: "https://images.unsplash.com/photo-1487260211189-670c54da558d?w=800&h=600&fit=crop",
                category: "CULTURE",
                title: "Time to Buy.",             
                excerpt: "You've read enough quippy AI copy. Let's get to the buying already. Push that button. Or this one [buy now]."
              }
            ].map((post, idx) => (
              <article
                key={idx}
                className="group cursor-pointer clip-reveal scroll-reveal"
                style={{ transitionDelay: `${idx * 0.15}s` }}
              >
                <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-gray-100 image-reveal scroll-reveal">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs tracking-[0.2em] text-gray-500 mb-3">{post.category}</p>
                <h3 className="text-xl font-light mb-3 group-hover:text-gray-600 transition-colors leading-tight">{post.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {parseExcerpt(post.excerpt)}
                </p>
                <p className="text-xs tracking-wide text-gray-400">{post.date}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-black text-white scroll-snap-section scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-gray-400 mb-4">TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Generated Voices of Humanity</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Real generated reviews from personas navigating the complexity of the modern world.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                text: "This isn't just lip balm. It's a daily reminder to stay present. Before every Zoom meeting, I take those 5 seconds to stop, breathe, and apply. It's become my grounding ritual in an otherwise chaotic workday. The formula is incredible too—lasts through coffee, calls, and everything.",
                author: "Sarah Chen",
                role: "Product Designer, Google",
                location: "San Francisco, CA"
              },
              {
                text: "I bought it for the absurdist AI marketing angle. I stayed because it's genuinely the best lip balm I've ever used. The packaging alone makes it worth it—minimalist, premium, and it actually feels special to use. My entire team asked where I got it.",
                author: "Marcus Rodriguez",
                role: "Startup Founder, YC W24",
                location: "New York, NY"
              },
              {
                text: "As someone who creates content about wellness and mindfulness, I'm constantly pitched products. This is one of the few I actually use daily and recommend genuinely. The 'stop, breathe, balm' ritual has become part of my morning routine. It's small but meaningful.",
                author: "Jamie Park",
                role: "Wellness Creator, 250K followers",
                location: "Los Angeles, CA"
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="clip-reveal scroll-reveal"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-lg font-light leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="font-light text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400 mt-1">{testimonial.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white scroll-snap-section scroll-reveal">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">STAY HUMAN</p>
            <h2 className="text-4xl md:text-6xl font-light mb-6 tracking-tight">Join the Movement</h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-4">
               Get exclusive access to new products, human-first philosophy essays, and the occasional absurdist thought experiment.
            </p>
            <p className="text-base text-gray-500">
              But if you want to be anonymous, that's cool too. The lip balm is transparent; no one will know you've got it on. But you'll know.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-4 border border-gray-300 focus:border-black focus:outline-none transition-colors text-sm tracking-wide luxury-focus"
              />
              <button
                type="submit"
                className="luxury-button bg-black text-white px-8 py-4 text-sm tracking-[0.2em] hover:bg-gray-900 transition-all luxury-focus whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </div>
            {newsletterStatus === 'success' && (
              <p className="text-sm text-green-600 mt-4 fade-in">✓ Welcome to the movement. Check your inbox for confirmation.</p>
            )}
          </form>

          <p className="text-xs text-gray-500 leading-relaxed">
            By subscribing, you agree to receive marketing emails. Unsubscribe anytime with one click.
          </p>
        </div>
      </section>

      {/* Instagram Grid Section */}
      <section className="py-24 px-6 bg-white scroll-snap-section scroll-reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-4"></p>
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Follow the Ritual</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/images/grid/image-1.png",
              "/images/grid/image-2.png",
              "/images/grid/image-3.png",
              "/images/grid/image-4.png",
              "/images/grid/image-5.png",
              "/images/grid/image-6.png",
              "/images/grid/image-7.png",
              "/images/grid/image-8.png"
            ].map((img, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden bg-gray-100 group cursor-pointer image-reveal scroll-reveal"
                style={{ transitionDelay: `${idx * 0.05}s` }}
              >
                <img
                  src={img}
                  alt={`Jesse Eisenbalm lifestyle ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.linkedin.com/company/108396769/"
              target="_blank"
              rel="noopener noreferrer"
              className="luxury-button inline-block border-2 border-black text-black px-8 py-3 text-sm tracking-[0.2em] hover:bg-black hover:text-white transition-all luxury-focus"
            >
              FOLLOW US
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50 scroll-snap-section scroll-reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">WHY CHOOSE US</p>
            <h3 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">Crafted for the Human Experience.</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Every detail matters when you're creating moments of presence in an automated world</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: "🌿", title: "Pure Beeswax", desc: "Good stuff to soothe your lips and moisturize your mind." },
              { icon: "⏰", title: "Time Tested", desc: "The only balm to keep moisture in and slop out." },
              { icon: "📍", title: "Ethically Made", desc: "No art was plagiarized to make this product. (Except the marketing materials, those have a little plagiarism in them.)" },
              { icon: "✨", title: "Limited Edition", desc: "Individually numbered exclusively online offer." }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-8 bg-white hover:shadow-lg transition-all duration-500 luxury-hover clip-reveal scroll-reveal"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-light mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 px-6 relative overflow-hidden scroll-snap-section min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 parallax-slow"
            style={{ transform: `translateY(${scrollY * 0.2}px)`, willChange: 'transform' }}
          >
            <img
              src="/images/backgrounds/about-bg.jpg"
              alt="Background"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${1.1 + Math.min(scrollY * 0.00005, 0.1)})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-white">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-white/70 mb-4">PHILOSOPHY</p>
            <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-tight">The Human Ritual</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🛑</div>
              <h3 className="text-xl font-light mb-3 tracking-wide">STOP</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Pause your scroll. Close the tab. Step away from the screen. This moment is yours.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🫁</div>
              <h3 className="text-xl font-light mb-3 tracking-wide">BREATHE</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Take a real breath. Deep and slow. Feel your chest rise. Be present in your body.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">💄</div>
              <h3 className="text-xl font-light mb-3 tracking-wide">BALM</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Apply mindfully. Feel the texture. Notice the scent. No algorithm can do this for you.
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="border-t border-white/20 pt-8">
              <p className="text-2xl font-light italic text-white/90 leading-relaxed">
                "The only business lip balm that keeps you human in an AI world."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-light tracking-wide">SHOPPING CART</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-600 transition" aria-label="Close cart">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart size={48} strokeWidth={1} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex space-x-4 pb-6 border-b border-gray-200">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover bg-gray-50" />
                      <div className="flex-1">
                        <h3 className="font-light text-sm mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">${item.price}</p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 hover:border-black transition text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 hover:border-black transition text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-black transition"
                        aria-label="Remove item"
                      >
                        <X size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-light text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-4 text-sm tracking-widest hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'PROCESSING...' : 'CHECKOUT'}
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-3">Secure payment</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-black text-white py-16 px-6" role="contentinfo">
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