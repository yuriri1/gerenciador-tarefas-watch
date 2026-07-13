import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        return true;
      } catch (error) {
        console.error('Erro no login:', error.response?.data || error.message);
        throw error;
      }
    },
    
    async register(name, email, password) {
      try {
        await api.post('/auth/register', { name, email, password });
        return true;
      } catch (error) {
        console.error('Erro no cadastro:', error.response?.data || error.message);
        throw error;
      }
    },
    
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    }
  },
});