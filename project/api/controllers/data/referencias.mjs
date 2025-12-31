import {
  create,
  getById,
  getAll,
  update,
  statusDelete,
} from "../../services/referenciasService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const createReferencia = async (req, res) => {
  try {
    const { body: data } = req;
    const nuevoReferencia = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoReferencia,
      "Referencia creada exitosamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getReferencias = async (req, res) => {
  try {
    const referencias = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      referencias,
      "Lista de Referencias."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getReferenciaById = async (req, res) => {
  try {
    const { id } = req.params;
    const referencia = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      referencia,
      "Referencia Disponible"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateReferencia = async (req, res) => {
  try {
    const actualizado = await update(req.params.id, req.body);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Referencia actualizada correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const deleteReferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    if (registro) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        null,
        "Referencia no encontrado."
      );
    }
    return sendResponse(res, StatusCodes.DELETED, null, "Referencia eliminado");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
