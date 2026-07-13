import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	handleCreate: jest.fn(),
	handleListByProject: jest.fn(),
	handleUpdateStatus: jest.fn(),
	handleGetById: jest.fn(),
	handleUpdate: jest.fn(),
	handleDelete: jest.fn(),
};

await jest.unstable_mockModule('../src/middleware/auth.js', () => ({
	withAuth: (handler) => handler,
}));

await jest.unstable_mockModule('../src/functions/tasks/controller.js', () => ({
	TaskController: class TaskController {
		handleCreate(...args) {
			return controllerMock.handleCreate(...args);
		}

		handleListByProject(...args) {
			return controllerMock.handleListByProject(...args);
		}

		handleUpdateStatus(...args) {
			return controllerMock.handleUpdateStatus(...args);
		}

			handleGetById(...args) {
				return controllerMock.handleGetById(...args);
			}

			handleUpdate(...args) {
				return controllerMock.handleUpdate(...args);
			}

			handleDelete(...args) {
				return controllerMock.handleDelete(...args);
			}
	},
}));

const { create, list, updateStatus, getById, update, remove } = await import('../src/functions/tasks/handler.js');

describe('tasks handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('create encaminha o userId e formata a resposta', async () => {
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
			body: JSON.stringify({
				title: 'Task',
				projectId: 'project-1',
			}),
		});

		expect(controllerMock.handleCreate).toHaveBeenCalledWith('user-1', {
			title: 'Task',
			projectId: 'project-1',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: JSON.stringify({ message: 'created' }),
		});
	});

	test('list encaminha o projectId para o controller', async () => {
		controllerMock.handleListByProject.mockResolvedValue({
			statusCode: 200,
			body: { tasks: [{ id: 'task-1' }] },
		});

		const response = await list({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				projectId: 'project-1',
			},
		});

		expect(controllerMock.handleListByProject).toHaveBeenCalledWith('project-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ tasks: [{ id: 'task-1' }] }),
		});
	});

	test('updateStatus encaminha o id da tarefa e o corpo da requisição', async () => {
		controllerMock.handleUpdateStatus.mockResolvedValue({
			statusCode: 200,
			body: { message: 'updated' },
		});

		const response = await updateStatus({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'task-1',
			},
			body: JSON.stringify({ status: 'COMPLETED' }),
		});

		expect(controllerMock.handleUpdateStatus).toHaveBeenCalledWith('task-1', {
			status: 'COMPLETED',
		});
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'updated' }),
		});
	});

	test('getById encaminha o id da tarefa e formata a resposta', async () => {
		controllerMock.handleGetById.mockResolvedValue({
			statusCode: 200,
			body: { task: { id: 'task-1' } },
		});

		const response = await getById({
			requestContext: {
				authorizer: {
					user: { userId: 'user-1' },
				},
			},
			pathParameters: {
				id: 'task-1',
			},
		});

		expect(controllerMock.handleGetById).toHaveBeenCalledWith('task-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ task: { id: 'task-1' } }),
		});
	});

	test('update encaminha o id da tarefa e o corpo completo', async () => {
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
				id: 'task-1',
			},
			body: JSON.stringify({
				title: 'Task',
				description: 'Desc',
				status: 'COMPLETED',
				categoryIds: ['cat-1'],
			}),
		});

		expect(controllerMock.handleUpdate).toHaveBeenCalledWith('task-1', {
			title: 'Task',
			description: 'Desc',
			status: 'COMPLETED',
			categoryIds: ['cat-1'],
		});
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'updated' }),
		});
	});

	test('remove encaminha o id da tarefa e formata a resposta', async () => {
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
				id: 'task-1',
			},
		});

		expect(controllerMock.handleDelete).toHaveBeenCalledWith('task-1');
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'deleted' }),
		});
	});
});