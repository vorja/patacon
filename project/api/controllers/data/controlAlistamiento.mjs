import {
  create,
  getByIdInfo,
  getInfoPdf,
  getDetalleById,
  getById,
  getAll,
  update,
  statusDelete,
} from "../../services/alistamientoService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

export const createControlAlistamiento = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Alistamiento! ", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Control de Alistamiento Registrado Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getControlAlistamientosMonth = async (req, res) => {
  try {
    const { orden } = req.params;
    const listRegistros = await getAll(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Alistamientos."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getControlAlistamientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Alistamiento."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const getInfoAlistamientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getInfoPdf(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Alistamiento."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
// Get a DetalleAlistamiento by ID
export const getDetalleAlistamientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await getDetalleById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      detalle,
      "Registro de Alistamiento."
    );
  } catch (error) {
    console.log("Error", error);

    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const updateControlAlistamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Alistamiento Actualizado Correctamente"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteControlAlistamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Alistamiento Eliminado correctamente"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
