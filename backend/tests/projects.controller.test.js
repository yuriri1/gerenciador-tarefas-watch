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
			update: jest.fn(),
			delete: jest.fn(),
			addMember: jest.fn(),
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

	test('handleUpdate retorna 403 quando o usuário não é o criador', async () => {
		service.update.mockRejectedValue(new Error('Sem permissão para alterar este projeto.'));

		const response = await controller.handleUpdate('project-1', 'user-1', {
			name: 'Project',
		});

		expect(response).toEqual({
			statusCode: 403,
			body: {
				message: 'Sem permissão para alterar este projeto.',
			},
		});
	});

	test('handleDelete retorna 200 quando o projeto é excluído', async () => {
		service.delete.mockResolvedValue({ id: 'project-1' });

		const response = await controller.handleDelete('project-1', 'user-1');

		expect(service.delete).toHaveBeenCalledWith('project-1', 'user-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Projeto excluído com sucesso.',
				project: { id: 'project-1' },
			},
		});
	});

	test('handleAddMember retorna 400 quando email está faltando', async () => {
		const response = await controller.handleAddMember('project-1', 'user-1', {});

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'O campo email é obrigatório.',
			},
		});
		expect(service.addMember).not.toHaveBeenCalled();
	});

	test('handleAddMember retorna 201 quando o membro é adicionado', async () => {
		service.addMember.mockResolvedValue({
			id: 'membership-1',
			user: { id: 'user-2', name: 'Member', email: 'member@example.com' },
		});

		const response = await controller.handleAddMember('project-1', 'user-1', {
			email: ' member@example.com ',
		});

		expect(service.addMember).toHaveBeenCalledWith('project-1', 'user-1', {
			email: 'member@example.com',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: {
				message: 'Membro adicionado ao projeto com sucesso.',
				member: {
					id: 'membership-1',
					user: { id: 'user-2', name: 'Member', email: 'member@example.com' },
				},
			},
		});
	});

	test('handleAddMember retorna 409 quando o usuário já é membro', async () => {
		service.addMember.mockRejectedValue(new Error('Usuário já é membro deste projeto.'));

		const response = await controller.handleAddMember('project-1', 'user-1', {
			email: 'member@example.com',
		});

		expect(response).toEqual({
			statusCode: 409,
			body: {
				message: 'Usuário já é membro deste projeto.',
			},
		});
	});
});