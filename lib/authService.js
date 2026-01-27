import { API_BASE_URL } from '../constants';

export const authService = {
  async register(name, email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data?.error || 'Sign up failed' };
      return { success: true, user: data };
    } catch (e) {
      return { success: false, message: e.message || 'Network error' };
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data?.error || 'Login failed' };
      return { success: true, token: data.token, user: data.user };
    } catch (e) {
      return { success: false, message: e.message || 'Network error' };
    }
  },
};
