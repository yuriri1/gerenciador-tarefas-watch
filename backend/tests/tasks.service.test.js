import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('TaskService', () => {
	let prismaMock;
	let TaskService;

	beforeEach(async () => {
		jest.resetModules();
		prismaMock = {
			project: {
				findUnique: jest.fn(),
			},
			task: {
				findUnique: jest.fn(),
				create: jest.fn(),
				findMany: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			},
		};

		await jest.unstable_mockModule('../src/config/prisma.js', () => ({
			default: prismaMock,
			prisma: prismaMock,
		}));

		({ TaskService } = await import('../src/functions/tasks/service.js'));
	});

	test('create conecta categorias quando os IDs são fornecidos', async () => {
		prismaMock.project.findUnique.mockResolvedValue({ id: 'project-1' });
		prismaMock.task.create.mockResolvedValue({ id: 'task-1' });
		const service = new TaskService(prismaMock);

		const result = await service.create('user-1', {
			title: 'Task Alpha',
			description: 'Desc Here',
			projectId: 'project-1',
			categoryIds: ['cat-1', 'cat-2'],
		});

		expect(prismaMock.task.create).toHaveBeenCalledWith({
			data: {
				title: 'task alpha',
				description: 'desc here',
				project: {
					connect: {
						id: 'project-1',
					},
				},
				creator: {
					connect: {
						id: 'user-1',
					},
				},
				categories: {
					connect: [{ id: 'cat-1' }, { id: 'cat-2' }],
				},
			},
			include: {
				categories: true,
			},
		});
		expect(result).toEqual({ id: 'task-1' });
	});

	test('create lança erro quando o projeto não existe', async () => {
		prismaMock.project.findUnique.mockResolvedValue(null);
		const service = new TaskService(prismaMock);

		await expect(
			service.create('user-1', {
				title: 'Task',
				description: 'Desc Here',
				projectId: 'project-inexistente',
			}),
		).rejects.toThrow('Projeto não encontrado.');

		expect(prismaMock.task.create).not.toHaveBeenCalled();
	});

	test('listByProject filtra por id do projeto e inclui categorias', async () => {
		prismaMock.task.findMany.mockResolvedValue([{ id: 'task-1' }]);
		const service = new TaskService(prismaMock);

		const result = await service.listByProject('project-1');

		expect(prismaMock.task.findMany).toHaveBeenCalledWith({
			where: { projectId: 'project-1' },
			include: { categories: true },
			orderBy: { createdAt: 'desc' },
		});
		expect(result).toEqual([{ id: 'task-1' }]);
	});

	test('updateStatus atualiza apenas o campo de status', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' });
		prismaMock.task.update.mockResolvedValue({ id: 'task-1', status: 'COMPLETED' });
		const service = new TaskService(prismaMock);

		const result = await service.updateStatus('task-1', 'COMPLETED');

		expect(prismaMock.task.update).toHaveBeenCalledWith({
			where: { id: 'task-1' },
			data: { status: 'COMPLETED' },
			include: { categories: true },
		});
		expect(result).toEqual({ id: 'task-1', status: 'COMPLETED' });
	});

	test('updateStatus lança erro quando a tarefa não existe', async () => {
		prismaMock.task.findUnique.mockResolvedValue(null);
		const service = new TaskService(prismaMock);

		await expect(service.updateStatus('task-inexistente', 'COMPLETED')).rejects.toThrow(
			'Tarefa não encontrada.',
		);

		expect(prismaMock.task.update).not.toHaveBeenCalled();
	});

	test('getById busca uma tarefa detalhada', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' });
		const service = new TaskService(prismaMock);

		const result = await service.getById('task-1');

		expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
			where: { id: 'task-1' },
			include: {
				categories: true,
				project: {
					include: {
						creator: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
		expect(result).toEqual({ id: 'task-1' });
	});

	test('update atualiza campos e substitui categorias', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' });
		prismaMock.task.update.mockResolvedValue({ id: 'task-1', title: 'Nova task' });
		const service = new TaskService(prismaMock);

		const result = await service.update('task-1', {
			title: 'Nova Task',
			description: 'Nova Desc',
			status: 'COMPLETED',
			categoryIds: ['cat-1', 'cat-2'],
		});

		expect(prismaMock.task.update).toHaveBeenCalledWith({
			where: { id: 'task-1' },
			data: {
				title: 'nova task',
				status: 'COMPLETED',
				description: 'nova desc',
				categories: {
					set: [{ id: 'cat-1' }, { id: 'cat-2' }],
				},
			},
			include: { categories: true },
		});
		expect(result).toEqual({ id: 'task-1', title: 'Nova task' });
	});

	test('delete lança erro quando a tarefa não existe', async () => {
		prismaMock.task.findUnique.mockResolvedValue(null);
		const service = new TaskService(prismaMock);

		await expect(service.delete('task-inexistente')).rejects.toThrow('Tarefa não encontrada.');
		expect(prismaMock.task.delete).not.toHaveBeenCalled();
	});
});