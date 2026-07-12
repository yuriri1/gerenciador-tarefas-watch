import { TaskService } from './service.js';

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body,
  };
}

export class TaskController {
  constructor(service = new TaskService()) {
    this.service = service;
  }

  async handleCreate(userId, body = {}) {
    try {
      const { title, description, projectId, categoryIds } = body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return buildResponse(400, {
          message: 'O campo title é obrigatório.',
        });
      }

      if (!projectId) {
        return buildResponse(400, {
          message: 'O campo projectId é obrigatório.',
        });
      }

      const task = await this.service.create(userId, {
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : description,
        projectId,
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      });

      return buildResponse(201, {
        message: 'Tarefa criada com sucesso.',
        task,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao criar tarefa.',
      });
    }
  }

  async handleListByProject(projectId) {
    try {
      if (!projectId) {
        return buildResponse(400, {
          message: 'O parâmetro projectId é obrigatório.',
        });
      }

      const tasks = await this.service.listByProject(projectId);

      return buildResponse(200, {
        tasks,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao listar tarefas.',
      });
    }
  }

  async handleUpdateStatus(taskId, body = {}) {
    try {
      const { status } = body;

      if (!status) {
        return buildResponse(400, {
          message: 'O campo status é obrigatório.',
        });
      }

      const task = await this.service.updateStatus(taskId, status);

      return buildResponse(200, {
        message: 'Status da tarefa atualizado com sucesso.',
        task,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao atualizar status da tarefa.',
      });
    }
  }
}