import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const authService = {
  // Register new user
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Save token and user data
        await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Save token and user data
        await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Logout user
  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Failed to logout' };
    }
  },

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  // Get stored user
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Check if user is logged in
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  // Get current user from API
  async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, message: 'Network error' };
    }
  },
};
