import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import AdminLayout from '../components/layout/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/admin/Dashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Roles from '../pages/admin/Roles';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';
import AddStudent from '../pages/admin/AddStudent';
import AddTeacher from '../pages/admin/AddTeacher';

// Feature Pages
import Courses from '../features/course/Courses';
import CourseDetails from '../features/course/CourseDetails';
import AddCourse from '../features/course/AddCourse';
import FinanceDashboard from '../features/finance/FinanceDashboard';
import Installments from '../features/finance/Installments';
import DelinquentAccounts from '../features/finance/DelinquentAccounts';
import FeePlanWizard from '../features/finance/FeePlanWizard';
import StudentFeeOverview from '../features/finance/StudentFeeOverview';

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
        <Route path="students/add" element={<AddStudent />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/add" element={<AddTeacher />} />

        {/* Course Management */}
        <Route path="courses" element={<Courses />} />
        <Route path="courses/add" element={<AddCourse />} />
        <Route path="courses/:id" element={<CourseDetails />} />

        {/* Finance Management */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/installments" element={<Installments />} />
        <Route path="finance/delinquent" element={<DelinquentAccounts />} />
        <Route path="finance/fee-plan" element={<FeePlanWizard />} />
        <Route path="finance/student/:id" element={<StudentFeeOverview />} />

        <Route path="roles" element={<Roles />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
