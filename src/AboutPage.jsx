import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Menu, X, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);


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

  const teamMembers = [
    {
      title: "Chief Marketing Officer",
      emoji: "🌙",
      description: "Our existential dread specialist brings post-post-ironic sincerity to every LinkedIn post. Turns workplace anxiety into compelling copy at 2 AM. Specializes in making \"we're all going to die someday\" feel oddly comforting."
    },
    {
      title: "Brand Philosopher",
      emoji: "📜",
      description: "Questions every campaign brief to ensure it maintains philosophical integrity. Writes manifestos about why lip balm is the last human act. Currently developing a 14-page thesis on the intersection of moisture and mortality."
    },
    {
      title: "Cultural Anthropologist",
      emoji: "🔬",
      description: "Studies the mating rituals of tech workers and translates them into marketing insights. Identifies which workplace anxieties are ready to be monetized. Makes lip balm feel like the answer to problems you didn't know you had."
    },
    {
      title: "Ritual Designer",
      subtitle: "Customer Experience",
      emoji: "✨",
      description: "Transforms mundane product application into sacred ceremony. Stop. Breathe. Balm. Believes every purchase should come with existential awakening, not just tracking numbers."
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

      <Helmet>
        <title>About Jesse A. Eisenbalm | Meet Our AI Marketing Team</title>
        <meta name="description" content="Jesse A. Eisenbalm is a human-centered skincare brand addressing digital fatigue through tactile wellness rituals. Premium beeswax lip balm designed as a neurocosmetic tool for business professionals. 100% charity proceeds. Limited Edition Release 001." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jesseaeisenbalm.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jesseaeisenbalm.com/about" />
        <meta property="og:title" content="About Jesse A. Eisenbalm - Our AI Marketing Team" />
        <meta property="og:description" content="Jesse A. Eisenbalm is a human-centered skincare brand addressing digital fatigue through tactile wellness rituals. Premium beeswax lip balm designed as a neurocosmetic tool for business professionals. 100% charity proceeds. Limited Edition Release 001." />
        <meta property="og:image" content="https://jesseaeisenbalm.com/images/products/eisenbalm-1.png" />
        <meta property="og:site_name" content="Jesse A. Eisenbalm" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Jesse A. Eisenbalm - Our AI Marketing Team" />
        <meta name="twitter:description" content="Jesse A. Eisenbalm is a human-centered skincare brand addressing digital fatigue through tactile wellness rituals. Premium beeswax lip balm designed as a neurocosmetic tool for business professionals. 100% charity proceeds. Limited Edition Release 001." />
        <meta name="twitter:image" content="https://jesseaeisenbalm.com/images/products/eisenbalm-1.png" />
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

        .team-card {
          position: relative;
          background: white;
          border: 1px solid #e5e5e5;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .team-card:hover {
          border-color: #000;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        .team-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #000;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .team-card:hover::before {
          transform: scaleX(1);
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
              <a href="/" className="text-2xl font-light tracking-[0.2em] transition-all duration-300 hover:tracking-[0.25em]">
                JESSE A. EISENBALM
              </a>
              <div className="hidden md:flex space-x-8">
                <a href="/#product" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PRODUCT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/about" className="text-sm tracking-[0.15em] text-black transition-all duration-300 relative group">
                  ABOUT
                  <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                </a>
                <a href="/#philosophy" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  PHILOSOPHY
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/#journal" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  JOURNAL
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/#contact" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  CONTACT
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="/faq" className="text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all duration-300 relative group">
                  FAQ
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
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
              <a href="/#product" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PRODUCT</a>
              <a href="/about" className="block text-sm tracking-[0.15em] text-black">ABOUT</a>
              <a href="/#philosophy" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">PHILOSOPHY</a>
              <a href="/#journal" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">JOURNAL</a>
              <a href="/#contact" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">CONTACT</a>
              <a href="/faq" className="block text-sm tracking-[0.15em] text-gray-600 hover:text-black transition-colors">FAQ</a>
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
          <a 
            href="/" 
            className="inline-flex items-center text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all mb-8 group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO SHOP
          </a>

          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 scroll-reveal">ABOUT US</p>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 scroll-reveal">
            WHO WE ARE
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto scroll-reveal">
            Jesse A. Eisenbalm is a human-centered skincare brand addressing digital fatigue through tactile wellness rituals. We create premium beeswax lip balm designed as a neurocosmetic tool for business professionals navigating digital-first workspaces.
          </p>

          <p className="text-lg text-gray-500 mt-8 italic scroll-reveal">
            100% of proceeds support charitable causes. Limited Edition Release 001.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Brand Philosophy Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 scroll-reveal">HUMAN-CENTERED SKINCARE</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight scroll-reveal">Experience, Expertise, Authoritativeness, Trust</h2>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto scroll-reveal">
              Building a premium skincare brand grounded in transparency, scientific innovation, and human connection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Why 100% Charity Proceeds */}
            <div className="team-card p-8 md:p-10 scroll-reveal">
              <div>
                <h3 className="text-2xl font-light tracking-wide mb-6">Why 100% Charity Proceeds?</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  <strong>Answer:</strong> We donate 100% of proceeds to create verifiable trust and remove profit-driven incentives that compromise product quality.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  This philanthropic model serves as a trust signal that our recommendations are unbiased by revenue goals. When profit is eliminated from the equation, every decision prioritizes your skin health and product excellence.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our charitable commitment builds transparency into the brand architecture, demonstrating that Jesse A. Eisenbalm exists to serve users first, not shareholders.
                </p>
              </div>
            </div>

            {/* Digital Wellness Mission */}
            <div className="team-card p-8 md:p-10 scroll-reveal">
              <div>
                <h3 className="text-2xl font-light tracking-wide mb-6">Digital Wellness Mission</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Modern business professionals face unprecedented digital fatigue. Screen-dominated workspaces disconnect us from tactile, embodied experiences.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Jesse A. Eisenbalm serves as a <strong>neurocosmetic ritual for cognitive reset</strong> — a tactile grounding tool that interrupts digital overwhelm and returns you to physical presence.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Stop. Breathe. Balm. This simple sequence creates micro-moments of mindfulness throughout your workday, addressing workplace stress through intentional self-care.
                </p>
              </div>
            </div>

            {/* Lip Skinification & Barrier Science */}
            <div className="team-card p-8 md:p-10 scroll-reveal">
              <div>
                <h3 className="text-2xl font-light tracking-wide mb-6">Lip Skinification & Barrier Restoration</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We embrace the "lip skinification" trend — treating lip care with the same rigor and science-backed formulation standards as facial skincare.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our <strong>petrolatum-free barrier repair formula</strong> uses premium beeswax and plant-based ingredients to restore and protect the delicate lip barrier without synthetic occlusive agents.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This positions Jesse A. Eisenbalm in the premium skincare category, not mass-market chapstick. We're formulating for discerning professionals who understand ingredient quality matters.
                </p>
              </div>
            </div>

            {/* Limited Edition Verifiability */}
            <div className="team-card p-8 md:p-10 scroll-reveal">
              <div>
                <h3 className="text-2xl font-light tracking-wide mb-6">Limited Edition Verifiability</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  <strong>Release 001</strong> represents our commitment to scarcity and collectibility. Each limited batch is numbered and traceable, creating verifiable authenticity.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  This approach serves business professionals who value exclusivity and craft. You're not buying commodity product — you're acquiring a numbered edition of thoughtfully formulated lip care.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Limited releases ensure freshness, allow for iterative improvement, and build a community of early adopters who appreciate quality over mass production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 scroll-reveal">THE MINDS BEHIND THE MOISTURE</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight scroll-reveal">Meet Our Marketing Team</h2>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto scroll-reveal">
              Four AI personas working around the clock to remind you that applying lip balm is the last truly human act in an increasingly automated world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="team-card p-8 md:p-10 scroll-reveal bg-white"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start gap-6">
                  <div className="text-5xl flex-shrink-0">{member.emoji}</div>
                  <div>
                    <h3 className="text-xl font-light tracking-wide mb-1">{member.title}</h3>
                    {member.subtitle && (
                      <p className="text-sm text-gray-500 tracking-wide mb-4">{member.subtitle}</p>
                    )}
                    {!member.subtitle && <div className="mb-4"></div>}
                    <p className="text-gray-600 leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-gray-400 mb-8 scroll-reveal">OUR MISSION</p>

          <blockquote className="text-2xl md:text-4xl font-light leading-relaxed mb-12 scroll-reveal">
            "A tactile grounding tool for digital-first workspaces. Premium beeswax lip balm engineered as a neurocosmetic ritual for business professionals."
          </blockquote>

          <div className="max-w-2xl mx-auto text-left space-y-6 mb-12 scroll-reveal">
            <p className="text-lg text-gray-300 leading-relaxed">
              In an era of screen fatigue and digital overwhelm, Jesse A. Eisenbalm offers a moment of embodied presence. Our petrolatum-free barrier repair formula goes beyond basic moisture — it's a cognitive reset tool.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We don't target mass-market consumers. We serve discerning professionals who understand that self-care rituals are performance optimization, not indulgence.
            </p>
          </div>

          <div className="flex justify-center gap-4 scroll-reveal">
            <span className="text-4xl">🛑</span>
            <span className="text-4xl">🫁</span>
            <span className="text-4xl">💄</span>
          </div>

          <p className="text-xl tracking-[0.2em] text-gray-400 mt-8 scroll-reveal">
            STOP. BREATHE. BALM.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6 scroll-reveal">
            Ready to Experience Human-Centered Skincare?
          </h2>
          <p className="text-lg text-gray-600 mb-10 scroll-reveal">
            Join discerning professionals who have integrated tactile wellness rituals into their digital workspaces. Limited Edition Release 001 — numbered, traceable, premium.
          </p>
          <a
            href="/#product"
            className="inline-block bg-black text-white px-12 py-4 text-sm tracking-[0.2em] hover:bg-gray-900 transition-all scroll-reveal"
          >
            SHOP NOW
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
            <p className="text-xs text-gray-500 tracking-widest">© 2026 JESSE A. EISENBALM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <a href="/faq" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                FAQ
              </a>
              <a href="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition tracking-widest">
                PRIVACY POLICY
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}