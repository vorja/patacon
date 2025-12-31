import { getAllSessions, cerraSesion } from "../../services/sesionService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const getSessions = async (req, res) => {
  try {
    const historial = await getAllSessions();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      historial,
      "Historial de Sesiones."
    );
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const deleteSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await cerraSesion(id);
    return sendResponse(res, StatusCodes.DELETED, data, "Sesion Finalizada.");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
