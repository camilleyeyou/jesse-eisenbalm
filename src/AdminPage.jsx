import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://jesse-eisenbalm-server.vercel.app';

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Jesse A. Eisenbalm',
    cover_image: '',
    tags: '',
    published: false,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/auth`, {
        method: 'POST',
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError('Incorrect password.');
      }
    } catch {
      setAuthError('Could not reach server. Try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleTitleChange(e) {
    const title = e.target.value;
    setForm(f => ({
      ...f,
      title,
      slug: slugManuallyEdited ? f.slug : generateSlug(title),
    }));
  }

  function handleSlugChange(e) {
    setSlugManuallyEdited(true);
    setForm(f => ({ ...f, slug: e.target.value }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!form.title.trim()) { setError('Title is required.'); return; }

    const tags = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    setSubmitting(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          excerpt: form.excerpt.trim() || undefined,
          content: form.content,
          author: form.author.trim() || 'Jesse A. Eisenbalm',
          cover_image: form.cover_image.trim() || undefined,
          tags,
          published: form.published,
        }),
      });

      if (res.status === 401) {
        setAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      setSuccess(data.post);
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Jesse A. Eisenbalm',
        cover_image: '',
        tags: '',
        published: false,
      });
      setSlugManuallyEdited(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Admin | Jesse A. Eisenbalm</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .admin-input {
          width: 100%; border: 1px solid #e5e5e5; padding: 10px 14px;
          font-size: 0.9rem; outline: none; transition: border-color 0.2s;
          font-family: inherit; background: white;
        }
        .admin-input:focus { border-color: #000; }
        .admin-textarea {
          width: 100%; border: 1px solid #e5e5e5; padding: 10px 14px;
          font-size: 0.9rem; outline: none; transition: border-color 0.2s;
          font-family: monospace; background: white; resize: vertical; min-height: 320px;
        }
        .admin-textarea:focus { border-color: #000; }
        .admin-label {
          display: block; font-size: 0.7rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: #6b7280; margin-bottom: 6px;
        }
        .admin-btn {
          background: #000; color: #fff; border: none; cursor: pointer;
          padding: 12px 32px; font-size: 0.75rem; letter-spacing: 0.15em;
          text-transform: uppercase; transition: opacity 0.2s;
        }
        .admin-btn:hover:not(:disabled) { opacity: 0.75; }
        .admin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Top bar */}
      <div className="border-b border-gray-100 px-6 py-5 flex justify-between items-center">
        <Link to="/" className="text-lg font-light tracking-[0.2em]">JESSE A. EISENBALM</Link>
        <Link to="/" className="inline-flex items-center text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={14} className="mr-1.5" />
          BACK TO SITE
        </Link>
      </div>

      {/* Password gate */}
      {!authenticated ? (
        <div className="max-w-sm mx-auto px-6 py-32">
          <p className="text-xs tracking-[0.3em] text-gray-400 mb-2 text-center">ADMIN</p>
          <h1 className="text-2xl font-light text-center mb-10 tracking-tight">Journal Admin</h1>
          <form onSubmit={handlePasswordSubmit}>
            <label className="admin-label">Password</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-input pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {authError && <p className="text-red-600 text-xs mb-4">{authError}</p>}
            <button type="submit" className="admin-btn w-full" disabled={authLoading}>
              {authLoading ? 'VERIFYING...' : 'ENTER'}
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs tracking-[0.3em] text-gray-400 mb-2">ADMIN</p>
          <h1 className="text-3xl font-light mb-12 tracking-tight">New Post</h1>

          {/* Success banner */}
          {success && (
            <div className="border border-gray-200 bg-gray-50 p-5 mb-10">
              <p className="text-sm font-medium mb-1">Post created successfully.</p>
              <p className="text-xs text-gray-500 mb-3">Slug: <code className="font-mono">{success.slug}</code> &mdash; Published: {success.published ? 'Yes' : 'No (draft)'}</p>
              <Link
                to={`/blog/${success.slug}`}
                className="text-xs tracking-[0.12em] underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                VIEW POST →
              </Link>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="border border-red-200 bg-red-50 p-4 mb-8">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="admin-label">Title *</label>
              <input
                type="text"
                className="admin-input"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Post title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="admin-label">Slug</label>
              <input
                type="text"
                className="admin-input font-mono"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="auto-generated-from-title"
              />
              <p className="text-xs text-gray-400 mt-1.5">Leave blank or edit. Auto-generated from title.</p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="admin-label">Excerpt</label>
              <input
                type="text"
                className="admin-input"
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Short summary shown in post listings"
              />
            </div>

            {/* Content */}
            <div>
              <label className="admin-label">Content (HTML)</label>
              <textarea
                className="admin-textarea"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="<p>Write your post content here...</p>"
              />
              <p className="text-xs text-gray-400 mt-1.5">HTML is supported. Use &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;blockquote&gt;, etc.</p>
            </div>

            {/* Author + Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="admin-label">Author</label>
                <input
                  type="text"
                  className="admin-input"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="admin-label">Cover Image URL</label>
                <input
                  type="url"
                  className="admin-input"
                  name="cover_image"
                  value={form.cover_image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="admin-label">Tags</label>
              <input
                type="text"
                className="admin-input"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="skincare, ritual, wellness"
              />
              <p className="text-xs text-gray-400 mt-1.5">Comma-separated list of tags.</p>
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={form.published}
                onChange={handleChange}
                className="w-4 h-4 accent-black"
              />
              <label htmlFor="published" className="text-sm text-gray-700 cursor-pointer select-none">
                Publish immediately
              </label>
              {!form.published && <span className="text-xs text-gray-400">(saves as draft)</span>}
            </div>

            <div className="pt-2">
              <button type="submit" className="admin-btn" disabled={submitting}>
                {submitting ? 'PUBLISHING...' : 'CREATE POST'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
