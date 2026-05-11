import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import AppShell from '../components/layout/AppShell';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('../pages/employees/EmployeeListPage'));
const EmployeeProfilePage = lazy(() => import('../pages/employees/EmployeeProfilePage'));
const MentorMapPage = lazy(() => import('../pages/mentor-map/MentorMapPage'));
const MboListPage = lazy(() => import('../pages/mbo/MboListPage'));
const MboFormPage = lazy(() => import('../pages/mbo/MboFormPage'));
const QuartersPage = lazy(() => import('../pages/quarters/QuartersPage'));
const MenteesListPage = lazy(() => import('../pages/mentees/MenteesListPage'));
const MenteeReviewPage = lazy(() => import('../pages/mentees/MenteeReviewPage'));
const ManageHRPage = lazy(() => import('../pages/admin/ManageHRPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const ProfilePage = lazy(() => import('../pages/auth/ProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PrivateRoute />, // Protects everything underneath
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'settings/profile', element: <ProfilePage /> },
          
          // Employees (All roles)
          { path: 'employees', element: <EmployeeListPage /> },
          { path: 'employees/:id', element: <EmployeeProfilePage /> },

          // Quarters (Admin, HR)
          {
            element: <RoleRoute allowedRoles={['admin', 'hr']} />,
            children: [
              { path: 'quarters', element: <QuartersPage /> },
            ],
          },

          // Mentor Mapping (HR only)
          {
            element: <RoleRoute allowedRoles={['hr']} />,
            children: [
              { path: 'mentor-map', element: <MentorMapPage /> },
            ],
          },

          // Manage HR Users (Admin only)
          {
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              { path: 'admin/users', element: <ManageHRPage /> },
            ],
          },

          // MBO Employee views
          {
            element: <RoleRoute allowedRoles={['employee']} />,
            children: [
              { path: 'mbo', element: <MboListPage /> },
              { path: 'mbo/new', element: <MboFormPage /> },
              { path: 'mbo/:id', element: <MboFormPage /> },
              
              // Mentee views (Employee acting as mentor)
              { path: 'mentees', element: <MenteesListPage /> },
              { path: 'mentees/:formId', element: <MenteeReviewPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
