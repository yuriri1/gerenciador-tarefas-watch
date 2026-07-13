import { CategoryController } from './controller.js';
import { withAuth } from '../../middleware/auth.js';

const categoryController = new CategoryController();

function parseBody(event) {
	if (!event || event.body == null) {
		return {};
	}

	if (typeof event.body === 'object') {
		return event.body;
	}

	if (typeof event.body !== 'string') {
		return {};
	}

	try {
		return JSON.parse(event.body);
	} catch {
		return null;
	}
}

function formatResponse(result) {
	return {
		statusCode: result.statusCode,
		body: JSON.stringify(result.body),
	};
}

export const create = withAuth(async (event) => {
	try {
		const userId = event?.requestContext?.authorizer?.user?.userId;
		const body = parseBody(event);

		if (!userId) {
			return formatResponse({
				statusCode: 401,
				body: { message: 'Usuário não autenticado.' },
			});
		}

		if (body === null) {
			return formatResponse({
				statusCode: 400,
				body: { message: 'Corpo da requisição inválido.' },
			});
		}

		const response = await categoryController.handleCreate(body);
		return formatResponse(response);
	} catch {
		return formatResponse({
			statusCode: 500,
			body: { message: 'Erro interno do servidor.' },
		});
	}
});

export const list = withAuth(async (event) => {
	try {
		const userId = event?.requestContext?.authorizer?.user?.userId;

		if (!userId) {
			return formatResponse({
				statusCode: 401,
				body: { message: 'Usuário não autenticado.' },
			});
		}

		const response = await categoryController.handleList();
		return formatResponse(response);
	} catch {
		return formatResponse({
			statusCode: 500,
			body: { message: 'Erro interno do servidor.' },
		});
	}
});

const deleteHandler = withAuth(async (event) => {
	try {
		const userId = event?.requestContext?.authorizer?.user?.userId;
		const categoryId = event?.pathParameters?.id;

		if (!userId) {
			return formatResponse({
				statusCode: 401,
				body: { message: 'Usuário não autenticado.' },
			});
		}

		if (!categoryId) {
			return formatResponse({
				statusCode: 400,
				body: { message: 'O parâmetro id é obrigatório.' },
			});
		}

		const response = await categoryController.handleDelete(categoryId);
		return formatResponse(response);
	} catch {
		return formatResponse({
			statusCode: 500,
			body: { message: 'Erro interno do servidor.' },
		});
	}
});

export { deleteHandler as delete };