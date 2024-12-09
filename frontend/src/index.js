import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css';  // **Add this line to import your global styles.css**
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

