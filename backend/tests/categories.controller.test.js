import { beforeEach, describe, expect, jest, test } from '@jest/globals';

await jest.unstable_mockModule('../src/functions/categories/service.js', () => ({
	CategoryService: class CategoryService {},
}));

const { CategoryController } = await import('../src/functions/categories/controller.js');

describe('CategoryController', () => {
	let service;
	let controller;

	beforeEach(() => {
		service = {
			create: jest.fn(),
			listAll: jest.fn(),
			delete: jest.fn(),
		};
		controller = new CategoryController(service);
		jest.clearAllMocks();
	});

	test('handleCreate retorna 400 quando name está faltando', async () => {
		const response = await controller.handleCreate({ color: '#FFFFFF' });

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'O campo name é obrigatório.',
			},
		});
		expect(service.create).not.toHaveBeenCalled();
	});

	test('handleCreate retorna 400 quando color está faltando', async () => {
		const response = await controller.handleCreate({ name: 'Urgente' });

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'O campo color é obrigatório.',
			},
		});
		expect(service.create).not.toHaveBeenCalled();
	});

	test('handleCreate formata dados e retorna 201', async () => {
		service.create.mockResolvedValue({ id: 'cat-1', name: 'Urgente', color: '#FF0000' });

		const response = await controller.handleCreate({
			name: ' Urgente ',
			color: ' #FF0000 ',
		});

		expect(service.create).toHaveBeenCalledWith({
			name: 'Urgente',
			color: '#FF0000',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: {
				message: 'Categoria criada com sucesso.',
				category: { id: 'cat-1', name: 'Urgente', color: '#FF0000' },
			},
		});
	});

	test('handleList retorna categorias com status 200', async () => {
		service.listAll.mockResolvedValue([{ id: 'cat-1' }]);

		const response = await controller.handleList();

		expect(service.listAll).toHaveBeenCalled();
		expect(response).toEqual({
			statusCode: 200,
			body: {
				categories: [{ id: 'cat-1' }],
			},
		});
	});

	test('handleDelete retorna 404 quando categoria não existe', async () => {
		service.delete.mockRejectedValue(new Error('Categoria não encontrada.'));

		const response = await controller.handleDelete('cat-404');

		expect(response).toEqual({
			statusCode: 404,
			body: {
				message: 'Categoria não encontrada.',
			},
		});
	});

	test('handleDelete retorna 200 quando categoria é removida', async () => {
		service.delete.mockResolvedValue({ id: 'cat-1' });

		const response = await controller.handleDelete('cat-1');

		expect(service.delete).toHaveBeenCalledWith('cat-1');
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Categoria excluída com sucesso.',
				category: { id: 'cat-1' },
			},
		});
	});
});