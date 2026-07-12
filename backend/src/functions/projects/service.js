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
}