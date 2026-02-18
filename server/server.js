require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Supabase client (server-side, uses service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API key auth middleware for blog write routes
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.BLOG_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Generate URL-safe slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow localhost, vercel.app, and your custom domain
    if (origin.includes('localhost') || 
        origin.includes('vercel.app') || 
        origin.includes('jesseaeisenbalm.com')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
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

// --- Blog API ---

// GET /api/posts — list all published posts (public)
app.get('/api/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, author, cover_image, tags, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ posts: data });
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:slug — single published post (public)
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Post not found' });
      throw error;
    }
    res.json({ post: data });
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts — create a post (API key required)
app.post('/api/posts', requireApiKey, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      author = 'Jesse A. Eisenbalm',
      cover_image,
      tags,
      published = false,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    // Generate unique slug
    let slug = generateSlug(title);
    const { data: existing } = await supabase
      .from('posts')
      .select('slug')
      .like('slug', `${slug}%`);

    if (existing?.length) {
      const slugs = existing.map(r => r.slug);
      if (slugs.includes(slug)) {
        let i = 1;
        while (slugs.includes(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, slug, content, excerpt, author, cover_image, tags, published }])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Blog post created:', data.slug);
    res.status(201).json({ post: data });
  } catch (error) {
    console.error('❌ Error creating post:', error);
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