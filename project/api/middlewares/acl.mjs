import jwt from "jsonwebtoken";
import ACL from "../config/aclConfig.mjs";
import { sendResponse, StatusCodes } from "../helpers/statusCode.mjs";

export const verificarACL = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return  sendResponse(res, StatusCodes.UNAUTHORIZED, null, "Token Requerido.");

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.usuario = payload;

    const ruta = req.baseUrl;
    const metodo = req.method;

    const permisosRuta = ACL[ruta];
    const rolesPermitidos = permisosRuta?.[metodo] || [];

    if (!rolesPermitidos.includes(payload.rol)) {
      return sendResponse(res, StatusCodes.FORBIDDEN, null, 'Acceso denegado: No tienes los permisos requeridos.')
    }

    next();
  } catch (error) {
    return sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      null,
      "Token Invalid0 o expirado."
    );
  }
};
