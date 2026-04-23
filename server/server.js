require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Supabase client (server-side, uses service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Resend client for email notifications (null if not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) {
  console.warn('⚠️  RESEND_API_KEY not set — order confirmation emails will be skipped');
}

// Send order confirmation email (idempotent via PaymentIntent metadata flag)
async function sendOrderConfirmationEmail(session) {
  if (!resend) return;
  if (session.payment_status !== 'paid' || !session.customer_details?.email) {
    return;
  }

  // Idempotency check: has email already been sent for this PaymentIntent?
  let existingMetadata = {};
  if (session.payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      existingMetadata = pi.metadata || {};
      if (existingMetadata.email_sent === 'true') {
        console.log('✉️  Email already sent for session:', session.id);
        return;
      }
    } catch (err) {
      console.warn('⚠️  Could not check email idempotency flag:', err.message);
    }
  }

  const customerEmail = session.customer_details.email;
  const customerName = session.customer_details.name || 'Customer';
  const shipping = session.shipping_details;
  const addr = shipping?.address;

  const shippingAddressHtml = addr ? `
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
      <p style="margin: 5px 0; color: #555;">
        ${shipping.name || customerName}<br>
        ${addr.line1 || ''}<br>
        ${addr.line2 ? addr.line2 + '<br>' : ''}
        ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}<br>
        ${addr.country || ''}
      </p>
    </div>
  ` : '';

  const orderItemsHtml = session.metadata?.orderDetails ? JSON.parse(session.metadata.orderDetails).map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: left;">${item.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">$${(item.price).toFixed(2)}</td>
    </tr>
  `).join('') : '';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p style="color: #666;">Hi ${customerName},</p>
      <p style="color: #666;">Thank you for your order! We've received your payment and will be shipping your items soon.</p>

      <div style="margin: 20px 0;">
        <h3 style="color: #333;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; color: #333;">Item</th>
              <th style="padding: 10px; text-align: center; color: #333;">Qty</th>
              <th style="padding: 10px; text-align: right; color: #333;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>
        <div style="margin-top: 15px; text-align: right;">
          <h3 style="color: #333; margin: 10px 0;">Total: $${(session.amount_total / 100).toFixed(2)}</h3>
        </div>
      </div>

      ${shippingAddressHtml}

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
        <p>Order ID: ${session.id}</p>
        <p>We'll send you a tracking number as soon as your order ships!</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: customerEmail,
    subject: '✨ Order Confirmation - Jesse A. Eisenbalm',
    html: emailHtml,
  });
  console.log('✉️  Order confirmation email sent to:', customerEmail);

  // Mark as sent to prevent duplicates
  if (session.payment_intent) {
    try {
      await stripe.paymentIntents.update(session.payment_intent, {
        metadata: { ...existingMetadata, email_sent: 'true' },
      });
    } catch (err) {
      console.warn('⚠️  Could not set email_sent flag:', err.message);
    }
  }
}

// Trigger a Vercel rebuild so new posts get pre-rendered
async function triggerDeploy(reason) {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) return; // no hook configured — skip silently
  try {
    await fetch(hookUrl, { method: 'POST' });
    console.log(`🚀 Vercel deploy triggered: ${reason}`);
  } catch (err) {
    console.warn('⚠️  Could not trigger deploy hook:', err.message);
  }
}

// API key auth middleware for automation routes
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.BLOG_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Admin password middleware for browser admin UI routes
function requireAdminPassword(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
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
const allowedOrigins = [
  'http://localhost:3000',
  'https://jesseaeisenbalm.com',
  'https://www.jesseaeisenbalm.com',
  /\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return origin === allowed || origin.startsWith(allowed);
    });

    if (isAllowed) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-password']
}));

// Stripe webhook — must be defined BEFORE express.json() to preserve raw body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured — webhook received but not verified');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.warn('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
      await sendOrderConfirmationEmail(session);
    } catch (err) {
      console.warn('⚠️  Webhook email send failed:', err.message);
    }
  }

  res.json({ received: true });
});

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
      success_url: `${frontendUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      billing_address_collection: 'auto',
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

    const shipping = session.shipping_details;

    // Write shipping address into PaymentIntent metadata so it's visible in Stripe Dashboard
    if (session.payment_intent && shipping?.address) {
      const addr = shipping.address;
      try {
        await stripe.paymentIntents.update(session.payment_intent, {
          metadata: {
            shipping_name: shipping.name || '',
            shipping_line1: addr.line1 || '',
            shipping_line2: addr.line2 || '',
            shipping_city: addr.city || '',
            shipping_state: addr.state || '',
            shipping_postal_code: addr.postal_code || '',
            shipping_country: addr.country || '',
          },
          shipping: {
            name: shipping.name || '',
            address: {
              line1: addr.line1 || '',
              line2: addr.line2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postal_code: addr.postal_code || '',
              country: addr.country || '',
            },
          },
        });
      } catch (err) {
        console.warn('⚠️  Could not update PaymentIntent with shipping:', err.message);
      }
    }

    // Send order confirmation email (fire-and-forget; webhook is primary, this is fallback)
    sendOrderConfirmationEmail(session).catch(err => {
      console.warn('⚠️  Could not send order confirmation email:', err.message);
    });

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      customerPhone: session.customer_details?.phone,
      amountTotal: session.amount_total / 100,
      currency: session.currency,
      shippingName: shipping?.name,
      shippingAddress: shipping?.address,
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
    if (data.published) triggerDeploy(`new post published: ${data.slug}`);
    res.status(201).json({ post: data });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Admin UI API (password-protected, for browser admin page) ---

// Multer — memory storage for image uploads (max 10MB, images only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/admin/auth — verify admin password (no secrets in response)
app.post('/api/admin/auth', requireAdminPassword, (req, res) => {
  res.json({ ok: true });
});

// POST /api/admin/upload — upload cover image to Supabase Storage
app.post('/api/admin/upload', requireAdminPassword, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    console.log('✅ Image uploaded:', publicUrl);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/posts — create post via browser admin UI
app.post('/api/admin/posts', requireAdminPassword, async (req, res) => {
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

    let slug = req.body.slug ? req.body.slug.trim() : generateSlug(title);
    if (!slug) slug = generateSlug(title);

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
    console.log('✅ Blog post created via admin UI:', data.slug);
    if (data.published) triggerDeploy(`new post published via admin: ${data.slug}`);
    res.status(201).json({ post: data });
  } catch (error) {
    console.error('❌ Error creating post (admin):', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/posts — list ALL posts including drafts (admin only)
app.get('/api/admin/posts', requireAdminPassword, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, author, cover_image, tags, published, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ posts: data });
  } catch (error) {
    console.error('❌ Error fetching admin posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/posts/:id — update published status (and optionally other fields)
app.patch('/api/admin/posts/:id', requireAdminPassword, async (req, res) => {
  try {
    const { published } = req.body;
    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'published (boolean) is required' });
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ published, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id, title, slug, published, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Post not found' });
      throw error;
    }
    console.log(`✅ Post ${data.slug} → published: ${data.published}`);
    if (data.published) triggerDeploy(`post published: ${data.slug}`);
    res.json({ post: data });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/posts/:id — permanently delete a post (admin only)
app.delete('/api/admin/posts/:id', requireAdminPassword, async (req, res) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Dynamic Sitemap ---

// GET /api/sitemap — full XML sitemap: static pages + all published blog posts
app.get('/api/sitemap', async (req, res) => {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    const base = 'https://jesseaeisenbalm.com';
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: `${base}/`,               lastmod: today, changefreq: 'weekly',  priority: '1.0' },
      { loc: `${base}/about`,          lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: `${base}/blog`,           lastmod: today, changefreq: 'daily',   priority: '0.9' },
      { loc: `${base}/faq`,            lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: `${base}/privacy-policy`, lastmod: today, changefreq: 'yearly',  priority: '0.3' },
    ];

    const postPages = (posts || []).map(p => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: (p.updated_at || p.created_at).split('T')[0],
      changefreq: 'monthly',
      priority: '0.7',
    }));

    const allPages = [...staticPages, ...postPages];

    const urlTags = allPages.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlTags}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
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