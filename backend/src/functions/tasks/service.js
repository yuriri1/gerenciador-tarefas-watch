import prisma from '../../config/prisma.js';

export class TaskService {
	constructor(database = prisma) {
		this.prisma = database;
	}

	async create(userId, { title, description, projectId, categoryIds }) {
		const categories =
			Array.isArray(categoryIds) && categoryIds.length > 0
				? {
					connect: categoryIds.map((id) => ({ id })),
				}
				: undefined;

		return this.prisma.task.create({
			data: {
				title,
				description: description || null,
				projectId,
				userId,
				...(categories ? { categories } : {}),
			},
			include: {
				categories: true,
			},
		});
	}

	async listByProject(projectId) {
		return this.prisma.task.findMany({
			where: {
				projectId,
			},
			include: {
				categories: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async updateStatus(taskId, status) {
		return this.prisma.task.update({
			where: {
				id: taskId,
			},
			data: {
				status,
			},
			include: {
				categories: true,
			},
		});
	}
}