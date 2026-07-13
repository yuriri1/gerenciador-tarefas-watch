import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	handleCreate: jest.fn(),
	handleList: jest.fn(),
	handleUpdate: jest.fn(),
	handleDelete: jest.fn(),
	handleAddMember: jest.fn(),
};

await jest.unstable_mockModule('../src/middleware/auth.js', () => ({
	withAuth: (handler) => handler,
}));

await jest.unstable_mockModule('../src/functions/projects/controller.js', () => ({
	ProjectController: class ProjectController {
		handleCreate(...args) {
			return controllerMock.handleCreate(...args);
		}

		handleList(...args) {
			return controllerMock.handleList(...args);
		}

			handleUpdate(...args) {
				return controllerMock.handleUpdate(...args);
			}

			handleDelete(...args) {
				return controllerMock.handleDelete(...args);
			}

			handleAddMember(...args) {
				return controllerMock.handleAddMember(...args);
			}
	},
}));

const { create, list, update, remove, addMember } = await import('../src/functions/projects/handler.js');

describe('projects handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('create faz o parse do corpo e encaminha o userId', async () => {
		controllerMock.handleCreate.mockResolvedValue({
			statusCode: 201,
			body: { message: 'created' },
		});

		const response = await create({
			headers: {},
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			body: JSON.stringify({ name: 'Project', description: 'Desc' }),
		});

		expect(controllerMock.handleCreate).toHaveBeenCalledWith('user-1', {
			name: 'Project',
			description: 'Desc',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: JSON.stringify({ message: 'created' }),
		});
	});

	test('list encaminha o userId e formata a resposta', async () => {
		controllerMock.handleList.mockResolvedValue({
			statusCode: 200,
			body: { projects: [{ id: 'project-1' }] },
		});

		const response = await list({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
		});

		expect(controllerMock.handleList).toHaveBeenCalledWith('user-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ projects: [{ id: 'project-1' }] }),
		});
	});

	test('update encaminha o id do projeto e o corpo da requisição', async () => {
		controllerMock.handleUpdate.mockResolvedValue({
			statusCode: 200,
			body: { message: 'updated' },
		});

		const response = await update({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'project-1',
			},
			body: JSON.stringify({ name: 'Project' }),
		});

		expect(controllerMock.handleUpdate).toHaveBeenCalledWith('project-1', 'user-1', {
			name: 'Project',
		});
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'updated' }),
		});
	});

	test('remove encaminha o id do projeto e formata a resposta', async () => {
		controllerMock.handleDelete.mockResolvedValue({
			statusCode: 200,
			body: { message: 'deleted' },
		});

		const response = await remove({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'project-1',
			},
		});

		expect(controllerMock.handleDelete).toHaveBeenCalledWith('project-1', 'user-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'deleted' }),
		});
	});

	test('addMember encaminha o id do projeto, o userId e o corpo da requisição', async () => {
		controllerMock.handleAddMember.mockResolvedValue({
			statusCode: 201,
			body: { message: 'member added' },
		});

		const response = await addMember({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'project-1',
			},
			body: JSON.stringify({ email: 'member@example.com' }),
		});

		expect(controllerMock.handleAddMember).toHaveBeenCalledWith('project-1', 'user-1', {
			email: 'member@example.com',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: JSON.stringify({ message: 'member added' }),
		});
	});

	test('addMember retorna 400 quando o corpo JSON é inválido', async () => {
		const response = await addMember({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'project-1',
			},
			body: '{invalid-json}',
		});

		expect(controllerMock.handleAddMember).not.toHaveBeenCalled();
		expect(response).toEqual({
			statusCode: 400,
			body: JSON.stringify({ message: 'Corpo da requisição inválido.' }),
		});
	});
});