import prisma from '../../config/prisma.js';
import {
	normalizeLowercaseString,
	normalizeNullableLowercaseString,
} from '../../utils/text.js';

export class TaskService {
	constructor(database = prisma) {
		this.prisma = database;
	}

	async create(userId, { title, description, projectId, categoryIds }) {
		const project = await this.prisma.project.findUnique({
			where: {
				id: projectId,
			},
			select: {
				id: true,
			},
		});

		if (!project) {
			throw new Error('Projeto não encontrado.');
		}

		const categories =
			Array.isArray(categoryIds) && categoryIds.length > 0
				? {
					connect: categoryIds.map((id) => ({ id })),
				}
				: undefined;

		return this.prisma.task.create({
			data: {
				title: normalizeLowercaseString(title),
				description: normalizeNullableLowercaseString(description),
				project: {
					connect: {
						id: projectId,
					},
				},
				creator: {
					connect: {
						id: userId,
					},
				},
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

	async getById(taskId) {
		return this.prisma.task.findUnique({
			where: {
				id: taskId,
			},
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
	}

	async updateStatus(taskId, status) {
		const task = await this.prisma.task.findUnique({
			where: {
				id: taskId,
			},
			select: {
				id: true,
			},
		});

		if (!task) {
			throw new Error('Tarefa não encontrada.');
		}

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

	async update(taskId, { title, description, status, categoryIds }) {
		const task = await this.prisma.task.findUnique({
			where: {
				id: taskId,
			},
			select: {
				id: true,
			},
		});

		if (!task) {
			throw new Error('Tarefa não encontrada.');
		}

		const data = {
			title: normalizeLowercaseString(title),
			status,
		};

		if (description !== undefined) {
			data.description = normalizeNullableLowercaseString(description);
		}

		if (Array.isArray(categoryIds)) {
			data.categories = {
				set: categoryIds.map((id) => ({ id })),
			};
		}

		return this.prisma.task.update({
			where: {
				id: taskId,
			},
			data,
			include: {
				categories: true,
			},
		});
	}

	async delete(taskId) {
		const task = await this.prisma.task.findUnique({
			where: {
				id: taskId,
			},
			select: {
				id: true,
			},
		});

		if (!task) {
			throw new Error('Tarefa não encontrada.');
		}

		return this.prisma.task.delete({
			where: {
				id: taskId,
			},
		});
	}
}