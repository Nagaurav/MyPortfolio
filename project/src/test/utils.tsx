import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/auth-context';
import { ThemeProvider } from '../context/theme-context';
import { ToastProvider } from '../context/toast-context';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {ui}
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}