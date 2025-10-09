import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Star, Check, CreditCard, Award, Leaf, Heart, Shield } from 'lucide-react';

export default function EisenbalmShop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});

  const products = [
    {
      id: 1,
      name: "Jesse A. Eisenbalm — Original",
      price: 8.99,
      images: [
        "/images/products/eisenbalm-1.png",
        "/images/products/eisenbalm-2.png",
        "/images/products/eisenbalm-3.png"
      ],
      description: "Organic beeswax formula. The only business lip balm that keeps you human.",
      features: ["100% Organic Beeswax", "All-Day Moisture", "Unscented"],
      rating: 4.9,
      reviews: 127
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
    setIsProcessing(true);
    
    try {
      const response = await fetch('https://jesse-eisenbalm-server-pp4fmqh8d-camilleyeyous-projects.vercel.app/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">JE</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                JESSE A. EISENBALM
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#products" className="text-gray-700 hover:text-indigo-600 transition font-medium">Products</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 transition font-medium">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition font-medium">Reviews</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition font-medium">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <a href="#products" className="block py-2 text-gray-700 hover:text-indigo-600">Products</a>
              <a href="#about" className="block py-2 text-gray-700 hover:text-indigo-600">About</a>
              <a href="#testimonials" className="block py-2 text-gray-700 hover:text-indigo-600">Reviews</a>
              <a href="#contact" className="block py-2 text-gray-700 hover:text-indigo-600">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <div className="mb-6">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium border border-white/20 mb-8">
              The Only Business Lip Balm That Keeps You Human in an AI World
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white leading-tight">
            Are These My<br />Real Lips?
          </h1>
          
          <p className="text-xl md:text-3xl text-white/90 mb-4 font-light tracking-wide">
            Stop. Breathe. Balm.
          </p>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            A tangible, human-only ritual in an AI-everywhere world. Organic beeswax. Real moments. No algorithm can do it for you.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#products" className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition">
              Stay Human — $8.99
            </a>
            <a href="#about" className="bg-transparent text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition border-2 border-white">
              Learn the Ritual
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Leaf, text: "100% Organic" },
              { icon: Shield, text: "Dermatologist Tested" },
              { icon: Heart, text: "Cruelty-Free" },
              { icon: Award, text: "Premium Quality" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <badge.icon className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">{badge.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">In an AI-Saturated World, Business Balm Is the Only Salve</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">A small, physical cue to stay human while everything—from job applications to meetings—feels automated.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Organic Beeswax", desc: "Clean, minimalist formula. Real ingredients for real lips. Sustainably sourced and ethically produced." },
              { title: "Human-Only Ritual", desc: "Stop. Breathe. Apply. No algorithm can do this for you. A moment of mindfulness in your busy day." },
              { title: "Premium Yet Accessible", desc: "Just $8.99. Your moment of presence and control without breaking the bank." }
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 hover:shadow-xl transition-all duration-300 border border-indigo-100">
                <Check className="w-14 h-14 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">The Business Balm</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Your confidence cue before calls, interviews, and meetings. Absurdist modern luxury that matches the times we're living in.</p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
            {products.map((product) => {
              const currentImage = selectedImage[product.id] || product.images[0];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition duration-300"
                >
                  <div className="relative h-96 overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-100">
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800">
                      Premium
                    </div>
                    
                    {/* Image Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage({...selectedImage, [product.id]: img})}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                            currentImage === img ? 'border-white shadow-lg scale-110' : 'border-white/50'
                          }`}
                        >
                          <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 font-semibold">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                    
                    <div className="mb-4 space-y-2">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <Check size={14} className="text-green-600 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-gray-700 italic text-center">"Are these my real lips?"</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                        <p className="text-xs text-gray-500">Free shipping over $25</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition"
                      >
                        Stay Human
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/about-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/80"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">A Tangible Ritual in an AI-Everywhere World</h2>
            <p className="text-xl text-gray-300 italic mb-8 max-w-3xl mx-auto leading-relaxed">
              "I need a small, physical cue to stay human while everything—from job applications to meetings—feels automated."
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition">
              <h3 className="text-2xl font-bold mb-6 text-white">The Ritual</h3>
              <div className="space-y-5 text-gray-200 text-lg">
                <p className="flex items-start">
                  <span className="text-4xl mr-4 mt-1">🛑</span> 
                  <span><strong className="text-white">Stop.</strong> Pause your scroll. Close the tab. Step away from the screen. This moment is yours.</span>
                </p>
                <p className="flex items-start">
                  <span className="text-4xl mr-4 mt-1">🫁</span> 
                  <span><strong className="text-white">Breathe.</strong> Take a real breath. Deep and slow. Feel your chest rise. Be present in your body.</span>
                </p>
                <p className="flex items-start">
                  <span className="text-4xl mr-4 mt-1">💄</span> 
                  <span><strong className="text-white">Balm.</strong> Apply mindfully. Feel the texture. Notice the scent. No algorithm can do this for you.</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition">
              <h3 className="text-2xl font-bold mb-6 text-white">Why It Matters</h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                For young professionals navigating an AI-saturated job market, Jesse A. Eisenbalm offers a moment of presence and control. It's absurdist modern luxury that's wry, kind, weird, and human-first.
              </p>
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                In a world where chatbots write our emails, algorithms screen our resumes, and AI generates our content, this simple act of self-care becomes a rebellion. A declaration of humanity.
              </p>
              <p className="text-gray-200 text-lg leading-relaxed">
                Clean organic beeswax. Minimalist ingredients. Maximum humanity. Because in a world of generated everything, real lips deserve real care.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-300">Organic Ingredients</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">AI-Generated Formulas</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-white mb-2">127</div>
              <div className="text-gray-300">Happy Humans</div>
            </div>
          </div>

          <div className="text-center">
            <blockquote className="text-2xl md:text-3xl font-light italic text-gray-300 mb-8 leading-relaxed">
              "The only business lip balm that keeps you human in an AI world."
            </blockquote>
            <a href="#products" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition">
              Join the Movement
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">What Humans Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Sarah K.", 
                role: "Product Manager", 
                text: "Before every Zoom call, I apply this balm. It's my 5-second humanity check. My lips feel amazing and I feel grounded.",
                rating: 5
              },
              { 
                name: "Marcus T.", 
                role: "Software Engineer", 
                text: "I was skeptical about the 'human vs AI' angle, but honestly? This ritual works. It's my daily reminder that I'm not a machine.",
                rating: 5
              },
              { 
                name: "Jamie L.", 
                role: "UX Designer", 
                text: "The formula is incredible - no weird ingredients, just pure beeswax goodness. And the packaging? Chef's kiss. Very me.",
                rating: 5
              }
            ].map((review, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-indigo-50 p-6 rounded-2xl border border-indigo-100 hover:shadow-lg transition">
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">"{review.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-gray-800">{review.name}</p>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:bg-gray-100 p-2 rounded-full transition">
                  <X size={24} />
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-2">Add some humanity to your cart!</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-indigo-600 font-bold">${item.price}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-200 transition font-bold"
                          >
                            -
                          </button>
                          <span className="font-semibold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-200 transition font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-indigo-600">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gray-900 text-white py-4 rounded-full font-bold hover:bg-gray-800 hover:shadow-xl transform hover:scale-[1.02] transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard size={20} />
                    <span>{isProcessing ? 'Processing...' : 'Checkout Securely'}</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">🔒 Secure payment powered by Stripe</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                JESSE A. EISENBALM
              </span>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Premium natural lip care for humans. Stay present, stay human, stay moisturized.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#products" className="block text-gray-400 hover:text-white transition">Products</a>
                <a href="#about" className="block text-gray-400 hover:text-white transition">About</a>
                <a href="#testimonials" className="block text-gray-400 hover:text-white transition">Reviews</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="space-y-2">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition">Instagram</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 JESSE A. EISENBALM. All rights reserved. · Human-First, Always.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}