import { beforeEach, describe, expect, jest, test } from '@jest/globals';

await jest.unstable_mockModule('../src/functions/projects/service.js', () => ({
	ProjectService: class ProjectService {},
}));

const { ProjectController } = await import('../src/functions/projects/controller.js');

describe('ProjectController', () => {
	let service;
	let controller;

	beforeEach(() => {
		service = {
			create: jest.fn(),
			listAllFromUser: jest.fn(),
		};
		controller = new ProjectController(service);
		jest.clearAllMocks();
	});

	test('handleCreate retorna 400 quando o nome está faltando', async () => {
		const response = await controller.handleCreate('user-1', { description: 'Desc' });

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'O campo name é obrigatório.',
			},
		});
		expect(service.create).not.toHaveBeenCalled();
	});

	test('handleCreate formata o corpo da requisição e retorna resposta adequada', async () => {
		service.create.mockResolvedValue({ id: 'project-1', name: 'Project' });

		const response = await controller.handleCreate('user-1', {
			name: ' Project ',
			description: ' Description ',
		});

		expect(service.create).toHaveBeenCalledWith('user-1', {
			name: 'Project',
			description: 'Description',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: {
				message: 'Projeto criado com sucesso.',
				project: { id: 'project-1', name: 'Project' },
			},
		});
	});

	test('handleList retorna projetos com status 200', async () => {
		service.listAllFromUser.mockResolvedValue([{ id: 'project-1' }]);

		const response = await controller.handleList('user-1');

		expect(service.listAllFromUser).toHaveBeenCalledWith('user-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				projects: [{ id: 'project-1' }],
			},
		});
	});
});