import { defineStore } from 'pinia';
import api from '../services/api';

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
  }),

  actions: {
    async fetchTasks(projectId) {
      this.loading = true;
      try {
        const response = await api.get(`/projects/${projectId}/tasks`);
        
        if (Array.isArray(response.data)) {
          this.tasks = response.data;
        } else if (response.data && Array.isArray(response.data.tasks)) {
          this.tasks = response.data.tasks;
        } else {
          this.tasks = [];
        }
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error.response?.data || error.message);
        this.tasks = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTaskStatus(taskId, newStatus) {
      try {
        await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.status = newStatus;
      } catch (error) {
        console.error('Erro ao atualizar status da tarefa:', error.response?.data || error.message);
        throw error;
      }
    },

    async createTask(projectId, title, description) {
      try {
        const response = await api.post('/tasks', { 
          title, 
          description, 
          projectId,
          categoryIds: []
        });
        
        const newTask = response.data.task || response.data;
        
        this.tasks.unshift(newTask);
        return newTask;
      } catch (error) {
        console.error('Erro ao criar tarefa:', error.response?.data || error.message);
        throw error;
      }
    },

    async updateTaskDetails(taskId, { title, description, categoryIds, status }) {
      try {
        const response = await api.patch(`/tasks/${taskId}`, { 
          title, 
          description, 
          status,
          categoryIds
        });
        
        const updatedTask = response.data.task || response.data;
        
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updatedTask };
        }
        return updatedTask;
      } catch (error) {
        console.error('Erro ao atualizar detalhes da tarefa:', error.response?.data || error.message);
        throw error;
      }
    },

    async deleteTask(taskId) {
      try {
        await api.delete(`/tasks/${taskId}`);
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        return true;
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error.response?.data || error.message);
        throw error;
      }
    }
  }
});