// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // If there is one

// Add error handling
const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
} catch (error) {
  console.error('Error rendering app:', error);
}