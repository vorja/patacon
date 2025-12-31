import Sesion from "../models/sesion.mjs";
import jwt from "jsonwebtoken";
import { autenticarUsuario } from "../services/authService.mjs";
import { crearSesion } from "../services/sesionService.mjs";
import { sendResponse, StatusCodes } from "../helpers/statusCode.mjs";

import useragent from "useragent";
// Iniciar sesión
export const login = async (req, res) => {
  const { user_name, password } = req.body;

  let roles = [
    "Desgajador",
    "Cortador",
    "Fritador",
    "Pelador",
    "Produccion",
    "Termometrista",
    "Empacador",
  ];

  try {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.connection.remoteAddress;
    const agent = useragent.parse(req.headers["user-agent"]);

    const deviceInfo = {
      ip: ip.replace(/^::ffff:/, ""),
      browser: agent.toAgent(),
      os: agent.os.toString(),
      device: agent.device.toString(),
    };
    let modulo;

    const { id, rol, nombre } = await autenticarUsuario(user_name, password);

    if (!id || !rol || !nombre) {
      return sendResponse(
        res,
        StatusCodes.VALIDATION_ERROR,
        null,
        "Credenciales Invalidas."
      );
    }

    if (!roles.includes(rol)) {
      modulo = "administrativo";
    } else {
      modulo = "produccion";
    }
    const token = await crearSesion(id, nombre, rol, deviceInfo);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      {
        token,
        modulo,
        usuario: { rol, nombre },
      },
      "Usuario Valido."
    );
  } catch (error) {
    console.log("Error", error);

    return sendResponse(res, StatusCodes.INTERNAL_ERROR, null, `${error}`);
  }
};

export const cerraSesion = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        null,
        "Token no proporcionado"
      );
    }

    const token = authHeader.split(" ")[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const id_usuario = decoded.id;

    const session = await Sesion.findOne({
      where: {
        id_usuario,
        estado: true,
      },
      order: [["creado_en", "DESC"]],
    });

    if (!session) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        null,
        "Sesión activa no encontrada"
      );
    }

    session.estado = false;
    session.salida = new Date();
    await session.save();

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      null,
      "Sesión Cerrada correctamente."
    );
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_ERROR,
      null,
      "error al cerrar la sesión."
    );
  }
};
