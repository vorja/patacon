import jwt from "jsonwebtoken";
import ACL from "../config/aclConfig.mjs";
import { sendResponse, StatusCodes } from "../helpers/statusCode.mjs";

export const verificarACL = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verificar si existe el encabezado de autorización
  if (!authHeader) {
    return sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      null,
      "Acceso denegado: Se requiere encabezado de autorización (Authorization header)."
    );
  }

  // Verificar formato del token (Bearer token)
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      null,
      "Formato de token inválido. Use: 'Bearer [token]'."
    );
  }

  const token = parts[1];
  if (!token) {
    return sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      null,
      "Token no proporcionado después de 'Bearer'."
    );
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.usuario = payload;

    // Verificar que el payload tenga rol
    if (!payload.rol) {
      return sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        null,
        "Token inválido: El token no contiene información de rol de usuario."
      );
    }

    const ruta = req.baseUrl || req.path;
    const metodo = req.method;

    // Verificar si la ruta está definida en ACL
    const permisosRuta = ACL[ruta];
    if (!permisosRuta) {
      console.warn(`⚠️  Ruta no configurada en ACL: ${ruta}`);
      return sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        null,
        `Acceso denegado: La ruta '${ruta}' no tiene permisos configurados.`
      );
    }

    // Obtener roles permitidos para el método
    const rolesPermitidos = permisosRuta[metodo] || [];
    if (rolesPermitidos.length === 0) {
      return sendResponse(
        res,
        StatusCodes.METHOD_NOT_ALLOWED,
        null,
        `Acceso denegado: El método ${metodo} no está permitido para la ruta ${ruta}.`
      );
    }

    // Verificar si el rol del usuario está autorizado
    if (!rolesPermitidos.includes(payload.rol)) {
      return sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        null,
        `Acceso denegado: Rol '${payload.rol}' no tiene permiso para ${metodo} en ${ruta}. ` +
          `Roles permitidos: ${rolesPermitidos.join(", ")}.`
      );
    }

    next();
  } catch (error) {
    let mensaje = "Error de autenticación";

    if (error.name === "JsonWebTokenError") {
      mensaje = "Token inválido: Formato o firma incorrecta.";
    } else if (error.name === "TokenExpiredError") {
      mensaje = `Token expirado: ${error.expiredAt}.`;
    } else if (error.name === "NotBeforeError") {
      mensaje = `Token no válido aún: ${error.date}.`;
    } else if (error.message.includes("secret")) {
      mensaje = "Error de configuración: SECRET_KEY no válida o no definida.";
    } else {
      mensaje = `Error de verificación: ${error.message}`;
    }

    console.error(`❌ Error ACL: ${error.name} - ${error.message}`);

    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, mensaje);
  }
};
