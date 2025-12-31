import {
  create,
  getAll,
  getById,
  getItemsProv,
  update,
  statusDelete,
} from "../../services/inventarioService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const createItem = async (req, res) => {
  try {
    const { body } = req;
    const nuevoItem = await create(body);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoItem,
      "Ittem registrado correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getItems = async (req, res) => {
  try {
    const items = await getAll();
    return sendResponse(res, StatusCodes.SUCCESS, items, "Lista de Items.");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getById(id);
    return sendResponse(res, StatusCodes.SUCCESS, item, "Información del item");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
// Trae los items segun el proveedor.
export const getItemsProvById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getItemsProv(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      item,
      "Lista de Items por proveedor"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const actualizado = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Item actualizado correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Item eliminado.");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
