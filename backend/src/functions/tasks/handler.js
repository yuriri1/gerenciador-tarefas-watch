import { TaskController } from './controller.js';
import { withAuth } from '../../middleware/auth.js';

const taskController = new TaskController();

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

export const create = withAuth(async (event) => {
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

    const response = await taskController.handleCreate(userId, body);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const list = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const projectId = event?.pathParameters?.projectId;

    if (!userId) {
      return formatResponse({
        statusCode: 401,
        body: { message: 'Usuário não autenticado.' },
      });
    }

    const response = await taskController.handleListByProject(projectId);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const updateStatus = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const taskId = event?.pathParameters?.id;
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

    if (!taskId) {
      return formatResponse({
        statusCode: 400,
        body: { message: 'O parâmetro id é obrigatório.' },
      });
    }

    const response = await taskController.handleUpdateStatus(taskId, body);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});