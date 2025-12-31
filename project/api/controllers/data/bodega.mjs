import {
  getAll,
  getAllLotes,
  getAllCajas,
  getAllCajaslotes,
  getDetallesCajas,
  getAllCajasBodega,
} from "../../services/bodegaService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const getItems = async (req, res) => {
  try {
    const items = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Saldo de canastillas."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

export const getCajas = async (req, res) => {
  try {
    const items = await getAllCajas();
    return sendResponse(res, StatusCodes.SUCCESS, items, "Lista de Cajas");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

export const getCajasLotes = async (req, res) => {
  try {
    const items = await getAllCajasBodega();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Lista de cajas en bodega."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};
export const getItemLotesById = async (req, res) => {
  try {
    const { lote, id, tipo } = req.params;
    const lotes = await getAllLotes(lote, id, tipo);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      lotes,
      "Lista de Lotes de producción"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

export const getCajasByProduccion = async (req, res) => {
  try {
    const { produccion } = req.params;
    const lotes = await getDetallesCajas(produccion);
    return sendResponse(res, StatusCodes.SUCCESS, lotes, "Detalle de cajas ");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};
