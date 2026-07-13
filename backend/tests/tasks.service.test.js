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
			projectMember: {
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
		prismaMock.task.create.mockResolvedValue({ id: 'task-1', collaborations: [] });
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
				collaborations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});
		expect(result).toEqual({ id: 'task-1', collaborations: [], assignedUserId: null });
	});

	test('create cria colaboração quando userId é fornecido', async () => {
		prismaMock.project.findUnique.mockResolvedValue({ id: 'project-1' });
		prismaMock.projectMember.findUnique.mockResolvedValue({ id: 'member-1' });
		prismaMock.task.create.mockResolvedValue({
			id: 'task-1',
			collaborations: [{ userId: 'user-2' }],
		});
		const service = new TaskService(prismaMock);

		const result = await service.create('user-1', {
			title: 'Task Alpha',
			description: 'Desc Here',
			projectId: 'project-1',
			categoryIds: [],
			userId: 'user-2',
		});

		expect(prismaMock.projectMember.findUnique).toHaveBeenCalledWith({
			where: {
				projectId_userId: {
					projectId: 'project-1',
					userId: 'user-2',
				},
			},
			select: {
				id: true,
			},
		});
		expect(prismaMock.task.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					collaborations: {
						create: [{ userId: 'user-2' }],
					},
				}),
			}),
		);
		expect(result).toEqual({
			id: 'task-1',
			collaborations: [{ userId: 'user-2' }],
			assignedUserId: 'user-2',
		});
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
		prismaMock.task.findMany.mockResolvedValue([{ id: 'task-1', collaborations: [] }]);
		const service = new TaskService(prismaMock);

		const result = await service.listByProject('project-1');

		expect(prismaMock.task.findMany).toHaveBeenCalledWith({
			where: { projectId: 'project-1' },
			include: {
				categories: true,
				collaborations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		expect(result).toEqual([{ id: 'task-1', collaborations: [], assignedUserId: null }]);
	});

	test('updateStatus atualiza apenas o campo de status', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1' });
		prismaMock.task.update.mockResolvedValue({ id: 'task-1', status: 'COMPLETED', collaborations: [] });
		const service = new TaskService(prismaMock);

		const result = await service.updateStatus('task-1', 'COMPLETED');

		expect(prismaMock.task.update).toHaveBeenCalledWith({
			where: { id: 'task-1' },
			data: { status: 'COMPLETED' },
			include: {
				categories: true,
				collaborations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});
		expect(result).toEqual({ id: 'task-1', status: 'COMPLETED', collaborations: [], assignedUserId: null });
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
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', collaborations: [] });
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
				collaborations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});
		expect(result).toEqual({ id: 'task-1', collaborations: [], assignedUserId: null });
	});

	test('update atualiza campos e substitui categorias', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', projectId: 'project-1' });
		prismaMock.task.update.mockResolvedValue({ id: 'task-1', title: 'Nova task', collaborations: [] });
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
			include: {
				categories: true,
				collaborations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});
		expect(result).toEqual({ id: 'task-1', title: 'Nova task', collaborations: [], assignedUserId: null });
	});

	test('update substitui colaboração quando userId é fornecido', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', projectId: 'project-1' });
		prismaMock.projectMember.findUnique.mockResolvedValue({ id: 'member-1' });
		prismaMock.task.update.mockResolvedValue({
			id: 'task-1',
			status: 'IN_PROGRESS',
			collaborations: [{ userId: 'user-2' }],
		});
		const service = new TaskService(prismaMock);

		const result = await service.update('task-1', {
			title: 'Nova Task',
			description: 'Nova Desc',
			status: 'IN_PROGRESS',
			categoryIds: [],
			userId: 'user-2',
		});

		expect(prismaMock.task.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					collaborations: {
						deleteMany: {},
						create: [{ userId: 'user-2' }],
					},
				}),
			}),
		);
		expect(result).toEqual({
			id: 'task-1',
			status: 'IN_PROGRESS',
			collaborations: [{ userId: 'user-2' }],
			assignedUserId: 'user-2',
		});
	});

	test('update limpa colaboração quando userId é null', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', projectId: 'project-1' });
		prismaMock.task.update.mockResolvedValue({ id: 'task-1', collaborations: [] });
		const service = new TaskService(prismaMock);

		await service.update('task-1', {
			title: 'Nova Task',
			description: 'Nova Desc',
			status: 'IN_PROGRESS',
			categoryIds: [],
			userId: null,
		});

		expect(prismaMock.task.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					collaborations: {
						deleteMany: {},
					},
				}),
			}),
		);
	});

	test('update lança erro quando usuário informado não é membro do projeto', async () => {
		prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', projectId: 'project-1' });
		prismaMock.projectMember.findUnique.mockResolvedValue(null);
		const service = new TaskService(prismaMock);

		await expect(
			service.update('task-1', {
				title: 'Nova Task',
				description: 'Nova Desc',
				status: 'IN_PROGRESS',
				categoryIds: [],
				userId: 'user-2',
			}),
		).rejects.toThrow('Usuário informado não é membro do projeto.');
	});

	test('delete lança erro quando a tarefa não existe', async () => {
		prismaMock.task.findUnique.mockResolvedValue(null);
		const service = new TaskService(prismaMock);

		await expect(service.delete('task-inexistente')).rejects.toThrow('Tarefa não encontrada.');
		expect(prismaMock.task.delete).not.toHaveBeenCalled();
	});
});