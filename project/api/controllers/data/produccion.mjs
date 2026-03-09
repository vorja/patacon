import {
  create,
  getAll,
  getById,
  getPerformances,
  getPerformanceDay,
  getPerformanceGeneral,
  getPerformanceProv,
  getProducciones,
  getContainerInfo,
  getProyeccionContenedor,
  update,
  statusDelete,
  getHistorialProv,
  statusProceso,
  asigCajas,
  getPerformanceAnual,
} from "../../services/produccionService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Crear un nuevo proveedor
export const createProduccion = async (req, res) => {
  try {
    const { body } = req;
    const nuevoProduccion = await create(body);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      nuevoProduccion,
      "Produccion registrado exitosamente.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Asiganar las referencias de cajas a una producción
export const asigCajasProduccion = async (req, res) => {
  try {
    const { body } = req;
    const nuevoProduccion = await asigCajas(body);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      nuevoProduccion,
      "Referencias Asignadas exitosamente.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los proveedores
export const getProduccion = async (req, res) => {
  try {
    const producciones = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      producciones,
      "Lista de contenedores.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los procesos de produccion
export const getProduccionesProcesos = async (req, res) => {
  try {
    const producciones = await getProducciones();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      producciones,
      "Lista de producciones.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getPerformanceAnualProduccion = async (req, res) => {
  try {
    const { año } = req.params; // Opcional: si no se envía año, usa el actual
    const rendimientoAnual = await getPerformanceAnual(año);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      rendimientoAnual,
      "Rendimiento General del Año",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener el rendimiento GENERAL de un año específico
export const getPerformanceAnioEspecifico = async (req, res) => {
  try {
    const { año } = req.params;
    const rendimientoAnual = await getPerformanceAnual(año);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      rendimientoAnual,
      `Rendimiento General del Año ${año}`,
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};


// Obtener el rendimiento de las producciones de un contenedor.
export const getPerformanceProducciones = async (req, res) => {
  try {
    const { orden } = req.params;
    const producciones = await getPerformances(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      producciones,
      "Rendimientos de Producciones.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener el rendimiento GENERAL de un contenedor específico
export const getPerformanceGeneralProduccion = async (req, res) => {
  try {
    const { orden } = req.params; // <-- Recibimos el ID de la orden
    const rendimientoGeneral = await getPerformanceGeneral(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      rendimientoGeneral,
      "Rendimiento General del Contenedor"
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtenemos la proyecion de 1 contenedor
export const getProyeccionesContenedor = async (req, res) => {
  try {
    const { id } = req.params;
    const container = await getProyeccionContenedor(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      container,
      "Proyecion de Contendor.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtenemos la Informacion del Contenedor
export const getInfoContainer = async (req, res) => {
  try {
    const { orden } = req.params;
    const container = await getContainerInfo(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      container,
      "Información de Contenedor.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener el historial de rendimiento 1 proveedor.
export const getHistorialProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const infoProveedor = await getHistorialProv(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      infoProveedor,
      "Historial de Proveedor.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtenemos el rendimiento del proveedor en una producion.
export const getInfoProveedor = async (req, res) => {
  try {
    const { fecha, id } = req.params;
    const infoProveedor = await getPerformanceProv(id, fecha);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      infoProveedor,
      "Información de Proveedor.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener el rendimiento de 1 producción (por fecha)
export const getPerformanceProduccion = async (req, res) => {
  try {
    const { fecha } = req.params;
    const producciones = await getPerformanceDay(fecha);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      producciones,
      "Rendimiento de Producción",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener un proveedor por ID
export const getProduccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      data,
      "Produccion encontrada.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Actualizar un proveedor por ID
export const updateProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const actualizado = await update(id, body);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Produccion actualizado correctamente.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Eliminar un proveedor por ID
export const deleteProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Produccion eliminada.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Finalizar una producción por ID
export const finalizarProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusProceso(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      "Produccion finalizada.",
    );
  } catch (error) {
    console.log("", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
