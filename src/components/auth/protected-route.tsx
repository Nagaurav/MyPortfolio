<<<<<<< HEAD
import { Navigate } from 'react-router-dom';
=======
import { Navigate, useLocation } from 'react-router-dom';
>>>>>>> 183ebc5 (Initial commit)
import { useAuth } from '../../context/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized } = useAuth();
<<<<<<< HEAD
=======
  const location = useLocation();
>>>>>>> 183ebc5 (Initial commit)
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
<<<<<<< HEAD
    return <Navigate to="/admin/login" replace />;
=======
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
>>>>>>> 183ebc5 (Initial commit)
  }
  
  return <>{children}</>;
}