import express from "express";
import jwt from "jsonwebtoken";
import { login, cerraSesion } from "../controllers/authController.mjs";
import { validarLogin } from "../middlewares/validaciones/validacionesLogin.mjs";
import Sesion from "../models/sesion.mjs";
import { sendResponse, StatusCodes } from "../helpers/statusCode.mjs";

const router = express.Router();
router.post("/login", validarLogin, login);
router.put("/cerrar", cerraSesion);

router.get("/check", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, null, "Token requerido");
  }

  const token = authHeader.split(" ")[1];

  // Validar que existe el token
  if (!token) {
    return sendResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      null,
      "Token mal formado"
    );
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Token válido - verificar si existe sesión activa (opcional)
    const sesionActiva = await Sesion.findOne({
      where: {
        id_usuario: decoded.id,
        token,
        estado: 1,
      },
    });

    if (!sesionActiva) {
      return sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        null,
        "Sesión no encontrada o inactiva"
      );
    }

    // Todo correcto
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      {
        userId: decoded.id,
        sessionId: sesionActiva.id,
      },
      "Sesión activa"
    );
  } catch (err) {
    console.error("Error al verificar token:", err.name, err.message);

    // Verificar si el token expiró (CORRECCIÓN IMPORTANTE)
    if (err.name === "TokenExpiredError") {
      try {
        // Decodificar sin verificar para obtener el payload
        const decoded = jwt.decode(token);

        if (decoded?.id) {
          // Actualizar sesión a expirada
          await Sesion.update(
            {
              estado: 0,
              salida: new Date(),
              expira_en: new Date(),
            },
            {
              where: {
                id_usuario: decoded.id,
                token,
                estado: 1, 
              },
            }
          );

          console.log(`Sesión expirada para usuario ${decoded.id}`);
        }

        return sendResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          null,
          "Token expirado. Por favor, inicia sesión nuevamente"
        );
      } catch (updateErr) {
        console.error("Error al actualizar sesión expirada:", updateErr);
        return sendResponse(
          res,
          StatusCodes.INTERNAL_ERROR,
          null,
          "Error al procesar token expirado"
        );
      }
    }

    // Token inválido (firma incorrecta, malformado, etc.)
    if (err.name === "JsonWebTokenError") {
      return sendResponse(res, StatusCodes.FORBIDDEN, null, "Token inválido");
    }

    // Otro error de JWT
    return sendResponse(
      res,
      StatusCodes.FORBIDDEN,
      null,
      "Error al verificar token"
    );
  }
});

export default router;
