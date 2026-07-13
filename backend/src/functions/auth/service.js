import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import {
  normalizeLowercaseString,
} from '../../utils/text.js';

function createAuthError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class AuthService {
  constructor(database = prisma) {
    this.prisma = database;
  }

  async getProfile(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createAuthError('USER_NOT_FOUND', 404);
    }

    return user;
  }

  async updateProfile(userId, { name, email }) {
    const normalizedEmail = normalizeLowercaseString(email);
    const normalizedName = normalizeLowercaseString(name);

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw createAuthError('USER_NOT_FOUND', 404);
    }

    if (normalizedEmail && normalizedEmail !== currentUser.email?.toLowerCase()) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== userId) {
        throw createAuthError('EMAIL_ALREADY_EXISTS', 400);
      }
    }

    const data = {};

    if (typeof normalizedName === 'string') {
      data.name = normalizedName;
    }

    if (typeof normalizedEmail === 'string') {
      data.email = normalizedEmail;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async register({ name, email, password }) {
    const normalizedEmail = normalizeLowercaseString(email);
    const normalizedName = normalizeLowercaseString(name);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw createAuthError('EMAIL_ALREADY_EXISTS', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  }

  async login({ email, password }) {
    const normalizedEmail = normalizeLowercaseString(email);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw createAuthError('INVALID_CREDENTIALS', 401);
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw createAuthError('INVALID_CREDENTIALS', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw createAuthError('JWT_SECRET_NOT_DEFINED', 500);
    }

    const token = jwt.sign(
      {
        sub: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    const { password: _password, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }
}