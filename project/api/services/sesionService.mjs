import jwt from "jsonwebtoken";
import Sesion from "../models/sesion.mjs";
import dotenv from "dotenv";
import Usuarios from "../models/usuarios.mjs";

dotenv.config();

export const crearSesion = async (id, nombre, rol, deviceInfo) => {
  try {
    const token = jwt.sign({ id, nombre, rol }, process.env.SECRET_KEY, {
      expiresIn: "6h",
    });
    const expira_en = new Date(Date.now() + 21600000); // 6 hora.

    await Sesion.create({
      id_usuario: id,
      token,
      direccion_ip: deviceInfo.ip,
      browser: deviceInfo.browser,
      so: deviceInfo.os,
      dispositivo: deviceInfo.device,
      expira_en,
    });

    return token;
  } catch (error) {
    console.log("error: ", error.message);
    throw new Error("Error al crear la sesión: ");
  }
};

export const getAllSessions = async () => {
  const lista = await Sesion.findAll({
    include: {
      model: Usuarios,
      as: "usuario",
      attributes: ["user_name"],
    },
  });
  const activos = await Sesion.count({ where: { estado: 1 } });

  const historial = lista.map((op) => ({
    id: op.id,
    Navegador: op.browser,
    Ip: op.direccion_ip,
    Dispositivo: op.dispositivo,
    SO: op.so,
    Conexion: formatearFechaColombia(op.ingreso),
    Desconexion: op.salida ? formatearFechaColombia(op.salida) : "",
    Usuario: op.usuario.user_name,
    id_usuario: op.id_usuario,
    Creado: formatearFechaColombia(op.creado_en),
    Expirado: formatearFechaColombia(op.expira_en),
    Actividad: op.estado ? "Conectado" : "Desconectado",
  }));

  return {
    sesiones: historial,
    activos: activos,
  };
};
export const cerraSesion = async (usuario) => {
  try {
    const id_usuario = usuario;

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

    return await session.save();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return error;
  }
};

function formatearFechaColombia(fechaISO) {
  const fecha = new Date(fechaISO);

  const opciones = {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  // Convertimos a string local con formato colombiano
  const fechaFormateada = fecha.toLocaleString("es-CO", opciones);

  return fechaFormateada;
}
