import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import AppShell from '../components/layout/AppShell';

import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmployeeListPage from '../pages/employees/EmployeeListPage';
import EmployeeProfilePage from '../pages/employees/EmployeeProfilePage';
import MentorMapPage from '../pages/mentor-map/MentorMapPage';
import MboListPage from '../pages/mbo/MboListPage';
import MboFormPage from '../pages/mbo/MboFormPage';
import QuartersPage from '../pages/quarters/QuartersPage';
import MenteesListPage from '../pages/mentees/MenteesListPage';
import MenteeReviewPage from '../pages/mentees/MenteeReviewPage';
import ManageHRPage from '../pages/admin/ManageHRPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProfilePage from '../pages/auth/ProfilePage';

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
              { path: 'mbo/:id', element: <MboFormPage /> },
              { path: 'mbo/new', element: <MboFormPage /> },
              
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
