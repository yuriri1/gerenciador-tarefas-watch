import { defineStore } from 'pinia';
import api from '../services/api';

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [],
    loading: false,
  }),

  actions: {
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await api.get('/projects');
        this.projects = Array.isArray(response.data) 
          ? response.data 
          : (response.data.projects || []);
      } catch (error) {
        console.error('Erro ao buscar projetos:', error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProject(name, description) {
      try {
        const response = await api.post('/projects', { name, description });
        
        if (!Array.isArray(this.projects)) {
          this.projects = [];
        }

        const newProject = response.data.project || response.data;
        
        this.projects.push(newProject);
        return newProject;
      } catch (error) {
        console.error('Erro ao criar projeto:', error.response?.data || error.message);
        throw error;
      }
    }
  }
});