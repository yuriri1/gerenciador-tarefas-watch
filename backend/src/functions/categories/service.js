import prisma from '../../config/prisma.js';

export class CategoryService {
	constructor(database = prisma) {
		this.prisma = database;
	}

	async create({ name, color }) {
		return this.prisma.category.create({
			data: {
				name,
				color,
			},
		});
	}

	async listAll() {
		return this.prisma.category.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async delete(categoryId) {
		const category = await this.prisma.category.findUnique({
			where: {
				id: categoryId,
			},
			select: {
				id: true,
			},
		});

		if (!category) {
			throw new Error('Categoria não encontrada.');
		}

		return this.prisma.category.delete({
			where: {
				id: categoryId,
			},
		});
	}
}