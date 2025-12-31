// ============================================
// DEFINICIÓN DE STATUS CODES API-REST
// ============================================

export const StatusCodes = {
  SUCCESS: {
    code: 200,
    type: "success",
    message: "Operación exitosa",
  },
  CREATED: {
    code: 201,
    type: "success",
    message: "Recurso creado exitosamente",
  },
  UPDATED: {
    code: 200,
    type: "success",
    message: "Recurso actualizado exitosamente",
  },
  DELETED: {
    code: 200,
    type: "success",
    message: "Recurso eliminado exitosamente",
  },
  NO_CONTENT: {
    code: 204,
    type: "success",
    message: "Operación exitosa sin contenido",
  },

  BAD_REQUEST: {
    code: 400,
    type: "error",
    message: "Solicitud incorrecta",
  },
  VALIDATION_ERROR: {
    code: 422,
    type: "error",
    message: "Error de validación en los datos",
  },
  UNAUTHORIZED: {
    code: 401,
    type: "error",
    message: "No autorizado. Debes iniciar sesión",
  },
  
  FORBIDDEN: {
    code: 403,
    type: "error",
    message: "No tienes permisos para realizar esta acción",
  },
  NOT_FOUND: {
    code: 404,
    type: "error",
    message: "Recurso no encontrado",
  },
  CONFLICT: {
    code: 409,
    type: "error",
    message: "El recurso ya existe",
  },
  TOO_MANY_REQUESTS: {
    code: 429,
    type: "warning",
    message: "Demasiadas solicitudes. Intenta más tarde",
  },

  INTERNAL_ERROR: {
    code: 500,
    type: "error",
    message: "Error interno del servidor",
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    type: "error",
    message: "Servicio no disponible temporalmente",
  },
  DATABASE_ERROR: {
    code: 500,
    type: "error",
    message: "Error de base de datos",
  },
};

// ============================================
// CLASE DE RESPUESTA API
// ============================================

export class ApiResponse {
  constructor(status, data = null, customMessage = null, errors = null) {
    this.success = status.code < 400;
    this.statusCode = status.code;
    this.type = status.type;
    this.message = customMessage || status.message;

    if (data !== null) {
      this.data = data;
    }

    if (errors !== null) {
      this.errors = errors;
    }

    this.timestamp = new Date().toUTCString();
  }
}

export const sendResponse = (
  res,
  status,
  data = null,
  customMessage = null,
  errors = null
) => {
  const response = new ApiResponse(status, data, customMessage, errors);
  return res.status(status.code).json(response);
};

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Error de validación de Mongoose/Joi
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendResponse(res, StatusCodes.VALIDATION_ERROR, null, null, errors);
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, "Token inválido");
  }

  // Error de duplicado (MongoDB)
  if (err.code === 11000) {
    return sendResponse(
      res,
      StatusCodes.CONFLICT,
      null,
      "El registro ya existe"
    );
  }

  // Error genérico
  return sendResponse(
    res,
    StatusCodes.INTERNAL_ERROR,
    null,
    process.env.NODE_ENV === "development" ? err.message : undefined
  );
};