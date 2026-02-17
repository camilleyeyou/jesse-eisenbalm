import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from 'react-helmet-async';

const container = document.getElementById('root');

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  const root = ReactDOM.createRoot(container);
  root.render(app);
}

reportWebVitals();
