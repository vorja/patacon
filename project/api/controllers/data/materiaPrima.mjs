import {
  getAll,
  getDetalleMateriaLote,
  getDetalleMaduroLote,
} from "../../services/materiaService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const getItems = async (req, res) => {
  try {
    const items = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Inventario de Materia Prima.",
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Detalle de materia prima
export const getDetalleMateria = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "El parámetro id es requerido",
      );
    }

    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "El id debe ser un número válido",
      );
    }

    const detalle = await getDetalleMateriaLote(idNumero);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      detalle,
      `Detalle del registro ${id}`,
    );
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      error.message || "Error al obtener información",
    );
  }
};

// Detalle de plátano maduro
export const getDetalleMaduro = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "El parámetro id es requerido",
      );
    }

    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "El id debe ser un número válido",
      );
    }

    const detalle = await getDetalleMaduroLote(idNumero);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      detalle,
      `Detalle del registro ${id}`,
    );
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
      error.message || "Error al obtener información",
    );
  }
};
