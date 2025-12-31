import {
  create,
  getAll,
  getById,
  statusDelete,
  update,
} from "../../services/recepcionOpService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

// Crear un nuevo registro de recepción de materia prima
export const createRegistroRecepcionMateriaPrimaOp = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Pesaje Proveedor! ", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Recepcion Registrada Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los registros de recepción de materia prima
export const getRegistrosRecepcionMateriaPrimaOp = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getAll(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de registros de materia"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener un registro de recepción de materia prima por ID.
export const getRegistroRecepcionMateriaPrimaOpById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de recepcion"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroRecepcionMateriaPrimaOp = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro de recepcion actualizado correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroRecepcionMateriaPrimaOp = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Registro eliminado.");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
