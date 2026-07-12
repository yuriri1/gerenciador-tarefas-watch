import jwt from 'jsonwebtoken';

export function withAuth(handler) {
  return async function authWrappedHandler(event) {
    try {
      const headers = event?.headers || {};
      const authorization = headers.authorization || headers.Authorization;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            error: 'Token não fornecido ou inválido.',
          }),
        };
      }

      const token = authorization.slice(7).trim();

      if (!token) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            error: 'Token não fornecido ou inválido.',
          }),
        };
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      event.requestContext = event.requestContext || {};
      event.requestContext.authorizer = {
        user: {
          ...decoded,
          userId: decoded.userId || decoded.sub,
        },
      };

      return await handler(event);
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Token inválido ou expirado.',
        }),
      };
    }
  };
}