import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('TaskService', () => {
	let prismaMock;
	let TaskService;

	beforeEach(async () => {
		jest.resetModules();
		prismaMock = {
			task: {
				create: jest.fn(),
				findMany: jest.fn(),
				update: jest.fn(),
			},
		};

		await jest.unstable_mockModule('../src/config/prisma.js', () => ({
			default: prismaMock,
			prisma: prismaMock,
		}));

		({ TaskService } = await import('../src/functions/tasks/service.js'));
	});

	test('create conecta categorias quando os IDs são fornecidos', async () => {
		prismaMock.task.create.mockResolvedValue({ id: 'task-1' });
		const service = new TaskService(prismaMock);

		const result = await service.create('user-1', {
			title: 'Task',
			description: 'Desc',
			projectId: 'project-1',
			categoryIds: ['cat-1', 'cat-2'],
		});

		expect(prismaMock.task.create).toHaveBeenCalledWith({
			data: {
				title: 'Task',
				description: 'Desc',
				projectId: 'project-1',
				userId: 'user-1',
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
});