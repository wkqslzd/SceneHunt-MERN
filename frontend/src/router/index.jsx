import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import PublicLayout from '../components/Layout/PublicLayout'; // 👈 homepage Layout
import Home from '../pages/Home'; // 👈 your homepage component
import Login from '../pages/Login';

import UserManagement from '../pages/admin/UserManagement';
import Settings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/AdminProfile';
import Admin2 from '../pages/admin/Admin2';
import SuperAdmin from '../pages/admin/SuperAdmin';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  return allowedRoles.includes(userRole) ? children : <Navigate to="/admin/profile" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />, // ⬅️ default load public layout
    children: [
      {
        path: '',
        element: <Home />, // ⬅️ homepage component
      },
    ],
  },
  {
    path: '/login',
    element: <Login />, // ⬅️ independent login page
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { path: '', element: <AdminProfile /> },
      { path: 'profile', element: <AdminProfile /> },
      { path: 'admin2', element: <Admin2 /> },
      { path: 'superadmin', element: <SuperAdmin /> },
      { path: 'settings', element: <Settings /> },
      { path: 'users', element: <UserManagement /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);

export default router;
