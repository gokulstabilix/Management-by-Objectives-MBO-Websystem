import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const RoleRoute = ({ allowedRoles = [] }) => {
  const role = useSelector(selectUserRole);
  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      toast.error('Unauthorized access. You do not have permission to view this page.');
    }
  }, [isAllowed]);

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
