import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const prismaMock = {
	user: {
		findUnique: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
};

const bcryptMock = {
	hash: jest.fn(),
	compare: jest.fn(),
};

const jwtMock = {
	sign: jest.fn(),
};

await jest.unstable_mockModule('../src/config/prisma.js', () => ({
	default: prismaMock,
	prisma: prismaMock,
}));

await jest.unstable_mockModule('bcryptjs', () => ({
	default: bcryptMock,
}));

await jest.unstable_mockModule('jsonwebtoken', () => ({
	default: jwtMock,
}));

const { AuthService } = await import('../src/functions/auth/service.js');

describe('AuthService', () => {
	let service;

	beforeEach(() => {
		service = new AuthService(prismaMock);
		jest.clearAllMocks();
		process.env.JWT_SECRET = 'test-secret';
	});

	test('Registro faz hash da senha e cria um novo usuário', async () => {
		prismaMock.user.findUnique.mockResolvedValue(null);
		bcryptMock.hash.mockResolvedValue('hashed-password');
		prismaMock.user.create.mockResolvedValue({
			id: 'user-1',
			name: 'ana silva',
			email: 'ana@example.com',
		});

		const result = await service.register({
			name: 'Ana Silva',
			email: 'ANA@EXAMPLE.COM',
			password: '123456',
		});

		expect(bcryptMock.hash).toHaveBeenCalledWith('123456', 10);
		expect(prismaMock.user.create).toHaveBeenCalledWith({
			data: {
				name: 'ana silva',
				email: 'ana@example.com',
				password: 'hashed-password',
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});
		expect(result).toEqual({
			id: 'user-1',
			name: 'ana silva',
			email: 'ana@example.com',
		});
	});

	test('Registro rejeita quando o email já existe', async () => {
		prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });

		await expect(
			service.register({
				name: 'Ana',
				email: 'ana@example.com',
				password: '123456',
			})
		).rejects.toMatchObject({
			message: 'EMAIL_ALREADY_EXISTS',
			statusCode: 400,
		});
	});

	test('Login retorna token e usuário seguro quando credenciais são válidas', async () => {
		prismaMock.user.findUnique.mockResolvedValue({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
			password: 'hashed-password',
		});
		bcryptMock.compare.mockResolvedValue(true);
		jwtMock.sign.mockReturnValue('jwt-token');

		const result = await service.login({
			email: 'ana@example.com',
			password: '123456',
		});

		expect(bcryptMock.compare).toHaveBeenCalledWith('123456', 'hashed-password');
		expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
			where: { email: 'ana@example.com' },
			select: {
				id: true,
				name: true,
				email: true,
				password: true,
			},
		});
		expect(jwtMock.sign).toHaveBeenCalledWith(
			{
				sub: 'user-1',
				userId: 'user-1',
				email: 'ana@example.com',
				name: 'Ana',
			},
			'test-secret',
			{ expiresIn: '8h' }
		);
		expect(result).toEqual({
			user: {
				id: 'user-1',
				name: 'Ana',
				email: 'ana@example.com',
			},
			token: 'jwt-token',
		});
	});

	test('Login rejeita credenciais inválidas', async () => {
		prismaMock.user.findUnique.mockResolvedValue({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
			password: 'hashed-password',
		});
		bcryptMock.compare.mockResolvedValue(false);

		await expect(
			service.login({
				email: 'ana@example.com',
				password: 'wrong',
			})
		).rejects.toMatchObject({
			message: 'INVALID_CREDENTIALS',
			statusCode: 401,
		});
	});

	test('getProfile retorna os dados públicos do usuário', async () => {
		prismaMock.user.findUnique.mockResolvedValue({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-02T00:00:00.000Z'),
		});

		const result = await service.getProfile('user-1');

		expect(result).toMatchObject({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
		});
	});

	test('updateProfile atualiza nome e email', async () => {
		prismaMock.user.findUnique
			.mockResolvedValueOnce({ id: 'user-1', email: 'ana@example.com' })
			.mockResolvedValueOnce(null);
		prismaMock.user.update.mockResolvedValue({
			id: 'user-1',
			name: 'ana silva',
			email: 'ana.silva@example.com',
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-03T00:00:00.000Z'),
		});

		const result = await service.updateProfile('user-1', {
			name: 'Ana Silva',
			email: 'ANA.SILVA@EXAMPLE.COM',
		});

		expect(prismaMock.user.update).toHaveBeenCalledWith({
			where: { id: 'user-1' },
			data: {
				name: 'ana silva',
				email: 'ana.silva@example.com',
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		expect(result).toMatchObject({
			id: 'user-1',
			name: 'ana silva',
			email: 'ana.silva@example.com',
		});
	});
});