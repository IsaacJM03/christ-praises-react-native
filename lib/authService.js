import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const authService = {
  // Register user
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
        // Store user with name
        const userData = { 
          id: data.data.user.id, 
          name: data.data.user.name || name, // Use name from response or input
          email: data.data.user.email || email,
          image: data.data.user.image || null
        };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
        // Store user data with all fields
        const userData = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          image: data.data.user.image || null
        };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
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
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true };
    }
  },

  // Get current user from server
  async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) return { success: false, message: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
      }
      
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, message: 'Network error' };
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

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  // Check if logged in
  async isLoggedIn() {
    const token = await this.getToken();
    return !!token;
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const token = await this.getToken();
      if (!token) return { success: false, message: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error' };
    }
  }
};
