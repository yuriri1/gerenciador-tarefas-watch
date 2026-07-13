import { beforeEach, describe, expect, jest, test } from '@jest/globals';

describe('CategoryService', () => {
	let prismaMock;
	let CategoryService;

	beforeEach(async () => {
		jest.resetModules();
		prismaMock = {
			category: {
				create: jest.fn(),
				findMany: jest.fn(),
				findUnique: jest.fn(),
				delete: jest.fn(),
			},
		};

		await jest.unstable_mockModule('../src/config/prisma.js', () => ({
			default: prismaMock,
			prisma: prismaMock,
		}));

		({ CategoryService } = await import('../src/functions/categories/service.js'));
	});

	test('create cria categoria global com name e color', async () => {
		prismaMock.category.create.mockResolvedValue({ id: 'cat-1' });
		const service = new CategoryService(prismaMock);

		const result = await service.create({ name: 'Urgente', color: '#FF0000' });

		expect(prismaMock.category.create).toHaveBeenCalledWith({
			data: {
				name: 'urgente',
				color: '#FF0000',
			},
		});
		expect(result).toEqual({ id: 'cat-1' });
	});

	test('listAll retorna categorias ordenadas por createdAt desc', async () => {
		prismaMock.category.findMany.mockResolvedValue([{ id: 'cat-1' }]);
		const service = new CategoryService(prismaMock);

		const result = await service.listAll();

		expect(prismaMock.category.findMany).toHaveBeenCalledWith({
			orderBy: {
				createdAt: 'desc',
			},
		});
		expect(result).toEqual([{ id: 'cat-1' }]);
	});

	test('delete remove categoria quando id existe', async () => {
		prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1' });
		prismaMock.category.delete.mockResolvedValue({ id: 'cat-1' });
		const service = new CategoryService(prismaMock);

		const result = await service.delete('cat-1');

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: {
				id: 'cat-1',
			},
			select: {
				id: true,
			},
		});
		expect(prismaMock.category.delete).toHaveBeenCalledWith({
			where: {
				id: 'cat-1',
			},
		});
		expect(result).toEqual({ id: 'cat-1' });
	});

	test('delete lança erro quando categoria não existe', async () => {
		prismaMock.category.findUnique.mockResolvedValue(null);
		const service = new CategoryService(prismaMock);

		await expect(service.delete('cat-404')).rejects.toThrow('Categoria não encontrada.');
		expect(prismaMock.category.delete).not.toHaveBeenCalled();
	});
});