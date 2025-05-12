import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout } from './components/layout/admin-layout';
import { MainLayout } from './components/layout/main-layout';
import { useAuth } from './context/auth-context';
import { AdminDashboardPage } from './pages/admin/dashboard';
import { AdminProjectsPage } from './pages/admin/projects';
import { AdminSkillsPage } from './pages/admin/skills';
import { AdminCertificatesPage } from './pages/admin/certificates';
import { AdminResumePage } from './pages/admin/resumes';
import { AdminContactPage } from './pages/admin/contact';
import { AdminSettingsPage } from './pages/admin/settings';
import { AdminAnalyticsPage } from './pages/admin/analytics';
import { AdminLoginPage } from './pages/admin/login';
import { HomePage } from './pages/public/home';
import { ProjectsPage } from './pages/public/projects';
import { ProjectDetailPage } from './pages/public/project-detail';
import { SkillsPage } from './pages/public/skills';
import { CertificatesPage } from './pages/public/certificates';
import { ResumePage } from './pages/public/resume';
import { ProtectedRoute } from './components/auth/protected-route';

function App() {
  const location = useLocation();
  const { isInitialized } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="resume" element={<ResumePage />} />
      </Route>
      
      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="skills" element={<AdminSkillsPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="resume" element={<AdminResumePage />} />
        <Route path="contact" element={<AdminContactPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;