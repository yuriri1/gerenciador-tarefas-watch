import { CategoryService } from './service.js';

function buildResponse(statusCode, body) {
	return {
		statusCode,
		body,
	};
}

export class CategoryController {
	constructor(service = new CategoryService()) {
		this.service = service;
	}

	async handleCreate(body = {}) {
		try {
			const { name, color } = body;

			if (!name || typeof name !== 'string' || !name.trim()) {
				return buildResponse(400, {
					message: 'O campo name é obrigatório.',
				});
			}

			if (!color || typeof color !== 'string' || !color.trim()) {
				return buildResponse(400, {
					message: 'O campo color é obrigatório.',
				});
			}

			const category = await this.service.create({
				name: name.trim(),
				color: color.trim(),
			});

			return buildResponse(201, {
				message: 'Categoria criada com sucesso.',
				category,
			});
		} catch (error) {
			return buildResponse(400, {
				message: error?.message || 'Erro ao criar categoria.',
			});
		}
	}

	async handleList() {
		try {
			const categories = await this.service.listAll();

			return buildResponse(200, {
				categories,
			});
		} catch (error) {
			return buildResponse(400, {
				message: error?.message || 'Erro ao listar categorias.',
			});
		}
	}

	async handleDelete(categoryId) {
		try {
			if (!categoryId) {
				return buildResponse(400, {
					message: 'O parâmetro id é obrigatório.',
				});
			}

			const category = await this.service.delete(categoryId);

			return buildResponse(200, {
				message: 'Categoria excluída com sucesso.',
				category,
			});
		} catch (error) {
			if (error?.message === 'Categoria não encontrada.') {
				return buildResponse(404, {
					message: error.message,
				});
			}

			return buildResponse(400, {
				message: error?.message || 'Erro ao excluir categoria.',
			});
		}
	}
}