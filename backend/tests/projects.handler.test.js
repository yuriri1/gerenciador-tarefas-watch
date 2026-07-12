import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	handleCreate: jest.fn(),
	handleList: jest.fn(),
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
	},
}));

const { create, list } = await import('../src/functions/projects/handler.js');

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
});