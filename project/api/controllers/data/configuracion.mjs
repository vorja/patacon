import {
  update,
  getAll,
  getById,
} from "../../services/configuracionService.mjs";
import { broadcastWS } from "../../app.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Update the orden_actual field in Configuracion
export const cambiarOrden = async (req, res) => {
  try {
    const { body: data } = req;
    const configuracion = await update(data);

    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy

    const paseoFecha = new Date(data.fecha);
    const fecha = paseoFecha.toISOString().split("T")[0];

    if (fecha === hoy) {
      broadcastWS({
        type: "cambioOrden",
        data: configuracion,
      });
    }
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      configuracion,
      "Orden cambiada."
    );
  } catch (error) {
    console.log("Error", error);

    return sendResponse(res, StatusCodes.INTERNAL_ERROR);
  }
};

export const leerOrden = async (req, res) => {
  try {
    const configuracion = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      configuracion,
      "Orden de produccion."
    );
  } catch (error) {
    console.log("Error", error);

    return sendResponse(res, StatusCodes.INTERNAL_ERROR);
  }
};

export const leerIdOrden = async (req, res) => {
  try {
    const configuracion = await getById();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      configuracion,
      "Orden de produccion"
    );
  } catch (error) {
    console.log("Error", error);

    return sendResponse(res, StatusCodes.INTERNAL_ERROR);
  }
};
