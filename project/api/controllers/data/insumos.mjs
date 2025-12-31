import {
  create,
  getAll,
  getById,
  update,
  statusDelete,
} from "../../services/insumoService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const createItem = async (req, res) => {
  try {
    const { body: data } = req;
    const nuevoItem = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoItem,
      "Item registrado correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getItems = async (req, res) => {
  try {
    const items = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Lista de Items Disponibles."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getById(id);
    return sendResponse(res, StatusCodes.SUCCESS, item, "Item Disponible");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const actualizado = await update(id, body);
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
