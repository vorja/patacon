import {
  create,
  getById,
  getByIdInfo,
  getFrituraDay,
  getAll,
  update,
  statusDelete,
} from "../../services/frituraService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

// Create a new RegistroAreaFritura
export const createRegistroAreaFritura = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Fritura! ", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Registro de Fritura Registrado correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroAreaFrituraById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Fritura encontrado."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroFrituraDay = async (req, res) => {
  try {
    const { fecha } = req.params;
    const listRegistros = await getFrituraDay(fecha);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registros de Fritura."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroFrituraByOrdenMonth = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getAll(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registros de Fritura."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroFrituraByOrdenId = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getByIdInfo(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Registro de Lote."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroAreaFritura = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro de Fritura Actualizado Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroAreaFritura = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);

    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Registro de Fritura eliminado."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
