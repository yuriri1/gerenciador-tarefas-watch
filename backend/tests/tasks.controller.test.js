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
});