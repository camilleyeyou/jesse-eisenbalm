import React, { useState } from 'react';
import { ShoppingCart, Menu, X, ChevronRight } from 'lucide-react';

export default function EisenbalmShop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});

  const products = [
    {
      id: 1,
      name: "JESSE A. EISENBALM",
      subtitle: "The Original",
      price: 8.99,
      images: [
        "/public/images/products/eisenbalm-1.png",
        "/public/images/products/eisenbalm-2.png",
        "/public/images/products/eisenbalm-3.png"
      ],
      description: "Organic beeswax formula. A tangible ritual for the human experience.",
      features: ["Organic Beeswax", "All-Day Hydration", "Human-First Formula"],
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <div className="text-2xl font-light tracking-widest">
                JESSE A. EISENBALM
              </div>
              
              <div className="hidden md:flex space-x-8">
                <a href="#product" className="text-sm tracking-wide text-gray-600 hover:text-black transition">PRODUCT</a>
                <a href="#philosophy" className="text-sm tracking-wide text-gray-600 hover:text-black transition">PHILOSOPHY</a>
                <a href="#contact" className="text-sm tracking-wide text-gray-600 hover:text-black transition">CONTACT</a>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative text-gray-600 hover:text-black transition"
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-6 py-4 space-y-4">
              <a href="#product" className="block text-sm tracking-wide text-gray-600 hover:text-black">PRODUCT</a>
              <a href="#philosophy" className="block text-sm tracking-wide text-gray-600 hover:text-black">PHILOSOPHY</a>
              <a href="#contact" className="block text-sm tracking-wide text-gray-600 hover:text-black">CONTACT</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
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
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1 className="text-7xl md:text-9xl font-light text-white mb-8 tracking-tight leading-none">
            ARE THESE<br />MY REAL LIPS?
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light tracking-widest">
            STOP. BREATHE. BALM.
          </p>
          
          <p className="text-base md:text-lg text-white/80 mb-12 max-w-xl mx-auto font-light leading-relaxed">
            A tangible, human-only ritual in an AI-everywhere world.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#product" className="bg-white text-black px-12 py-4 text-sm tracking-widest hover:bg-gray-100 transition inline-flex items-center justify-center group">
              DISCOVER
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition" />
            </a>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {products.map((product) => {
              const currentImage = selectedImage[product.id] || product.images[0];
              return (
                <React.Fragment key={product.id}>
                  {/* Product Images */}
                  <div className="order-2 md:order-1">
                    <div className="relative aspect-square bg-gray-50 mb-4 overflow-hidden">
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage({...selectedImage, [product.id]: img})}
                          className={`w-20 h-20 bg-gray-50 overflow-hidden border-2 transition ${
                            currentImage === img ? 'border-black' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="order-1 md:order-2">
                    <div className="mb-8">
                      <p className="text-xs tracking-widest text-gray-500 mb-2">LIP CARE</p>
                      <h2 className="text-4xl font-light mb-2 tracking-tight">{product.name}</h2>
                      <p className="text-xl text-gray-600 font-light mb-6">{product.subtitle}</p>
                      <p className="text-sm text-gray-500 mb-2">{product.volume}</p>
                      <p className="text-3xl font-light mb-8">${product.price}</p>
                    </div>

                    <div className="mb-8">
                      <p className="text-base leading-relaxed text-gray-700 mb-6">
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
                      className="w-full bg-black text-white py-4 text-sm tracking-widest hover:bg-gray-900 transition"
                    >
                      ADD TO CART
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4 italic">
                      "Are these my real lips?"
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/about-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-white">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-white/70 mb-4">PHILOSOPHY</p>
            <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-tight">The Human Ritual</h2>
            <p className="text-xl text-white/80 italic max-w-3xl mx-auto leading-relaxed font-light">
              "I need a small, physical cue to stay human while everything—from job applications to meetings—feels automated."
            </p>
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
            <p className="text-lg leading-relaxed text-white/80 mb-8 font-light">
              For young professionals navigating an AI-saturated job market, Jesse A. Eisenbalm offers a moment of presence and control. Clean organic beeswax. Minimalist ingredients. Maximum humanity.
            </p>
            
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
                <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-600 transition">
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
                          >
                            -
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 hover:border-black transition text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-black transition"
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
      <footer id="contact" className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-sm tracking-widest mb-6">CONTACT</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                For inquiries, please reach out through our social channels.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm tracking-widest mb-6">FOLLOW</h3>
              <div className="space-y-2">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-white transition">Instagram</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-white transition">Twitter</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm tracking-widest mb-6">PHILOSOPHY</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Premium natural lip care for humans. Stay present, stay human, stay moisturized.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-500 tracking-widest">© 2025 JESSE A. EISENBALM. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}