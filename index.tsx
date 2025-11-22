import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './src/index.css';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  console.error("Root container not found. The React app can't be mounted.");
}