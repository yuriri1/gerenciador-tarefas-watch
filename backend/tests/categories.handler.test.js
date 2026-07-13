import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	handleCreate: jest.fn(),
	handleList: jest.fn(),
	handleDelete: jest.fn(),
};

await jest.unstable_mockModule('../src/middleware/auth.js', () => ({
	withAuth: (handler) => handler,
}));

await jest.unstable_mockModule('../src/functions/categories/controller.js', () => ({
	CategoryController: class CategoryController {
		handleCreate(...args) {
			return controllerMock.handleCreate(...args);
		}

		handleList(...args) {
			return controllerMock.handleList(...args);
		}

		handleDelete(...args) {
			return controllerMock.handleDelete(...args);
		}
	},
}));

const { create, list, delete: deleteCategory } = await import('../src/functions/categories/handler.js');

describe('categories handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('create faz parse do body e encaminha para o controller', async () => {
		controllerMock.handleCreate.mockResolvedValue({
			statusCode: 201,
			body: { message: 'created' },
		});

		const response = await create({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			body: JSON.stringify({ name: 'Urgente', color: '#FF0000' }),
		});

		expect(controllerMock.handleCreate).toHaveBeenCalledWith({
			name: 'Urgente',
			color: '#FF0000',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: JSON.stringify({ message: 'created' }),
		});
	});

	test('list chama handleList e retorna body serializado', async () => {
		controllerMock.handleList.mockResolvedValue({
			statusCode: 200,
			body: { categories: [{ id: 'cat-1' }] },
		});

		const response = await list({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
		});

		expect(controllerMock.handleList).toHaveBeenCalled();
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ categories: [{ id: 'cat-1' }] }),
		});
	});

	test('delete encaminha id da categoria em pathParameters.id', async () => {
		controllerMock.handleDelete.mockResolvedValue({
			statusCode: 200,
			body: { message: 'deleted' },
		});

		const response = await deleteCategory({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'cat-1',
			},
		});

		expect(controllerMock.handleDelete).toHaveBeenCalledWith('cat-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'deleted' }),
		});
	});

	test('create retorna 400 quando body JSON é inválido', async () => {
		const response = await create({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			body: '{invalid-json',
		});

		expect(controllerMock.handleCreate).not.toHaveBeenCalled();
		expect(response).toEqual({
			statusCode: 400,
			body: JSON.stringify({ message: 'Corpo da requisição inválido.' }),
		});
	});
});