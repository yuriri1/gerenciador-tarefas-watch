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
    },

    async deleteProject(projectId) {
      try {
        await api.delete(`/projects/${projectId}`);
        this.projects = this.projects.filter(p => p.id !== projectId);
        return true;
      } catch (error) {
        console.error('Erro ao deletar workspace:', error.response?.data || error.message);
        throw error;
      }
    },

    async addWorkspaceMember(projectId, email) {
      try {
        const response = await api.post(`/projects/${projectId}/members`, { email });
        const newMember = response.data.member || response.data;

        const project = this.projects.find(p => p.id === projectId);
        if (project && newMember) {
          if (!Array.isArray(project.members)) {
            project.members = [];
          }
          const alreadyExists = project.members.some(
            m => (m.user?.id || m.userId) === (newMember.user?.id || newMember.userId)
          );
          if (!alreadyExists) {
            project.members.push(newMember);
          }
        }

        return newMember;
      } catch (error) {
        console.error('Erro ao adicionar membro:', error.response?.data || error.message);
        throw error;
      }
    }
  }
});