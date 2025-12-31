import {
  create,
  getById,
  getAllMonth,
  update,
  statusDelete,
} from "../../services/temperaturaService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

export const createRegistroTemperatura = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);

    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: {
          Title: "¡Nuevo Registro de Temperatura de Cuarto! ",
          Fecha: fecha,
        },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Registro de Temperatura Registrado correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroTemperaturaById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Temperatura"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRegistroTemperaturaByMonth = async (req, res) => {
  try {
    const { fecha, id } = req.params;
    const listRegistros = await getAllMonth(id, fecha);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Registros de temperaturas."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroTemperatura = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro Actualizado correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroTemperatura = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Registro eliminado.");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
