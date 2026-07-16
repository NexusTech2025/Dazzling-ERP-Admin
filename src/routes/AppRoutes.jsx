import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextCore';
import HydrationGuard from '../components/guards/HydrationGuard';
import AdminLayout from '../components/layout/AdminLayout';
import LoginPage from '../pages/auth/LoginPage';
import Dashboard from '../pages/admin/Dashboard';
import Students from '../pages/admin/Students';
import StudentProfile from '../pages/admin/StudentProfile';
import Batches from '../features/batch/Batches';
import AddBatch from '../features/batch/AddBatch';
import EditBatch from '../features/batch/EditBatch';
import BatchProfile from '../pages/admin/BatchProfile';
import Schedule from '../features/batch/Schedule';
import Teachers from '../pages/admin/Teachers';
import TeacherProfile from '../pages/admin/TeacherProfile';
import TeacherAttendanceManager from '../features/teacher/components/TeacherAttendanceManager';
import Branches from '../pages/admin/Branches';
import Roles from '../pages/admin/Roles';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';
import AddStudent from '../pages/admin/AddStudent';
import AddTeacher from '../pages/admin/AddTeacher';
import StudentLeads from '../pages/admin/StudentLeads';
import StudentAttendanceManager from '../features/student/components/StudentAttendanceManager';
import UserRegistration from '../pages/admin/UserRegistration';
import Users from '../pages/admin/Users';
import TestFilters from '../pages/admin/TestFilters';
import TestButtons from '../pages/admin/TestButtons';
import TestProfileComponents from '../pages/admin/TestProfileComponents';
import TestPrototype from '../pages/admin/TestPrototype';
import TestCardsCatalog from '../pages/admin/TestCardsCatalog';
import ResolveDeleteConflictView from '../pages/admin/ResolveDeleteConflictView';
import TestMoneyTransactionsMobile from '../pages/admin/TestMoneyTransactionsMobile';
import TestDateShowcase from '../pages/admin/TestDateShowcase';

// Feature Pages
import Courses from '../features/course/Courses';
import CourseTypes from '../features/course/CourseTypes';
import CourseDetails from '../features/course/CourseDetails';
import PackageDetails from '../features/course/PackageDetails';
import CoursePackagesForm from '../features/course/CoursePackagesForm';
import InlineCoursePackagesForm from '../features/course/InlineCoursePackagesForm';
import AddCourse from '../features/course/AddCourse';
import FinanceDashboard from '../features/finance/FinanceDashboard';
import Installments from '../features/finance/Installments';
import FeePlanWizard from '../features/finance/FeePlanWizard';
import MoneyTransactions from '../features/finance/transactions/MoneyTransactions';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <HydrationGuard>
      {children}
    </HydrationGuard>
  ) : (
    <Navigate to="/login" replace />
  );
};

const SuperadminRoute = ({ children }) => {


  const { user, isAuthenticated } = useAuth();
  console.log("user: ", user)
  console.log("is Authenticated: ", isAuthenticated)

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role?.toLowerCase().trim() === 'superadmin' ? children : <Navigate to="/admin/dashboard" replace />;
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
        <Route path="students/attendance" element={<StudentAttendanceManager />} />
        <Route path="students/leads" element={<StudentLeads />} />
        <Route path="students/:id" element={<StudentProfile />} />

        {/* Batch Management */}
        <Route path="batches" element={<Batches />} />
        <Route path="batches/add" element={<AddBatch />} />
        <Route path="batches/edit/:id" element={<EditBatch />} />
        <Route path="batches/:id" element={<BatchProfile />} />
        <Route path="schedule" element={<Schedule />} />

        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/attendance" element={<TeacherAttendanceManager />} />
        <Route path="teachers/add" element={<AddTeacher />} />
        <Route path="teachers/edit/:id" element={<AddTeacher />} />
        <Route path="teachers/:id" element={<TeacherProfile />} />

        {/* Branch Management */}
        <Route path="branches" element={<Branches />} />

        {/* Course Management */}
        <Route path="courses" element={<Courses />} />
        <Route path="courses/types" element={<CourseTypes />} />
        <Route path="courses/add" element={<AddCourse />} />
        <Route path="courses/edit/:id" element={<AddCourse />} />
        <Route path="courses/:id" element={<CourseDetails />} />

        {/* Package specialized routes */}
        <Route path="packages" element={<Courses defaultTab="packages" />} />
        <Route path="packages/add" element={<CoursePackagesForm />} />
        <Route path="packages/quick-add" element={<InlineCoursePackagesForm />} />
        <Route path="packages/:id" element={<PackageDetails />} />
        <Route path="packages/edit/:id" element={<CoursePackagesForm />} />

        {/* Finance Management */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/installments" element={<Installments />} />
        <Route path="finance/fee-plan" element={<FeePlanWizard />} />
        <Route path="finance/transactions" element={<MoneyTransactions />} />

        {/* User Management Restricted to Superadmins Only */}
        <Route
          path="users"
          element={
            <SuperadminRoute>
              <Users />
            </SuperadminRoute>
          }
        />

        <Route
          path="users/add"
          element={
            <SuperadminRoute>
              <UserRegistration />
            </SuperadminRoute>
          }
        />

        <Route path="roles" element={<Roles />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="resolve-conflict" element={<ResolveDeleteConflictView />} />

        {/* Development Showcase Pages */}
        <Route path="test-pages">
          <Route path="filters" element={<TestFilters />} />
          <Route path="buttons" element={<TestButtons />} />
          <Route path="profile-core" element={<TestProfileComponents />} />
          <Route path="prototype" element={<TestPrototype />} />
          <Route path="cards" element={<TestCardsCatalog />} />
          <Route path="dates" element={<TestDateShowcase />} />
          <Route path="mobile-transactions" element={<TestMoneyTransactionsMobile />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
