import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.tsx';
import { AuthProvider } from './context/auth-context.tsx';
import { ThemeProvider } from './context/theme-context.tsx';
import { ToastProvider } from './context/toast-context.tsx';
import { ErrorBoundary } from './components/performance/error-boundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <App />
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);