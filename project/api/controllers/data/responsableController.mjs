// controllers/ResponsableController.js
import {
  create,
  getAll,
  getAllByRol,
  getById,
  update,
  statusDelete,
} from "../../services/responsableService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
export const createResponsable = async (req, res) => {
  try {
    const responsable = await create(req.body);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      responsable,
      "Empleado Registrado Correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getResponsables = async (req, res) => {
  try {
    const data = await getAll();
    return sendResponse(res, StatusCodes.SUCCESS, data, "Lista de Empleados");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const getResponsablesByRol = async (req, res) => {
  try {
    const { nombre } = req.params;
    const data = await getAllByRol(nombre);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      data,
      "Empleados Encontrado."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const getResponsableById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getById(id);
    return sendResponse(res, StatusCodes.SUCCESS, data, "Empleado Encontrado.");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const updateResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const data = await update(id, body);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      data,
      "Empleado Actualizado Correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const statusResponsable = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Empleado Eliminado Correctamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
