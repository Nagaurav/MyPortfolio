import { LoadingSpinner } from './loading-spinner';

/**
 * Suspense fallback for lazily-loaded route content.
 *
 * Rendered inside a layout's content area (never above <Routes>), so the header,
 * sidebar and footer stay mounted while the next page chunk downloads.
 */
export function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
      <LoadingSpinner size="lg" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
