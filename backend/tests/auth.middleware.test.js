import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const verifyMock = jest.fn();

await jest.unstable_mockModule('jsonwebtoken', () => ({
	default: {
		verify: verifyMock,
	},
}));

const { withAuth } = await import('../src/middleware/auth.js');

describe('withAuth', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.JWT_SECRET = 'test-secret';
	});

	test('Retorna 401 quando o token está ausente', async () => {
		const handler = jest.fn();

		const response = await withAuth(handler)({ headers: {} });

		expect(response).toEqual({
			statusCode: 401,
			body: JSON.stringify({
				error: 'Token não fornecido ou inválido.',
			}),
		});
		expect(handler).not.toHaveBeenCalled();
	});

	test('Retorna 401 quando a verificação do token falha', async () => {
		verifyMock.mockImplementation(() => {
			throw new Error('invalid token');
		});

		const handler = jest.fn();

		const response = await withAuth(handler)({
			headers: {
				authorization: 'Bearer invalid-token',
			},
		});

		expect(response).toEqual({
			statusCode: 401,
			body: JSON.stringify({
				error: 'Token inválido ou expirado.',
			}),
		});
		expect(handler).not.toHaveBeenCalled();
	});

	test('Injeta usuário decodificado no requestContext e chama o handler', async () => {
		verifyMock.mockReturnValue({
			sub: 'user-1',
			email: 'user@example.com',
			name: 'User',
		});

		const handler = jest.fn(async (event) => ({
			statusCode: 200,
			body: JSON.stringify(event.requestContext.authorizer.user),
		}));

		const event = {
			headers: {
				Authorization: 'Bearer valid-token',
			},
		};

		const response = await withAuth(handler)(event);

		expect(verifyMock).toHaveBeenCalledWith('valid-token', 'test-secret');
		expect(event.requestContext.authorizer.user).toEqual({
			sub: 'user-1',
			email: 'user@example.com',
			name: 'User',
			userId: 'user-1',
		});
		expect(handler).toHaveBeenCalledWith(event);
		expect(response).toEqual({
			statusCode: 200,
			body: JSON.stringify({
				sub: 'user-1',
				email: 'user@example.com',
				name: 'User',
				userId: 'user-1',
			}),
		});
	});
});