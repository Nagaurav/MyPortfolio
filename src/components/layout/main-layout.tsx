import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { MainHeader } from './main-header';
import { MainFooter } from './main-footer';
import { PageFallback } from '../ui/page-fallback';

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
      {/* flex-1 alone let short pages (empty Skills, 404) end well above the
          fold, leaving a large gap before the footer. A min-height keeps the
          footer at or below the viewport edge instead. */}
      <main
        id="main-content"
        // Focus moves here on every route change so assistive tech announces the
        // new page. The global :focus-visible ring then drew a brand-cyan ring
        // around the whole region -- its top edge read as a stray rule under the
        // header. Focus still moves; only the ring on this container is dropped.
        className="flex-1 min-h-[70vh] outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
  );
}