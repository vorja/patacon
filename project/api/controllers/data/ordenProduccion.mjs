import {
  getAll,
  getById,
  create,
  update,
  statusDelete,
} from "../../services/ordenService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Crear una nueva orden de producción
export const createOrdenProduccion = async (req, res) => {
  try {
    const { body: data } = req;
    const ordenProduccion = await create(data);
    sendResponse(
      res,
      StatusCodes.CREATED,
      ordenProduccion,
      "Orden de Producción Registrada."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todas las órdenes de producción
export const getOrdenesProduccion = async (req, res) => {
  try {
    const ordenesProduccion = await getAll();
    sendResponse(
      res,
      StatusCodes.SUCCESS,
      ordenesProduccion,
      "Lista de Ordenes de Producción Disponibles."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener una orden de producción por ID
export const getOrdenProduccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const ordenProduccion = await getById(id);
    sendResponse(
      res,
      StatusCodes.SUCCESS,
      ordenProduccion,
      "Orden de Producción"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Actualizar una orden de producción por ID
export const updateOrdenProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const actualizado = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Orden de Produccion actualizado correctamente."
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Eliminar un proveedor por ID
export const deleteOrdenProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Orden de Produccion eliminada."
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
