import prisma from '../../config/prisma.js';

export class ProjectService {
  constructor(database = prisma) {
    this.prisma = database;
  }

  async create(userId, { name, description }) {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.create({
        data: {
          name,
          description: description || null,
          creatorId: userId,
        },
      });

      await transaction.projectMember.create({
        data: {
          projectId: project.id,
          userId,
        },
      });

      return project;
    });
  }

  async listAllFromUser(userId) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { creatorId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(projectId, userId, { name, description }) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!project) {
      throw new Error('Projeto não encontrado.');
    }

    if (project.creatorId !== userId) {
      throw new Error('Sem permissão para alterar este projeto.');
    }

    const data = {};

    if (typeof name === 'string') {
      data.name = name;
    }

    if (description !== undefined) {
      data.description = description === '' ? null : description;
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
      },
      data,
    });
  }

  async delete(projectId, userId) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!project) {
      throw new Error('Projeto não encontrado.');
    }

    if (project.creatorId !== userId) {
      throw new Error('Sem permissão para excluir este projeto.');
    }

    return this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }
}