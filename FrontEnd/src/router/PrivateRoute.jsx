import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const PrivateRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes (e.g. AppShell)
  return <Outlet />;
};

export default PrivateRoute;
