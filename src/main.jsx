import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CarrinhoProvider } from './controllers/CarrinhoContext.jsx';
import { ToastProvider } from './controllers/ToastContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CarrinhoProvider>
          <App />
        </CarrinhoProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
