import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';
import AdminDashboard from './AdminDashboard';
import HrDashboard from './HrDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const DashboardPage = () => {
  const role = useSelector(selectUserRole);

  // Render the appropriate dashboard based on role
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HrDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      // Fallback or loading state if role isn't immediately available
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
  }
};

export default DashboardPage;
