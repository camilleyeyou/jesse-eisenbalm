import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EisenbalmShop from './EisenbalmShop';
import AboutPage from './AboutPage';
import PrivacyPolicy from './PrivacyPolicy';
import FaqPage from './FaqPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EisenbalmShop />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FaqPage />} />
      </Routes>
    </Router>
  );
}

export default App;