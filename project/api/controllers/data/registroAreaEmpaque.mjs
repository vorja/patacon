import {
  create,
  getEmpaqueById,
  getDetalleEmpaque,
  getEmpaqueByOrden,
  getAllMonth,
  getCajasEmpaque,
  update,
  statusDelete,
} from "../../services/empaqueService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

// Crear un nuevo registro de área de empaque
export const createRegistroAreaEmpaque = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha_empaque);
    
    const fecha = parseoFecha.toISOString().split("T")[0];
    console.log(fecha);
    console.log(hoy);
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Empaque! ", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Registro de Empaque Registrado correctamente."
    );
  } catch (error) {
    console.log("error: ", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Lsita los registros de empaque. (Dashboard)
export const getRegistrosEmpaqueMonth = async (req, res) => {
  try {
    const { fecha } = req.params;
    const listRegistros = await getAllMonth(fecha);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registros de Empaque."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
// Validaciones para rectificar empaque.
export const getRegistroCajasEmpaque = async (req, res) => {
  try {
    const { fecha } = req.params;
    const listRegistros = await getCajasEmpaque(fecha);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Cajas de empaque."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      `Ocurrio un error Inesperado.`
    );
  }
};

export const getRegistrosEmpaqueByOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getEmpaqueByOrden(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registros de Empaque."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener un registro de área de empaque por ID
export const getRegistroAreaEmpaqueById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getEmpaqueById(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Empaque."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener un detalle  de empaque por ID
export const getDetalleEmpaqueById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getDetalleEmpaque(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Empaque."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const updateRegistroAreaEmpaque = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro de Empaque Actualizado Correctamente."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroAreaEmpaque = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);

    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Registro de Empaque Eliminado."
    );
  } catch (error) {
    console.log("error: ", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
