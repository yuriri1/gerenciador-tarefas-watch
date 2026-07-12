import { AuthController } from './controller.js';

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