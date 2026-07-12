import { AuthService } from './service.js';

function buildResponse(statusCode, body) {
  return {
    statusCode,
    body,
  };
}

function getMissingFields(payload, requiredFields) {
  return requiredFields.filter((field) => !payload?.[field]);
}

function normalizeError(error) {
  if (error?.message === 'EMAIL_ALREADY_EXISTS') {
    return buildResponse(400, { message: 'E-mail já cadastrado.' });
  }

  if (error?.message === 'INVALID_CREDENTIALS') {
    return buildResponse(401, { message: 'Credenciais inválidas.' });
  }

  if (error?.message === 'JWT_SECRET_NOT_DEFINED') {
    return buildResponse(500, { message: 'JWT_SECRET não definido.' });
  }

  return buildResponse(error?.statusCode || 500, {
    message: error?.message || 'Erro interno do servidor.',
  });
}

export class AuthController {
  constructor(service = new AuthService()) {
    this.service = service;
  }

  async register(payload = {}) {
    try {
      const missingFields = getMissingFields(payload, ['name', 'email', 'password']);

      if (missingFields.length > 0) {
        return buildResponse(400, {
          message: 'Campos obrigatórios ausentes.',
          missingFields,
        });
      }

      const user = await this.service.register(payload);

      return buildResponse(201, {
        message: 'Usuário cadastrado com sucesso.',
        user,
      });
    } catch (error) {
      return normalizeError(error);
    }
  }

  async login(payload = {}) {
    try {
      const missingFields = getMissingFields(payload, ['email', 'password']);

      if (missingFields.length > 0) {
        return buildResponse(400, {
          message: 'Campos obrigatórios ausentes.',
          missingFields,
        });
      }

      const result = await this.service.login(payload);

      return buildResponse(200, {
        message: 'Login realizado com sucesso.',
        ...result,
      });
    } catch (error) {
      return normalizeError(error);
    }
  }
}