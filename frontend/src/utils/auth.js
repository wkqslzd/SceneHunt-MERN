import { useNavigate } from 'react-router-dom';

// Check whether the user has logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Handle actions that require login
export const handleAuthAction = (action) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Save the current URL so that it can be redirected back after login
    const currentPath = window.location.pathname;
    localStorage.setItem('redirectAfterLogin', currentPath);
    // Redirect to the login page
    window.location.href = '/login';
    return false;
  }
  return action();
};

// Get authentication header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 