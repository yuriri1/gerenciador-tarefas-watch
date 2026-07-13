import prisma from '../../config/prisma.js';
import {
	normalizeLowercaseString,
	normalizeNullableLowercaseString,
} from '../../utils/text.js';

export class TaskService {
	constructor(database = prisma) {
		this.prisma = database;
	}

	mapTaskWithAssignment(task) {
		if (!task) {
			return task;
		}

		const assignedCollaboration = task.collaborations?.[0] || null;

		return {
			...task,
			assignedUserId: assignedCollaboration?.userId || null,
		};
	}

	async create(userId, { title, description, projectId, categoryIds, userId: assignedUserId }) {
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

		if (assignedUserId !== undefined && assignedUserId !== null) {
			const isProjectMember = await this.prisma.projectMember.findUnique({
				where: {
					projectId_userId: {
						projectId,
						userId: assignedUserId,
					},
				},
				select: {
					id: true,
				},
			});

			if (!isProjectMember) {
				throw new Error('Usuário informado não é membro do projeto.');
			}
		}

		const createdTask = await this.prisma.task.create({
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
				...(assignedUserId
					? {
						collaborations: {
							create: [
								{
									userId: assignedUserId,
								},
							],
						},
					}
					: {}),
				...(categories ? { categories } : {}),
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

		return this.mapTaskWithAssignment(createdTask);
	}

	async listByProject(projectId) {
		const tasks = await this.prisma.task.findMany({
			where: {
				projectId,
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
			orderBy: {
				createdAt: 'desc',
			},
		});

		return tasks.map((task) => this.mapTaskWithAssignment(task));
	}

	async getById(taskId) {
		const task = await this.prisma.task.findUnique({
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

		return this.mapTaskWithAssignment(task);
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

		const updatedTask = await this.prisma.task.update({
			where: {
				id: taskId,
			},
			data: {
				status,
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

		return this.mapTaskWithAssignment(updatedTask);
	}

	async update(taskId, { title, description, status, categoryIds, userId }) {
		const task = await this.prisma.task.findUnique({
			where: {
				id: taskId,
			},
			select: {
				id: true,
				projectId: true,
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

		if (userId !== undefined && userId !== null) {
			const isProjectMember = await this.prisma.projectMember.findUnique({
				where: {
					projectId_userId: {
						projectId: task.projectId,
						userId,
					},
				},
				select: {
					id: true,
				},
			});

			if (!isProjectMember) {
				throw new Error('Usuário informado não é membro do projeto.');
			}
		}

		if (userId !== undefined) {
			data.collaborations = userId
				? {
					deleteMany: {},
					create: [
						{
							userId,
						},
					],
				}
				: {
					deleteMany: {},
				};
		}

		const updatedTask = await this.prisma.task.update({
			where: {
				id: taskId,
			},
			data,
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

		return this.mapTaskWithAssignment(updatedTask);
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