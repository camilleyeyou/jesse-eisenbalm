function sendToGA4({ name, delta, id }) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      event_label: id,
      non_interaction: true,
    });
  }
}

const reportWebVitals = onPerfEntry => {
  const callback = onPerfEntry && onPerfEntry instanceof Function
    ? (metric) => { sendToGA4(metric); onPerfEntry(metric); }
    : sendToGA4;

  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(callback);
    onINP(callback);
    onFCP(callback);
    onLCP(callback);
    onTTFB(callback);
  });
};

export default reportWebVitals;
