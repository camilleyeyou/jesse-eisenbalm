require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Jesse A. Eisenbalm Server is running!',
    mode: process.env.STRIPE_SECRET_KEY?.includes('test') ? 'TEST' : 'LIVE'
  });
});

// Real Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;
    
    console.log('📦 Order received:', items);
    
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
   const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description || 'Premium organic lip balm',
        // Only include images if they're full URLs (start with http:// or https://)
        images: item.image && item.image.startsWith('http') ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
}));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        orderDetails: JSON.stringify(items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })))
      }
    });
    
    console.log('✅ Stripe session created:', session.id);
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Stripe session
app.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      amountTotal: session.amount_total / 100,
      currency: session.currency,
    });
  } catch (error) {
    console.error('❌ Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('test') ? 'TEST' : 'LIVE'}`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables!');
  }
});