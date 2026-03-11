import {
  obtenerDashboardAnual,
  obtenerIndicadoresCalidad,
} from "../../services/dashboardService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

/// Gasto de Materia Prima por contenedor
export const getGastoMateria = async (req, res) => {
  try {
    const { fecha } = req.params;/* 
    const gasto = await obtenerMateriaPrima(fecha); */
    const dashboard = await obtenerDashboardAnual();
    return sendResponse(res, StatusCodes.SUCCESS, dashboard, `Información Año: ${fecha}`);
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getIndicadoresCalidad = async (req, res) => {
  try {
    const indicadores = await obtenerIndicadoresCalidad();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      indicadores,
      "Indicadores de calidad calculados correctamente",
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      `Error al obtener indicadores de calidad: ${error}`,
    );
  }
};
