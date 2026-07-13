import { AuthController } from './controller.js';
import { withAuth } from '../../middleware/auth.js';

const authController = new AuthController();

function parseBody(event) {
  if (!event || event.body == null) {
    return {};
  }

  if (typeof event.body === 'object') {
    return event.body;
  }

  if (typeof event.body !== 'string') {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

function formatResponse(result) {
  return {
    statusCode: result.statusCode,
    body: JSON.stringify(result.body),
  };
}

async function execute(action, event) {
  const body = parseBody(event);

  if (body === null) {
    return formatResponse({
      statusCode: 400,
      body: { message: 'Corpo da requisição inválido.' },
    });
  }

  const response = await authController[action](body);
  return formatResponse(response);
}

export async function register(event) {
  try {
    return await execute('register', event);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
}

export async function login(event) {
  try {
    return await execute('login', event);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
}

export const profile = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;

    if (!userId) {
      return formatResponse({
        statusCode: 401,
        body: { message: 'Usuário não autenticado.' },
      });
    }

    const response = await authController.getProfile(userId);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const updateProfile = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const body = parseBody(event);

    if (!userId) {
      return formatResponse({
        statusCode: 401,
        body: { message: 'Usuário não autenticado.' },
      });
    }

    if (body === null) {
      return formatResponse({
        statusCode: 400,
        body: { message: 'Corpo da requisição inválido.' },
      });
    }

    const response = await authController.updateProfile(userId, body);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});