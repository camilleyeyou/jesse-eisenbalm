import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Eye, EyeOff, Upload, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

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

function analyzeSEO(form, focusKeyphrase) {
  const kw = focusKeyphrase.toLowerCase().trim();
  const kwRe = kw ? new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;

  const contentText = form.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = contentText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const firstParaMatch = form.content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const firstPara = firstParaMatch ? firstParaMatch[1].replace(/<[^>]+>/g, '').toLowerCase() : '';

  const kwCount = kwRe ? (contentText.match(kwRe) || []).length : 0;
  const density = wordCount > 0 && kwCount > 0 ? (kwCount / wordCount) * 100 : 0;

  const allHrefs = form.content.match(/href=["']([^"']+)["']/gi) || [];
  const internalLinks = allHrefs.filter(h => /jesseaeisenbalm\.com|href=["']\/(?!")/i.test(h)).length;
  const externalLinks = allHrefs.filter(h => /href=["']https?:\/\//i.test(h) && !/jesseaeisenbalm\.com/i.test(h)).length;

  const images = form.content.match(/<img[^>]+>/gi) || [];
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length;

  const h2Count = (form.content.match(/<h2[^>]*>/gi) || []).length;
  const h2WithKw = kwRe ? (form.content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).filter(h => kwRe.test(h.replace(/<[^>]+>/g, ''))).length : 0;

  return {
    keyphraseSet: !!kw,
    keyphraseInTitle: !!kw && form.title.toLowerCase().includes(kw),
    keyphraseInSlug: !!kw && form.slug.toLowerCase().includes(kw.replace(/\s+/g, '-')),
    keyphraseInExcerpt: !!kw && form.excerpt.toLowerCase().includes(kw),
    keyphraseInIntro: !!kw && firstPara.includes(kw),
    keyphraseInH2: !!kw && h2WithKw > 0,
    densityOk: density >= 0.5 && density <= 3,
    densityOver: density > 3,
    density: density.toFixed(1),
    kwCount,
    wordCount,
    wordCountOk: wordCount >= 300,
    wordCountGood: wordCount >= 900,
    hasH2: h2Count >= 1,
    hasInternalLink: internalLinks >= 1,
    hasExternalLink: externalLinks >= 1,
    internalLinks,
    externalLinks,
    allImagesHaveAlt: images.length === 0 || imagesWithAlt === images.length,
    imageCount: images.length,
    titleLengthOk: form.title.length >= 50 && form.title.length <= 60,
    excerptLengthOk: form.excerpt.length >= 150 && form.excerpt.length <= 160,
  };
}

function SeoCheck({ status, label, hint }) {
  const icons = {
    good:    <CheckCircle size={14} className="text-green-500 shrink-0" />,
    warning: <AlertCircle size={14} className="text-amber-500 shrink-0" />,
    bad:     <XCircle    size={14} className="text-red-400 shrink-0" />,
    neutral: <AlertCircle size={14} className="text-gray-300 shrink-0" />,
  };
  const colors = { good: 'text-gray-700', warning: 'text-gray-700', bad: 'text-gray-700', neutral: 'text-gray-400' };
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
      {icons[status]}
      <div>
        <span className={`text-xs ${colors[status]}`}>{label}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab: 'new' | 'manage'
  const [activeTab, setActiveTab] = useState('new');

  // Manage Posts state
  const [allPosts, setAllPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const [focusKeyphrase, setFocusKeyphrase] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
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

  async function fetchAllPosts() {
    setPostsLoading(true);
    setPostsError('');
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/posts`, {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) { setAuthenticated(false); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
      setAllPosts(data.posts);
    } catch (err) {
      setPostsError(err.message);
    } finally {
      setPostsLoading(false);
    }
  }

  async function togglePublished(post) {
    setTogglingId(post.id);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.status === 401) { setAuthenticated(false); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: data.post.published } : p));
    } catch (err) {
      setPostsError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) { setAuthenticated(false); return; }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setAllPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (err) {
      setPostsError(err.message);
    } finally {
      setDeletingId(null);
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

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, cover_image: '' }));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview('');
    setForm(f => ({ ...f, cover_image: '' }));
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
      // Upload image first if one was selected
      let cover_image = form.cover_image || undefined;
      if (imageFile) {
        setImageUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch(`${SERVER_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'x-admin-password': password },
          body: formData,
        });
        setImageUploading(false);
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error || 'Image upload failed');
        }
        const uploadData = await uploadRes.json();
        cover_image = uploadData.url;
      }

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
          cover_image: cover_image || undefined,
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
      setFocusKeyphrase('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setImageUploading(false);
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

          {/* Tab nav */}
          <div className="flex gap-0 mb-12 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('new')}
              className={`text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 transition-colors ${activeTab === 'new' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
            >
              New Post
            </button>
            <button
              onClick={() => { setActiveTab('manage'); fetchAllPosts(); }}
              className={`text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 transition-colors ${activeTab === 'manage' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
            >
              Manage Posts
            </button>
          </div>

          {/* ── MANAGE POSTS TAB ── */}
          {activeTab === 'manage' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-light tracking-tight">All Posts</h1>
                <button
                  onClick={fetchAllPosts}
                  className="text-xs tracking-[0.12em] text-gray-400 hover:text-black transition-colors uppercase"
                >
                  Refresh
                </button>
              </div>

              {postsError && (
                <div className="border border-red-200 bg-red-50 p-4 mb-6">
                  <p className="text-sm text-red-700">{postsError}</p>
                </div>
              )}

              {postsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="border border-gray-100 p-5 animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : allPosts.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-12 text-center">
                  <p className="text-sm text-gray-400">No posts yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPosts.map(post => (
                    <div key={post.id} className="border border-gray-200 p-5 flex items-start gap-4">
                      {/* Status dot */}
                      <div className="mt-1 shrink-0">
                        <span className={`inline-block w-2 h-2 rounded-full ${post.published ? 'bg-green-500' : 'bg-gray-300'}`} title={post.published ? 'Published' : 'Draft'} />
                      </div>

                      {/* Post info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 ${post.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {post.tags?.length > 0 && (
                            <span className="text-xs text-gray-400 truncate">{post.tags.join(', ')}</span>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {post.published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-2"
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => togglePublished(post)}
                          disabled={togglingId === post.id}
                          className={`text-xs tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors ${post.published ? 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600' : 'border-black text-black hover:bg-black hover:text-white'} disabled:opacity-40`}
                        >
                          {togglingId === post.id ? '...' : post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => deletePost(post)}
                          disabled={deletingId === post.id}
                          className="text-xs text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40 px-1"
                          title="Delete post"
                        >
                          {deletingId === post.id ? '...' : '✕'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-6">
                {allPosts.length} post{allPosts.length !== 1 ? 's' : ''} total &mdash; {allPosts.filter(p => p.published).length} published, {allPosts.filter(p => !p.published).length} draft{allPosts.filter(p => !p.published).length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* ── NEW POST TAB ── */}
          {activeTab === 'new' && (<>
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
            {/* Focus Keyphrase */}
            <div className="border border-gray-200 p-4 bg-gray-50">
              <label className="admin-label">Focus Keyphrase</label>
              <input
                type="text"
                className="admin-input bg-white"
                value={focusKeyphrase}
                onChange={e => setFocusKeyphrase(e.target.value)}
                placeholder="e.g. beeswax lip balm benefits"
              />
              <p className="text-xs text-gray-400 mt-1.5">The primary keyword this post targets. Used to score SEO quality below.</p>
            </div>

            {/* Title */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="admin-label" style={{margin:0}}>Title *</label>
                <span className={`text-xs tabular-nums ${form.title.length > 60 ? 'text-amber-500' : form.title.length > 0 ? 'text-gray-400' : 'text-gray-300'}`}>
                  {form.title.length}/60
                </span>
              </div>
              <input
                type="text"
                className="admin-input"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Post title (aim for 50–60 characters)"
              />
              <p className="text-xs text-gray-400 mt-1.5">SEO title target: 50–60 characters. Appears in Google search results.</p>
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
              <p className="text-xs text-gray-400 mt-1.5">Auto-generated from title. Edit if needed — this becomes the URL: /blog/<span className="font-mono">{form.slug || 'your-slug'}</span></p>
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="admin-label" style={{margin:0}}>Excerpt * <span className="text-red-400">(SEO meta description)</span></label>
                <span className={`text-xs tabular-nums ${form.excerpt.length > 160 ? 'text-red-500' : form.excerpt.length >= 150 ? 'text-green-600' : form.excerpt.length > 0 ? 'text-amber-500' : 'text-gray-300'}`}>
                  {form.excerpt.length}/160
                </span>
              </div>
              <input
                type="text"
                className="admin-input"
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Compelling 150–160 character summary for Google search results"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                This is your Google meta description. {form.excerpt.length < 150 && form.excerpt.length > 0 && <span className="text-amber-500">Too short — aim for 150–160 chars. </span>}{form.excerpt.length > 160 && <span className="text-red-500">Too long — Google will truncate. </span>}{form.excerpt.length >= 150 && form.excerpt.length <= 160 && <span className="text-green-600">Perfect length. </span>}Also shown in post listing cards.
              </p>
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
              <p className="text-xs text-gray-400 mt-1.5">
                HTML is supported. Use &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;blockquote&gt;, &lt;a href="..."&gt;, &lt;img alt="..."&gt;.
              </p>
            </div>

            {/* SEO Analysis Panel */}
            {(() => {
              const s = analyzeSEO(form, focusKeyphrase);
              const checks = [
                s.keyphraseInTitle, s.keyphraseInSlug, s.keyphraseInExcerpt,
                s.keyphraseInIntro, s.keyphraseInH2, s.densityOk,
                s.wordCountOk, s.hasH2, s.hasInternalLink, s.hasExternalLink,
                s.allImagesHaveAlt, s.titleLengthOk, s.excerptLengthOk,
              ];
              const passed = checks.filter(Boolean).length;
              const total = checks.length;
              const pct = Math.round((passed / total) * 100);
              const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
              return (
                <div className="border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs tracking-[0.12em] uppercase text-gray-500">SEO Analysis</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-medium tabular-nums ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {passed}/{total}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-2">
                    {/* Keyphrase */}
                    <p className="text-xs tracking-widest text-gray-400 uppercase mt-2 mb-1">Keyphrase</p>
                    <SeoCheck
                      status={!s.keyphraseSet ? 'neutral' : s.keyphraseInTitle ? 'good' : 'bad'}
                      label="Keyphrase in title"
                      hint={!s.keyphraseSet ? 'Set a focus keyphrase above' : !s.keyphraseInTitle ? `Add "${focusKeyphrase}" to the title` : null}
                    />
                    <SeoCheck
                      status={!s.keyphraseSet ? 'neutral' : s.keyphraseInSlug ? 'good' : 'warning'}
                      label="Keyphrase in URL slug"
                      hint={!s.keyphraseInSlug && s.keyphraseSet ? 'The slug should include your keyphrase' : null}
                    />
                    <SeoCheck
                      status={!s.keyphraseSet ? 'neutral' : s.keyphraseInExcerpt ? 'good' : 'bad'}
                      label="Keyphrase in meta description (excerpt)"
                      hint={!s.keyphraseInExcerpt && s.keyphraseSet ? 'Include the keyphrase in the excerpt' : null}
                    />
                    <SeoCheck
                      status={!s.keyphraseSet ? 'neutral' : s.keyphraseInIntro ? 'good' : 'warning'}
                      label="Keyphrase in first paragraph"
                      hint={!s.keyphraseInIntro && s.keyphraseSet ? 'Mention the keyphrase in the opening paragraph' : null}
                    />
                    <SeoCheck
                      status={!s.keyphraseSet ? 'neutral' : s.keyphraseInH2 ? 'good' : 'warning'}
                      label="Keyphrase in a subheading (H2/H3)"
                      hint={!s.keyphraseInH2 && s.keyphraseSet ? 'Use the keyphrase in at least one <h2> or <h3>' : null}
                    />
                    <SeoCheck
                      status={!s.keyphraseSet || s.kwCount === 0 ? 'neutral' : s.densityOver ? 'bad' : s.densityOk ? 'good' : 'warning'}
                      label={`Keyphrase density: ${s.density}% (${s.kwCount} uses in ${s.wordCount} words)`}
                      hint={s.densityOver ? 'Over 3% — reduce keyword stuffing' : !s.densityOk && s.keyphraseSet && s.wordCount > 100 ? 'Aim for 0.5–3% density' : null}
                    />

                    {/* Content */}
                    <p className="text-xs tracking-widest text-gray-400 uppercase mt-3 mb-1">Content</p>
                    <SeoCheck
                      status={s.wordCountGood ? 'good' : s.wordCountOk ? 'warning' : 'bad'}
                      label={`Word count: ${s.wordCount} words`}
                      hint={!s.wordCountGood ? (s.wordCountOk ? 'Good — aim for 900+ for best rankings' : 'Minimum 300 words required') : null}
                    />
                    <SeoCheck
                      status={s.hasH2 ? 'good' : 'bad'}
                      label="Uses H2 subheadings"
                      hint={!s.hasH2 ? 'Add <h2>Section Title</h2> to break up content' : null}
                    />
                    <SeoCheck
                      status={s.titleLengthOk ? 'good' : form.title.length === 0 ? 'neutral' : 'warning'}
                      label={`Title length: ${form.title.length} chars (target 50–60)`}
                    />
                    <SeoCheck
                      status={s.excerptLengthOk ? 'good' : form.excerpt.length === 0 ? 'neutral' : form.excerpt.length > 160 ? 'bad' : 'warning'}
                      label={`Meta description: ${form.excerpt.length} chars (target 150–160)`}
                    />

                    {/* Links */}
                    <p className="text-xs tracking-widest text-gray-400 uppercase mt-3 mb-1">Links</p>
                    <SeoCheck
                      status={s.hasInternalLink ? 'good' : 'bad'}
                      label={`Internal links: ${s.internalLinks}`}
                      hint={!s.hasInternalLink ? 'Add at least 1 link to jesseaeisenbalm.com — e.g. <a href="/">shop the balm</a>' : null}
                    />
                    <SeoCheck
                      status={s.hasExternalLink ? 'good' : 'warning'}
                      label={`External links: ${s.externalLinks}`}
                      hint={!s.hasExternalLink ? 'Link to at least 1 credible external source (study, article, etc.)' : null}
                    />

                    {/* Images */}
                    <p className="text-xs tracking-widest text-gray-400 uppercase mt-3 mb-1">Images</p>
                    <SeoCheck
                      status={s.imageCount === 0 ? 'neutral' : s.allImagesHaveAlt ? 'good' : 'bad'}
                      label={s.imageCount === 0 ? 'No inline images (cover image above is fine)' : `${s.imageCount} image(s) — ${s.allImagesHaveAlt ? 'all have alt text' : 'some missing alt text'}`}
                      hint={s.imageCount > 0 && !s.allImagesHaveAlt ? 'Add alt="" to every <img> tag for accessibility + SEO' : null}
                    />
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400">
                      <strong className="text-gray-600">Yoast SEO standard:</strong> Green on all keyphrase + links checks before publishing.
                      Internal links keep readers on-site; external links signal credibility to Google.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Author */}
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

            {/* Cover Image Upload */}
            <div>
              <label className="admin-label">Cover Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white border border-gray-200 p-1 hover:bg-gray-50 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-300 cursor-pointer hover:border-gray-500 transition-colors bg-gray-50 hover:bg-white">
                  <Upload size={20} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP — max 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {imageUploading && <p className="text-xs text-gray-500 mt-1.5">Uploading image...</p>}
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
              <button type="submit" className="admin-btn" disabled={submitting || imageUploading}>
                {imageUploading ? 'UPLOADING IMAGE...' : submitting ? 'CREATING POST...' : 'CREATE POST'}
              </button>
            </div>
          </form>
          </>)}
        </div>
      )}
    </div>
  );
}
