import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Lazy load admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/login').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/dashboard').then(module => ({ default: module.AdminDashboardPage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/projects').then(module => ({ default: module.AdminProjectsPage })));
const AdminSkillsPage = lazy(() => import('./pages/admin/skills').then(module => ({ default: module.AdminSkillsPage })));
const AdminExperiencePage = lazy(() => import('./pages/admin/experience').then(module => ({ default: module.AdminExperiencePage })));
const AdminCertificatesPage = lazy(() => import('./pages/admin/certificates').then(module => ({ default: module.AdminCertificatesPage })));
const AdminContactPage = lazy(() => import('./pages/admin/contact').then(module => ({ default: module.AdminContactPage })));
const AdminResumePage = lazy(() => import('./pages/admin/resumes').then(module => ({ default: module.AdminResumePage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/analytics').then(module => ({ default: module.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/settings').then(module => ({ default: module.AdminSettingsPage })));

// Loading fallback component
const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <div className="min-h-screen text-secondary-900 dark:text-white transition-colors duration-300">
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="resume" element={<ResumePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLoginPage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute>
                  <AdminProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="skills"
              element={
                <ProtectedRoute>
                  <AdminSkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="experience"
              element={
                <ProtectedRoute>
                  <AdminExperiencePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="certificates"
              element={
                <ProtectedRoute>
                  <AdminCertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="contact"
              element={
                <ProtectedRoute>
                  <AdminContactPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="resumes"
              element={
                <ProtectedRoute>
                  <AdminResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
