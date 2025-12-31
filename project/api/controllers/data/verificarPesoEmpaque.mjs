import {
  create,
  getById,
  getAll,
  update,
  statusDelete,
} from "../../services/verificacionService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

// Crear un nuevo registro de verificacion de paquete
export const createRegistroVerificacion = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Registro de Verificación Registrada correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los registros de verificacion de paquete
export const getRegistosVerificacion = async (req, res) => {
  try {
    const { orden } = req.params;
    const listRegistros = await getAll(orden);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de registros de Verificación"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener un registro de verificacion de paquetepor ID
export const getRegistosVerificacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Verificacion."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroVerificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro de Verificacion actualizado correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const deleteRegistosVerificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);

    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Registro de verificacion eliminado."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
