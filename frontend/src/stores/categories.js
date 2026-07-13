import { defineStore } from 'pinia';
import api from '../services/api';

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get('/categories');
        this.categories = Array.isArray(response.data) ? response.data : (response.data.categories || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(name, color) {
      try {
        const response = await api.post('/categories', { name, color });
        const newCategory = response.data.category || response.data;
        this.categories.push(newCategory);
        return newCategory;
      } catch (error) {
        console.error('Erro ao criar categoria:', error.response?.data || error.message);
        throw error;
      }
    }
  }
});