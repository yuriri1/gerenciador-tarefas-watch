import { ProjectController } from './controller.js';
import { withAuth } from '../../middleware/auth.js';

const projectController = new ProjectController();

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

    const response = await projectController.handleCreate(userId, body);
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

    if (!userId) {
      return formatResponse({
        statusCode: 401,
        body: { message: 'Usuário não autenticado.' },
      });
    }

    const response = await projectController.handleList(userId);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const update = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const projectId = event?.pathParameters?.id;
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

    if (!projectId) {
      return formatResponse({
        statusCode: 400,
        body: { message: 'O parâmetro id é obrigatório.' },
      });
    }

    const response = await projectController.handleUpdate(projectId, userId, body);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const remove = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const projectId = event?.pathParameters?.id;

    if (!userId) {
      return formatResponse({
        statusCode: 401,
        body: { message: 'Usuário não autenticado.' },
      });
    }

    if (!projectId) {
      return formatResponse({
        statusCode: 400,
        body: { message: 'O parâmetro id é obrigatório.' },
      });
    }

    const response = await projectController.handleDelete(projectId, userId);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});

export const addMember = withAuth(async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.user?.userId;
    const projectId = event?.pathParameters?.id;
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

    if (!projectId) {
      return formatResponse({
        statusCode: 400,
        body: { message: 'O parâmetro id é obrigatório.' },
      });
    }

    const response = await projectController.handleAddMember(projectId, userId, body);
    return formatResponse(response);
  } catch {
    return formatResponse({
      statusCode: 500,
      body: { message: 'Erro interno do servidor.' },
    });
  }
});