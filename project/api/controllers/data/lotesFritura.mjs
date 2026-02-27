// Agrega esta importación al inicio del archivo:
import LotesFritura from "../../models/lotesFritura.mjs";
import {
  create,
  getById,
  getAll,
  update,
  deleteLogical,
  searchByLote,
} from "../../services/lotesFrituraService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Luego agrega la función corregida:
export const getAllWithoutFilters = async (req, res) => {
  try {
    const registros = await LotesFritura.findAll({
      order: [["fecha_produccion", "DESC"]],
    });

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registros,
      "Todos los registros de lotes de fritura",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_ERROR,
      null,
      `${error.message}`,
    );
  }
};

// ... resto de las funciones existentes
// Crear un nuevo registro de lote de fritura
export const createLoteFritura = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Lote de fritura registrado correctamente.",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.BAD_REQUEST, null, `${error.message}`);
  }
};

// En el controlador, agrega:
export const diagnosticoModelo = async (req, res) => {
  try {
    const resultado = {
      modelo: typeof LotesFritura,
      metodos: {
        findAll: typeof LotesFritura?.findAll,
        findByPk: typeof LotesFritura?.findByPk,
        create: typeof LotesFritura?.create,
      },
      sequelize: typeof LotesFritura?.sequelize,
      tabla: LotesFritura?.tableName,
    };

    console.log("Diagnóstico:", resultado);

    return sendResponse(res, 200, resultado, "Diagnóstico del modelo");
  } catch (error) {
    return sendResponse(res, 500, null, error.message);
  }
};

// Obtener todos los registros de lotes de fritura
export const getLotesFritura = async (req, res) => {
  try {
    const { fecha, tipo, lote } = req.query;
    const filtros = {};

    if (fecha) filtros.fecha = fecha;
    if (tipo) filtros.tipo = tipo;
    if (lote) filtros.lote = lote;

    const listaLotes = await getAll(filtros);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listaLotes,
      "Lista de lotes de fritura",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error.message}`);
  }
};

// Obtener un lote por ID
export const getLoteFrituraById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);

    if (!registro || registro.estado === 0) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        null,
        "Lote no encontrado",
      );
    }

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Lote de fritura encontrado.",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error.message}`);
  }
};

// Buscar lote por número de lote
export const getLoteByLoteNumber = async (req, res) => {
  try {
    const { lote } = req.params;
    const registro = await searchByLote(lote);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Lote de fritura encontrado.",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error.message}`);
  }
};

// Actualizar un lote de fritura
export const updateLoteFritura = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Lote de fritura actualizado correctamente.",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error.message}`);
  }
};

// Eliminar lógicamente un lote
export const deleteLoteFritura = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteLogical(id);

    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Lote de fritura eliminado correctamente.",
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error.message}`);
  }
};
