import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EisenbalmShop from './EisenbalmShop';
import AboutPage from './AboutPage';
import PrivacyPolicy from './PrivacyPolicy';
import FaqPage from './FaqPage';
import BlogPage from './BlogPage';
import BlogPost from './BlogPost';
import AdminPage from './AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EisenbalmShop />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
