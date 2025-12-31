import {
  create,
  getById,
  getAll,
  getInfoProveedor,
  update,
  statusDelete,
} from "../../services/corteService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";
import { broadcastWS } from "../../app.mjs";

// Crear un nuevo registro de corte
export const createRegistroCorte = async (req, res) => {
  try {
    const { body: data } = req;
    const registro = await create(data);

    const hoy = new Date().toISOString().slice(0, 10); // Obtenemos el dia de Hoy
    const parseoFecha = new Date(req.body.fecha);
    const fecha = parseoFecha.toISOString().split("T")[0];
    if (fecha === hoy) {
      broadcastWS({
        type: "Notificacion",
        data: { Title: "¡Nuevo Registro de Corte! ", Fecha: fecha },
      });
    }
    return sendResponse(
      res,
      StatusCodes.CREATED,
      registro,
      "Registro de Corte Guardado Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener los registros para llevar al dashboard
export const getRegistroAreaCorteByIdOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const listRegistros = await getAll(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registros de Corte"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los registros de corte
export const getRegistrosCorteMonth = async (req, res) => {
  try {
    const { fecha } = req.params;
    const listRegistros = await getAllMonth(fecha);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      listRegistros,
      "Lista de Registro de Corte."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const getDetalleAreaCorteById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await getInfoProveedor(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      detalle,
      "Registro de Corte."
    );
  } catch (error) {
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
// Obtener un registro de corte por ID
export const getRegistroCorteById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await getById(id);

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      registro,
      "Registro de Corte."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRegistroCorte = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const registroUpdate = await update(id, data);

    return sendResponse(
      res,
      StatusCodes.UPDATED,
      registroUpdate,
      "Registro de Corte Actualizado Correctamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const deleteRegistroCorte = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);

    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Registro de Corte Eliminado."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
