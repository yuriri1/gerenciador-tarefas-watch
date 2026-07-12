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
}