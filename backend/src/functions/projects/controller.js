import { ProjectService } from './service.js';

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body,
  };
}

export class ProjectController {
  constructor(service = new ProjectService()) {
    this.service = service;
  }

  async handleCreate(userId, body = {}) {
    try {
      const { name, description } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return buildResponse(400, {
          message: 'O campo name é obrigatório.',
        });
      }

      const project = await this.service.create(userId, {
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : description,
      });

      return buildResponse(201, {
        message: 'Projeto criado com sucesso.',
        project,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao criar projeto.',
      });
    }
  }

  async handleList(userId) {
    try {
      const projects = await this.service.listAllFromUser(userId);

      return buildResponse(200, {
        projects,
      });
    } catch (error) {
      return buildResponse(400, {
        message: error?.message || 'Erro ao listar projetos.',
      });
    }
  }

  async handleUpdate(projectId, userId, body = {}) {
    try {
      const { name, description } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return buildResponse(400, {
          message: 'O campo name é obrigatório.',
        });
      }

      const project = await this.service.update(projectId, userId, {
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : description,
      });

      return buildResponse(200, {
        message: 'Projeto atualizado com sucesso.',
        project,
      });
    } catch (error) {
      if (error?.message === 'Projeto não encontrado.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Sem permissão para alterar este projeto.') {
        return buildResponse(403, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao atualizar projeto.',
      });
    }
  }

  async handleDelete(projectId, userId) {
    try {
      const project = await this.service.delete(projectId, userId);

      return buildResponse(200, {
        message: 'Projeto excluído com sucesso.',
        project,
      });
    } catch (error) {
      if (error?.message === 'Projeto não encontrado.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Sem permissão para excluir este projeto.') {
        return buildResponse(403, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao excluir projeto.',
      });
    }
  }

  async handleAddMember(projectId, userId, body = {}) {
    try {
      const { email } = body;

      if (!email || typeof email !== 'string' || !email.trim()) {
        return buildResponse(400, {
          message: 'O campo email é obrigatório.',
        });
      }

      const member = await this.service.addMember(projectId, userId, {
        email: email.trim(),
      });

      return buildResponse(201, {
        message: 'Membro adicionado ao projeto com sucesso.',
        member,
      });
    } catch (error) {
      if (error?.message === 'Projeto não encontrado.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Sem permissão para adicionar membros a este projeto.') {
        return buildResponse(403, {
          message: error.message,
        });
      }

      if (error?.message === 'Usuário não encontrado.') {
        return buildResponse(404, {
          message: error.message,
        });
      }

      if (error?.message === 'Usuário já é membro deste projeto.') {
        return buildResponse(409, {
          message: error.message,
        });
      }

      return buildResponse(400, {
        message: error?.message || 'Erro ao adicionar membro ao projeto.',
      });
    }
  }
}