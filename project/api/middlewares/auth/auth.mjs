import jwt from "jsonwebtoken";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return  sendResponse(res, StatusCodes.UNAUTHORIZED, null, "Token no proporcionado");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; //
    next();
  } catch (err) {
    return  sendResponse(res, StatusCodes.FORBIDDEN, null,'Token Inválido.' )
  }
};

