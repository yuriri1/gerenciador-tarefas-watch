import { beforeEach, describe, expect, jest, test } from '@jest/globals';

await jest.unstable_mockModule('../src/functions/auth/service.js', () => ({
	AuthService: class AuthService {},
}));

const { AuthController } = await import('../src/functions/auth/controller.js');

describe('AuthController', () => {
	let service;
	let controller;

	beforeEach(() => {
		service = {
			register: jest.fn(),
			login: jest.fn(),
			getProfile: jest.fn(),
			updateProfile: jest.fn(),
		};
		controller = new AuthController(service);
		jest.clearAllMocks();
	});

	test("Registro retorna 400 quando campos obrigatórios estão ausentes", async () => {
		const response = await controller.register({ email: 'ana@example.com' });

		expect(response).toEqual({
			statusCode: 400,
			body: {
				message: 'Campos obrigatórios ausentes.',
				missingFields: ['name', 'password'],
			},
		});
		expect(service.register).not.toHaveBeenCalled();
	});

	test("Registro retorna 201 quando usuário é criado", async () => {
		service.register.mockResolvedValue({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
		});

		const response = await controller.register({
			name: 'Ana',
			email: 'ana@example.com',
			password: '123456',
		});

		expect(service.register).toHaveBeenCalledWith({
			name: 'Ana',
			email: 'ana@example.com',
			password: '123456',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: {
				message: 'Usuário cadastrado com sucesso.',
				user: {
					id: 'user-1',
					name: 'Ana',
					email: 'ana@example.com',
				},
			},
		});
	});

	test("Login retorna 200 quando credenciais são válidas", async () => {
		service.login.mockResolvedValue({
			user: {
				id: 'user-1',
				name: 'Ana',
				email: 'ana@example.com',
			},
			token: 'jwt-token',
		});

		const response = await controller.login({
			email: 'ana@example.com',
			password: '123456',
		});

		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Login realizado com sucesso.',
				user: {
					id: 'user-1',
					name: 'Ana',
					email: 'ana@example.com',
				},
				token: 'jwt-token',
			},
		});
	});

	test('getProfile retorna 200 com os dados do usuário', async () => {
		service.getProfile.mockResolvedValue({
			id: 'user-1',
			name: 'Ana',
			email: 'ana@example.com',
		});

		const response = await controller.getProfile('user-1');

		expect(response).toEqual({
			statusCode: 200,
			body: {
				user: {
					id: 'user-1',
					name: 'Ana',
					email: 'ana@example.com',
				},
			},
		});
	});

	test('updateProfile retorna 200 quando o perfil é atualizado', async () => {
		service.updateProfile.mockResolvedValue({
			id: 'user-1',
			name: 'Ana Silva',
			email: 'ana.silva@example.com',
		});

		const response = await controller.updateProfile('user-1', {
			name: 'Ana Silva',
			email: 'ana.silva@example.com',
		});

		expect(service.updateProfile).toHaveBeenCalledWith('user-1', {
			name: 'Ana Silva',
			email: 'ana.silva@example.com',
		});
		expect(response).toEqual({
			statusCode: 200,
			body: {
				message: 'Perfil atualizado com sucesso.',
				user: {
					id: 'user-1',
					name: 'Ana Silva',
					email: 'ana.silva@example.com',
				},
			},
		});
	});
});