require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://jesse-eisenbalm.vercel.app',
    'https://jesse-eisenbalm-kh0wbt3vd-camilleyeyous-projects.vercel.app',
    /vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Jesse A. Eisenbalm Server is running! (Mock Mode)' });
});

// Mock Stripe Checkout Session (NO STRIPE KEY NEEDED)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;
    
    console.log('📦 Order received:', items);
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('💰 Total:', `$${total.toFixed(2)}`);
    
    // Generate a fake session ID
    const fakeSessionId = 'mock_session_' + Date.now();
    
    // Simulate Stripe checkout URL
    const mockCheckoutUrl = `http://localhost:4242/mock-checkout?session=${fakeSessionId}&total=${total.toFixed(2)}`;
    
    res.json({ url: mockCheckoutUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mock Stripe Checkout Page
app.get('/mock-checkout', (req, res) => {
  const { session, total } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Stripe Checkout</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
        }
        .checkout-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #1a1a1a;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .subtitle {
          color: #666;
          margin: 0 0 30px 0;
          font-size: 14px;
        }
        .total {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .total-label {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .total-amount {
          color: #1a1a1a;
          font-size: 36px;
          font-weight: bold;
        }
        .card-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          margin: 10px 0;
          box-sizing: border-box;
        }
        .card-input:focus {
          outline: none;
          border-color: #667eea;
        }
        .pay-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s;
        }
        .pay-button:hover {
          transform: translateY(-2px);
        }
        .test-info {
          background: #fff5f5;
          border: 2px solid #feb2b2;
          color: #c53030;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          font-size: 13px;
        }
        .test-info strong {
          display: block;
          margin-bottom: 5px;
        }
        .logo {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="checkout-container">
        <h1>Complete Your Order</h1>
        <p class="subtitle">Jesse A. Eisenbalm - Stay Human</p>
        
        <div class="total">
          <div class="total-label">Total Amount</div>
          <div class="total-amount">$${total}</div>
        </div>
        
        <form onsubmit="handlePayment(event)">
          <input 
            type="text" 
            class="card-input" 
            placeholder="Card Number (use 4242 4242 4242 4242)" 
            value="4242 4242 4242 4242"
            required
          />
          <input 
            type="text" 
            class="card-input" 
            placeholder="MM / YY (any future date)" 
            value="12 / 25"
            required
          />
          <input 
            type="text" 
            class="card-input" 
            placeholder="CVC (any 3 digits)" 
            value="123"
            required
          />
          <input 
            type="email" 
            class="card-input" 
            placeholder="Email Address" 
            required
          />
          
          <button type="submit" class="pay-button">
            💳 Pay $${total}
          </button>
        </form>
        
        <div class="test-info">
          <strong>🧪 TEST MODE</strong>
          This is a mock payment - no real charges will be made. 
          Click "Pay" to simulate a successful payment!
        </div>
        
        <div class="logo">
          Powered by Mock Stripe (Test Mode)
        </div>
      </div>
      
      <script>
        function handlePayment(event) {
          event.preventDefault();
          
          // Simulate payment processing
          const button = event.target.querySelector('button');
          button.innerHTML = '⏳ Processing...';
          button.disabled = true;
          
          setTimeout(() => {
            // Redirect to success page
            window.location.href = 'https://jesse-eisenbalm.vercel.app/success?session_id=${session}';
          }, 2000);
        }
      </script>
    </body>
    </html>
  `);
});

// Verify mock session
app.get('/verify-session/:sessionId', (req, res) => {
  res.json({
    status: 'paid',
    customerEmail: 'test@example.com',
    mock: true
  });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎭 Running in MOCK MODE (no Stripe key needed)`);
});