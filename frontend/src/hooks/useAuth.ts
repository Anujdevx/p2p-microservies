import { useState, useEffect } from 'react';
import { authService, peerService } from '../services/api';

function extractUsernameFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuthStatus();
    window.addEventListener('authStatusChange', checkAuthStatus);
    return () => window.removeEventListener('authStatusChange', checkAuthStatus);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await authService.authLogin(username, password);
      window.dispatchEvent(new Event('authStatusChange'));
      // Auto-register as an active peer immediately after login
      try {
        await peerService.registerPeer(username);
      } catch (e) {
        console.warn('Peer registration failed (may already be registered)', e);
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Login error', error);
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await authService.authRegister(username, password);
      return { success: true };
    } catch (error: any) {
      console.error('Register error', error);
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const logout = () => {
    // Deregister peer so contacts see them as offline
    const token = localStorage.getItem('auth_token');
    if (token) {
      const username = extractUsernameFromToken(token);
      if (username) {
        peerService.deregisterPeer(username).catch(() => {});
      }
    }
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('authStatusChange'));
  };

  return { isAuthenticated, login, register, logout };
}
