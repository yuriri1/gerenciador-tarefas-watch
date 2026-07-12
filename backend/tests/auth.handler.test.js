import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const controllerMock = {
	register: jest.fn(),
	login: jest.fn(),
};

await jest.unstable_mockModule('../src/functions/auth/controller.js', () => ({
	AuthController: class AuthController {
		register(...args) {
			return controllerMock.register(...args);
		}

		login(...args) {
			return controllerMock.login(...args);
		}
	},
}));

const { register, login } = await import('../src/functions/auth/handler.js');

describe('auth handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('Registro formata o corpo da requisição e retorna resposta adequada', async () => {
		controllerMock.register.mockResolvedValue({
			statusCode: 201,
			body: { message: 'ok' },
		});

		const response = await register({
			body: JSON.stringify({
				name: 'Ana',
				email: 'ana@example.com',
				password: '123456',
			}),
		});

		expect(controllerMock.register).toHaveBeenCalledWith({
			name: 'Ana',
			email: 'ana@example.com',
			password: '123456',
		});
		expect(response).toEqual({
			statusCode: 201,
			body: JSON.stringify({ message: 'ok' }),
		});
	});

	test('Login formata o corpo da requisição e retorna resposta adequada', async () => {
		controllerMock.login.mockResolvedValue({
			statusCode: 200,
			body: { message: 'ok' },
		});

		const response = await login({
			body: JSON.stringify({
				email: 'ana@example.com',
				password: '123456',
			}),
		});

		expect(controllerMock.login).toHaveBeenCalledWith({
			email: 'ana@example.com',
			password: '123456',
		});
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({ message: 'ok' }),
		});
	});

	test('Login retorna 400 quando o corpo é JSON inválido', async () => {
		const response = await login({ body: '{invalid-json' });

		expect(response).toEqual({
			statusCode: 400,
			body: JSON.stringify({
				message: 'Corpo da requisição inválido.',
			}),
		});
		expect(controllerMock.login).not.toHaveBeenCalled();
	});
});