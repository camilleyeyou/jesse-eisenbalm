import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="text-2xl font-light tracking-[0.2em] transition-all duration-300 hover:tracking-[0.25em]">
              JESSE A. EISENBALM
            </Link>
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm tracking-[0.15em] text-gray-500 hover:text-black transition-all"
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              BACK TO SHOP
            </Link>
          </div>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 tracking-wide">Last updated: November 2025</p>
        </div>

        {/* Introduction */}
        <div className="mb-16 pb-12 border-b border-gray-200">
          <h2 className="text-3xl font-light mb-6 tracking-tight">Your Privacy Matters</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            We care about your privacy — and we'll always be transparent about what we collect and how we use it. 
            This policy explains what information we collect, why we collect it, and how you can control it.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">1.</span>
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We collect information in three main ways:
            </p>
            <ul className="space-y-4 ml-8">
              <li className="text-gray-600 leading-relaxed">
                <strong className="text-black font-medium">You give it to us.</strong> When you place an order, or sign up for our emails, 
                you share things like your name, email address, shipping info, and payment details.
              </li>
              <li className="text-gray-600 leading-relaxed">
                <strong className="text-black font-medium">We collect it automatically.</strong> Like most websites, we use cookies and 
                analytics tools to understand how visitors browse our site and to improve your shopping experience.
              </li>
              <li className="text-gray-600 leading-relaxed">
                <strong className="text-black font-medium">We get it from others.</strong> If you log in or pay through a third party 
                (like Google Pay, Shop Pay, or PayPal), we may receive limited information from them to complete your purchase.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">2.</span>
              How We Use Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We use your information to:
            </p>
            <ul className="space-y-3 ml-8">
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Process and deliver your orders
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Communicate with you about purchases, returns, and updates
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Improve our products, website, and customer experience
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Send occasional marketing emails (only if you opt in)
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Detect and prevent fraud or abuse
              </li>
            </ul>
            <p className="text-gray-800 leading-relaxed mt-6 font-medium">
              We do not sell your personal information — ever.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">3.</span>
              Cookies & Tracking
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to make our site work better and to personalize your experience. You can turn cookies off 
              in your browser settings.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">4.</span>
              How We Protect Your Data
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We use secure payment processors and industry-standard encryption to protect your data in transit and at rest. 
              Only trusted team members and service providers who need your info to fulfill your order have access to it.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">5.</span>
              Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Depending on where you live, you may have the right to:
            </p>
            <ul className="space-y-3 ml-8">
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Access, correct, or delete your personal data
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Opt out of marketing emails at any time
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Request a copy of the data we hold about you
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-6">
              To make a request, contact us at{' '}
              <a 
                href="mailto:privacy@jessieaeisenbalm.com" 
                className="text-black hover:underline font-medium"
              >
                privacy@jessieaeisenbalm.com
              </a>
              .
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">6.</span>
              Sharing Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We share limited information with:
            </p>
            <ul className="space-y-3 ml-8">
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Shipping partners (to deliver your order)
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Payment processors (to securely handle payments)
              </li>
              <li className="text-gray-600 leading-relaxed flex items-start">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></span>
                Analytics and advertising tools (to understand and improve our site)
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-6">
              These partners are required to keep your data safe and use it only as instructed.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">7.</span>
              Children's Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our site isn't designed for children under 13, and we don't knowingly collect their information.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-light mb-6 tracking-tight flex items-center gap-3">
              <span className="text-3xl font-light text-gray-300">8.</span>
              Changes to This Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this policy from time to time. If we make major changes, we'll let you know by email or on our website.
            </p>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="bg-gray-50 p-8 text-center">
            <h3 className="text-xl font-light mb-4 tracking-tight">Questions?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy, please don't hesitate to reach out.
            </p>
            <a 
              href="mailto:privacy@jessieaeisenbalm.com"
              className="inline-block bg-black text-white px-8 py-3 text-sm tracking-[0.2em] hover:bg-gray-900 transition-all"
            >
              CONTACT US
            </a>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-black text-white py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 tracking-widest">
              © 2025 JESSE A. EISENBALM. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              <Link 
                to="/" 
                className="text-xs text-gray-500 hover:text-white transition tracking-widest"
              >
                HOME
              </Link>
              <a 
                href="mailto:contact@jesseaeisenbalm.com" 
                className="text-xs text-gray-500 hover:text-white transition tracking-widest"
              >
                CONTACT
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}