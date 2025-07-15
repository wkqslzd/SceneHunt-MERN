// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ConnectionsPage from './pages/ConnectionsPage';
import BookDetailsPage from './pages/work/BookDetailsPage';
import ScreenDetailsPage from './pages/work/ScreenDetailsPage';
import ConnectionForm from './components/ConnectionForm';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ConnectionSubmissionPage from './pages/connection/ConnectionSubmissionPage';
import ConnectionSubmissionDetailPage from './pages/connection/ConnectionSubmissionDetailPage';
console.log("feature/admin-ui test PR");
;
// 👇 Admin part components
import AdminLayout from './components/Layout/AdminLayout';
import AdminProfile from './pages/admin/AdminProfile';
import Admin2 from './pages/admin/Admin2';
import SuperAdmin from './pages/admin/SuperAdmin';
import WorkSearchResultPage from './pages/WorkSearchResultPage';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

// Permission level helper function
const getLevel = (role) => {
  switch (role) {
    case 'super_admin': return 3;
    case 'admin': return 2;
    case 'user': return 1;
    default: return 0;
  }
};

// Level permission route
const RoleRoute = ({ children, minLevel = 1 }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  const level = getLevel(user?.role);
  if (level < minLevel) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/screen/:id" element={<ScreenDetailsPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        
        {/* Pages that require login */}
        <Route path="/connections/create" element={
          <ProtectedRoute>
            <ConnectionForm />
          </ProtectedRoute>
        } />
        <Route path="/connections/:id" element={
          <ProtectedRoute>
            <ConnectionForm />
          </ProtectedRoute>
        } />
        <Route path="/connection/submit/:workId" element={
          <ProtectedRoute>
            <ConnectionSubmissionPage />
          </ProtectedRoute>
        } />
        
        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin area level permission */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="profile" element={
            <RoleRoute minLevel={1}>
              <AdminProfile />
            </RoleRoute>
          } />
          <Route path="admin2" element={
            <RoleRoute minLevel={2}>
              <Admin2 />
            </RoleRoute>
          } />
          <Route path="superadmin" element={
            <RoleRoute minLevel={3}>
              <SuperAdmin />
            </RoleRoute>
          } />
          <Route path="connection-submission/:id" element={
            <RoleRoute minLevel={2}>
              <ConnectionSubmissionDetailPage />
            </RoleRoute>
          } />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<div style={{ padding: '2rem' }}>Page not found</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
