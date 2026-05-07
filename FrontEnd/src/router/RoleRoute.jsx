import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const RoleRoute = ({ allowedRoles = [] }) => {
  const role = useSelector(selectUserRole);

  if (!allowedRoles.includes(role)) {
    toast.error('Unauthorized access. You do not have permission to view this page.');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
