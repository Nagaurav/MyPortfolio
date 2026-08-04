import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from './components/layout/main-layout';
import { AdminLayout } from './components/layout/admin-layout';
import { ProtectedRoute } from './components/auth/protected-route';
import { LoadingSpinner } from './components/ui/loading-spinner';

// Import HomePage directly (critical for first load)
import { HomePage } from './pages/public/home';

// Lazy load public pages
const ProjectsPage = lazy(() => import('./pages/public/projects').then(module => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/public/project-detail').then(module => ({ default: module.ProjectDetailPage })));
const SkillsPage = lazy(() => import('./pages/public/skills').then(module => ({ default: module.SkillsPage })));
const ExperiencePage = lazy(() => import('./pages/public/experience').then(module => ({ default: module.ExperiencePage })));
const CertificatesPage = lazy(() => import('./pages/public/certificates').then(module => ({ default: module.CertificatesPage })));
const ContactPage = lazy(() => import('./pages/public/contact').then(module => ({ default: module.ContactPage })));
const ResumePage = lazy(() => import('./pages/public/resume').then(module => ({ default: module.ResumePage })));
const NotFoundPage = lazy(() => import('./pages/public/not-found').then(module => ({ default: module.NotFoundPage })));

// Lazy load admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/login').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/dashboard').then(module => ({ default: module.AdminDashboardPage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/projects').then(module => ({ default: module.AdminProjectsPage })));
const AdminSkillsPage = lazy(() => import('./pages/admin/skills').then(module => ({ default: module.AdminSkillsPage })));
const AdminExperiencePage = lazy(() => import('./pages/admin/experience').then(module => ({ default: module.AdminExperiencePage })));
const AdminCertificatesPage = lazy(() => import('./pages/admin/certificates').then(module => ({ default: module.AdminCertificatesPage })));
const AdminContactPage = lazy(() => import('./pages/admin/contact').then(module => ({ default: module.AdminContactPage })));
const AdminResumePage = lazy(() => import('./pages/admin/resume').then(module => ({ default: module.AdminResumePage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/analytics').then(module => ({ default: module.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/settings').then(module => ({ default: module.AdminSettingsPage })));

// Full-screen fallback, used only for routes that render outside a layout
// (layout routes suspend inside their own content area instead).
const FullPageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <div className="min-h-screen text-secondary-900 dark:text-white transition-colors duration-300">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
          <Route path="projects/:id" element={<PageTransition><ProjectDetailPage /></PageTransition>} />
          <Route path="skills" element={<PageTransition><SkillsPage /></PageTransition>} />
          <Route path="experience" element={<PageTransition><ExperiencePage /></PageTransition>} />
          <Route path="certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
          <Route path="contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="resume" element={<PageTransition><ResumePage /></PageTransition>} />

          {/* The admin sign-in lives at /admin/login; keep the bare /login guess working. */}
          <Route path="login" element={<Navigate to="/admin/login" replace />} />

          {/* Catch-all: renders inside MainLayout so a wrong URL still shows the site chrome. */}
          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Route>

        {/* Admin Login Route (outside AdminLayout, so it needs its own boundary) */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<FullPageFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
        
        {/* Admin Routes (inside AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <PageTransition><AdminDashboardPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <PageTransition><AdminDashboardPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ProtectedRoute>
                <PageTransition><AdminProjectsPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="skills"
            element={
              <ProtectedRoute>
                <PageTransition><AdminSkillsPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="experience"
            element={
              <ProtectedRoute>
                <PageTransition><AdminExperiencePage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="certificates"
            element={
              <ProtectedRoute>
                <PageTransition><AdminCertificatesPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="contact"
            element={
              <ProtectedRoute>
                <PageTransition><AdminContactPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="resume"
            element={
              <ProtectedRoute>
                <PageTransition><AdminResumePage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute>
                <PageTransition><AdminAnalyticsPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <PageTransition><AdminSettingsPage /></PageTransition>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
