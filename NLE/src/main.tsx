import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import { ThemeProvider } from './context/ThemeContext';

import './index.css';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';

import { initGA } from "./lib/analytics";

initGA();

// Reveal animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  },
  { threshold: 0.1 }
);

const observeReveal = () => {
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
};

observeReveal();

// Only scan nodes that were actually added, instead of re-querying the whole
// document on every single DOM mutation (toasts, cart updates, etc.) -- that
// full-document rescan on every mutation was a real source of scroll/interaction
// lag on content-heavy pages.
const mo = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.reveal')) observer.observe(node);
      node.querySelectorAll?.('.reveal').forEach((el) => observer.observe(el));
    });
  }
});
mo.observe(document.body, {
  childList: true,
  subtree: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AIProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);