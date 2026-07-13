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
      const {
        title,
        description,
        projectId,
        categoryIds,
        userId: assignedUserId,
        UserId,
      } = body;

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
        userId: assignedUserId ?? UserId,
      });

      return buildResponse(201, {
        message: 'Tarefa criada com sucesso.',
        task,
      });
    } catch (error) {
      if (error?.message === 'Projeto não encontrado.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Usuário informado não é membro do projeto.') {
        return buildResponse(400, {
          message: error.message,
        });
      }

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
      if (error?.message === 'Tarefa não encontrada.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao atualizar status da tarefa.',
      });
    }
  }

  async handleGetById(taskId) {
    try {
      if (!taskId) {
        return buildResponse(400, {
          message: 'O parâmetro id é obrigatório.',
        });
      }

      const task = await this.service.getById(taskId);

      if (!task) {
        return buildResponse(404, {
          message: 'Tarefa não encontrada.',
        });
      }

      return buildResponse(200, {
        task,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao buscar tarefa.',
      });
    }
  }

  async handleUpdate(taskId, body = {}) {
    try {
      const {
        title,
        description,
        status,
        categoryIds,
        userId,
        UserId,
      } = body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return buildResponse(400, {
          message: 'O campo title é obrigatório.',
        });
      }

      if (!status) {
        return buildResponse(400, {
          message: 'O campo status é obrigatório.',
        });
      }

      const task = await this.service.update(taskId, {
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : description,
        status,
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
        userId: userId ?? UserId,
      });

      return buildResponse(200, {
        message: 'Tarefa atualizada com sucesso.',
        task,
      });
    } catch (error) {
      if (error?.message === 'Tarefa não encontrada.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Usuário informado não é membro do projeto.') {
        return buildResponse(400, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao atualizar tarefa.',
      });
    }
  }

  async handleDelete(taskId) {
    try {
      if (!taskId) {
        return buildResponse(400, {
          message: 'O parâmetro id é obrigatório.',
        });
      }

      const task = await this.service.delete(taskId);

      return buildResponse(200, {
        message: 'Tarefa excluída com sucesso.',
        task,
      });
    } catch (error) {
      if (error?.message === 'Tarefa não encontrada.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao excluir tarefa.',
      });
    }
  }
}