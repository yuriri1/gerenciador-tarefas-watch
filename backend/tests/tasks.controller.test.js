import { beforeEach, describe, expect, jest, test } from '@jest/globals';

await jest.unstable_mockModule('../src/functions/tasks/service.js', () => ({
	TaskService: class TaskService {},
}));

const { TaskController } = await import('../src/functions/tasks/controller.js');

describe('TaskController', () => {
	let service;
	let controller;

	beforeEach(() => {
		service = {
			create: jest.fn(),
			listByProject: jest.fn(),
			updateStatus: jest.fn(),
			getById: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};
		controller = new TaskController(service);
		jest.clearAllMocks();
	});

	test('handleCreate retorna 400 quando o título está faltando', async () => {
		const response = await controller.handleCreate('user-1', { projectId: 'project-1' });

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'O campo title é obrigatório.',
			},
		});
		expect(service.create).not.toHaveBeenCalled();
	});

	test('handleCreate retorna 201 quando a tarefa é criada', async () => {
		service.create.mockResolvedValue({ id: 'task-1' });

		const response = await controller.handleCreate('user-1', {
			title: ' Task ',
			description: ' Description ',
			projectId: 'project-1',
			categoryIds: ['cat-1'],
		});

		expect(service.create).toHaveBeenCalledWith('user-1', {
			title: 'Task',
			description: 'Description',
			projectId: 'project-1',
			categoryIds: ['cat-1'],
		});
		expect(response).toEqual({
			statusCode: 201,
			body: {
				message: 'Tarefa criada com sucesso.',
				task: { id: 'task-1' },
			},
		});
	});

	test('handleCreate retorna 404 quando o projeto não existe', async () => {
		service.create.mockRejectedValue(new Error('Projeto não encontrado.'));

		const response = await controller.handleCreate('user-1', {
			title: 'Task',
			projectId: 'project-inexistente',
		});

		expect(response).toEqual({
			statusCode: 404,
			body: {
				message: 'Projeto não encontrado.',
			},
		});
	});

	test('handleListByProject retorna tarefas para o projeto', async () => {
		service.listByProject.mockResolvedValue([{ id: 'task-1' }]);

		const response = await controller.handleListByProject('project-1');

		expect(service.listByProject).toHaveBeenCalledWith('project-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				tasks: [{ id: 'task-1' }],
			},
		});
	});

	test('handleUpdateStatus retorna 200 após atualizar o status', async () => {
		service.updateStatus.mockResolvedValue({ id: 'task-1', status: 'COMPLETED' });

		const response = await controller.handleUpdateStatus('task-1', { status: 'COMPLETED' });

		expect(service.updateStatus).toHaveBeenCalledWith('task-1', 'COMPLETED');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Status da tarefa atualizado com sucesso.',
				task: { id: 'task-1', status: 'COMPLETED' },
			},
		});
	});

	test('handleUpdateStatus retorna 404 quando a tarefa não existe', async () => {
		service.updateStatus.mockRejectedValue(new Error('Tarefa não encontrada.'));

		const response = await controller.handleUpdateStatus('task-inexistente', { status: 'COMPLETED' });

		expect(response).toEqual({
			statusCode: 404,
			body: {
				message: 'Tarefa não encontrada.',
			},
		});
	});

	test('handleGetById retorna 200 com a tarefa detalhada', async () => {
		service.getById.mockResolvedValue({ id: 'task-1' });

		const response = await controller.handleGetById('task-1');

		expect(service.getById).toHaveBeenCalledWith('task-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				task: { id: 'task-1' },
			},
		});
	});

	test('handleUpdate retorna 200 quando a tarefa é atualizada', async () => {
		service.update.mockResolvedValue({ id: 'task-1', title: 'Nova task' });

		const response = await controller.handleUpdate('task-1', {
			title: ' Nova task ',
			description: ' Nova desc ',
			status: 'IN_PROGRESS',
			categoryIds: ['cat-1'],
		});

		expect(service.update).toHaveBeenCalledWith('task-1', {
			title: 'Nova task',
			description: 'Nova desc',
			status: 'IN_PROGRESS',
			categoryIds: ['cat-1'],
		});
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Tarefa atualizada com sucesso.',
				task: { id: 'task-1', title: 'Nova task' },
			},
		});
	});

	test('handleDelete retorna 200 quando a tarefa é excluída', async () => {
		service.delete.mockResolvedValue({ id: 'task-1' });

		const response = await controller.handleDelete('task-1');

		expect(service.delete).toHaveBeenCalledWith('task-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Tarefa excluída com sucesso.',
				task: { id: 'task-1' },
			},
		});
	});
});