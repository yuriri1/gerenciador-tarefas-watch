import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	handleCreate: jest.fn(),
	handleListByProject: jest.fn(),
	handleUpdateStatus: jest.fn(),
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
	},
}));

const { create, list, updateStatus } = await import('../src/functions/tasks/handler.js');

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
});