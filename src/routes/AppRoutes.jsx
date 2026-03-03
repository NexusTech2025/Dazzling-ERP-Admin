import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import AdminLayout from '../components/layout/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/admin/Dashboard';
import Students from '../pages/admin/Students';
import Students2 from '../pages/admin/Students2'; // Modular Table Test
import Teachers from '../pages/admin/Teachers';
import Teachers2 from '../pages/admin/Teachers2'; // Modular Table Test
import Roles from '../pages/admin/Roles';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';
import AddStudent from '../pages/admin/AddStudent';
import AddTeacher from '../pages/admin/AddTeacher';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />} 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students2" element={<Students2 />} /> {/* Temporary Test Route */}
        <Route path="students/add" element={<AddStudent />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers2" element={<Teachers2 />} /> {/* Temporary Test Route */}
        <Route path="teachers/add" element={<AddTeacher />} />
        <Route path="roles" element={<Roles />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
