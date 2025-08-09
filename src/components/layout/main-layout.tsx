import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MainHeader } from './main-header';
import { MainFooter } from './main-footer';

export function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Focus management for accessibility
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link focus:top-6"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Header */}
      <MainHeader />

      {/* Main content area */}
      <main 
        id="main-content" 
        className="flex-1"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <Outlet />
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
  );
}