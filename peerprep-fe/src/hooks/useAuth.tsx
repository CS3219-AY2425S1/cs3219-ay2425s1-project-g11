import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/network/axiosClient';
import { User } from '@/types/types';
import Cookies from 'js-cookie';

// useAuth hook to manage auth state
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // checks auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = getTokenFromCookie();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Verify token with the server
      const response = await axiosClient.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // user object is returned from server
      // response.data.data is the user object
      if (response.data?.data?.id) {
        setIsAuthenticated(true);
        setUser(response.data.data);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      // resp 200 only if login is successful -> meaning valid user
      const { accessToken, ...userData } = response.data.data;
      setTokenInCookie(accessToken);
      setIsAuthenticated(true);
      setUser(userData);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Rethrow the error so it can be handled by the component
    }
  };

  const logout = () => {
    removeTokenFromCookie();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/signin');
  };

  return { isAuthenticated, isLoading, user, login, logout, checkAuth };
}

// Helper functions for secure cookie management
function getTokenFromCookie(): string | undefined {
  return Cookies.get('auth_token');
}

function setTokenInCookie(token: string): void {
  // Set the cookie to expire in 5 days
  Cookies.set('auth_token', token, {
    expires: 5,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

function removeTokenFromCookie(): void {
  Cookies.remove('auth_token');
}
