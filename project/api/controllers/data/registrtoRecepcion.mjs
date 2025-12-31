import {
  create,
  getAll,
  getById,
  update,
  statusDelete,
  getAllProveedores,
} from "../../services/recepcionService.mjs";
import { broadcastWS } from "../../app.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Crear un nuevo registro de recepción de materia prima
export const createRegistroRecepcionMateriaPrima = async (req, res) => {
  try {
    const { body: data } = req;

    const registro = await create(data);
    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy

    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    console.log(fecha);
    console.log(hoy);
    if (fecha === hoy) {
      broadcastWS({
        type: "nuevoProveedor",
        data: registro,
      });

      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Recepción!", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Recepcion Registrada Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los registros de recepción de materia prima por ID de contenedor o orden.
export const getRecepcionMateriaPrimaBydOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getAll(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Recepciones."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener 1 registro de recepción de materia prima
export const getRegistroRecepcionMateriaPrimaById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Recepción Encontrada."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

//Llevar los proveedores al modulo de Alistamiento
export const getProveedorRecepcionByIdOrdenProduccion = async (req, res) => {
  try {
    const { fecha, id, modulo } = req.params;
    const listRegistros = await getAllProveedores(id, fecha, modulo);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Proveedores de Recepciones."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroRecepcionMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Recepción Actualizada Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroRecepcionMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, data, "Registro Eliminado.");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
