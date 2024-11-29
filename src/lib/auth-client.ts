// Client-side authentication utilities
import Cookies from 'js-cookie';

export const getAuthToken = () => {
  return Cookies.get('auth_token');
};

export const setAuthToken = (token: string) => {
  // Set cookie with secure options
  Cookies.set('auth_token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
};

export const removeAuthToken = () => {
  Cookies.remove('auth_token', { path: '/' });
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const handleLogout = () => {
  removeAuthToken();
  // Redirect to sign-in page
  window.location.href = '/sign-in';
};
