import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const EisenbalmShop = lazy(() => import('./EisenbalmShop'));

const AboutPage = lazy(() => import('./AboutPage'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const FaqPage = lazy(() => import('./FaqPage'));
const BlogPage = lazy(() => import('./BlogPage'));
const BlogPost = lazy(() => import('./BlogPost'));
const AdminPage = lazy(() => import('./AdminPage'));

function NotFound() {
  return (
    <div style={{ padding: '80px 40px', maxWidth: 600, margin: '0 auto', fontFamily: '-apple-system, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '6em', fontWeight: 300, margin: 0, letterSpacing: '-0.02em' }}>404</h1>
      <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '2em' }}>This page doesn't exist.</p>
      <a href="/" style={{ display: 'inline-block', padding: '12px 32px', background: '#000', color: '#fff', textDecoration: 'none', fontSize: '0.85em', letterSpacing: '0.15em' }}>
        BACK HOME
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          <Route path="/" element={<EisenbalmShop />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
