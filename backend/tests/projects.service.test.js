import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('ProjectService', () => {
	let prismaMock;
	let ProjectService;

	beforeEach(async () => {
		jest.resetModules();
		prismaMock = {
			$transaction: jest.fn(),
			project: {
				findMany: jest.fn(),
			},
		};

		await jest.unstable_mockModule('../src/config/prisma.js', () => ({
			default: prismaMock,
			prisma: prismaMock,
		}));

		({ ProjectService } = await import('../src/functions/projects/service.js'));
	});

	test('create usa uma transação e cria o criador como membro', async () => {
		const transaction = {
			project: {
				create: jest.fn().mockResolvedValue({ id: 'project-1', name: 'Project' }),
			},
			projectMember: {
				create: jest.fn().mockResolvedValue({}),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) => callback(transaction));

		const service = new ProjectService(prismaMock);
		const result = await service.create('user-1', {
			name: 'Project',
			description: 'Description',
		});

		expect(transaction.project.create).toHaveBeenCalledWith({
			data: {
				name: 'Project',
				description: 'Description',
				creatorId: 'user-1',
			},
		});
		expect(transaction.projectMember.create).toHaveBeenCalledWith({
			data: {
				projectId: 'project-1',
				userId: 'user-1',
			},
		});
		expect(result).toEqual({ id: 'project-1', name: 'Project' });
	});

	test('listAllFromUser retorna projetos onde o usuário é criador ou membro', async () => {
		prismaMock.project.findMany.mockResolvedValue([{ id: 'project-1' }]);
		const service = new ProjectService(prismaMock);

		const result = await service.listAllFromUser('user-1');

		expect(prismaMock.project.findMany).toHaveBeenCalledWith({
			where: {
				OR: [{ creatorId: 'user-1' }, { members: { some: { userId: 'user-1' } } }],
			},
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				members: {
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
		expect(result).toEqual([{ id: 'project-1' }]);
	});
});