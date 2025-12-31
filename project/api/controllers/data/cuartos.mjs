import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import {
  getAll,
  getById,
  create,
  update,
  statusDelete,
} from "../../services/cuartosServices.mjs";
import { broadcastWS } from "../../app.mjs";

// Create a new rol
export const createCuarto = async (req, res) => {
  try {
    const { body: data } = req;
    const cuarto = await create(data);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      cuarto,
      "Cuarto Registrado Correctamente."
    );
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null,`${error}`);
  }
};

// Get all roles
export const getCuartos = async (req, res) => {
  try {
    const cuartos = await getAll();
    sendResponse(res, StatusCodes.SUCCESS, cuartos, "Lista de Cuartos");
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null,`${error}`);
  }
};

// Get a rol by ID
export const getCuartoById = async (req, res) => {
  try {
    const { id } = req.params;
    const cuarto = await getById(id);
    return sendResponse(res, StatusCodes.SUCCESS, cuarto, "Cuarto Registrado.");
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null,`${error}`);
  }
};

// Update a rol by ID
export const updateCuarto = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const cuarto = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      cuarto,
      "Cuarto actualizado correctamente."
    );
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null,`${error}`);
  }
};

// Delete a rol by ID
export const deleteCuarto = async (req, res) => {
  try {
    const { id } = req.params;
    const cuarto = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Cuarto Eliminado Correctamente."
    );
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null,`${error}`);
  }
};
