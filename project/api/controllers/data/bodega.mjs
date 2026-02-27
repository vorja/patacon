import {
  getAll,
  getAllLotes,
  getAllCajas,
  getAllCajaslotes,
  getDetallesCajas,
  getDetalles,
  getAllCajasBodega,
  update,
  registrarEnvio,
  obtenerHistorialEnvios,
  obtenerHistorialSobrante,
  obtenerDatosPdf,
} from "../../services/bodegaService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// controllers/data/bodega.mjs
export const registrarEnvioSobrantes = async (req, res) => {
  try {
    console.log("📦 Datos recibidos:", req.body);
    
    const { fecha, enviados, sobrantes, orden } = req.body;
    
    // Validar datos requeridos
    if (!fecha || !orden) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "Fecha y orden son requeridas"
      );
    }

    if (!enviados) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "Datos de envío son requeridos"
      );
    }

    // Validar que haya algo para enviar
    const totalEnvio = Object.values(enviados).reduce((acc, val) => acc + (val || 0), 0);
    if (totalEnvio === 0) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "No hay productos para enviar"
      );
    }

    // Llamar al servicio
    const resultado = await registrarEnvio({
      fecha,
      enviados,
      sobrantes: sobrantes || { A:0, B:0, C:0, AF:0, BH:0, XL:0, CIL:0, PINTON:0 },
      orden
    });

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      resultado.data,
      resultado.message
    );

  } catch (error) {
    console.error("❌ Error en controlador:", error);
    
    // 👉 Si es error de orden duplicada, enviar mensaje específico
    if (error.message.includes("ya tiene un envío registrado")) {
      return sendResponse(
        res,
        StatusCodes.CONFLICT, // 409 Conflict
        null,
        error.message
      );
    }
    
    return sendResponse(
      res,
      StatusCodes.ERROR,
      null,
      error.message || "Error al registrar el envío"
    );
  }
};


// controllers/data/bodega.mjs
export const getHistorialEnvios = async (req, res) => {
  try {
    const { orden } = req.params;
    
    if (!orden) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        "Orden es requerida"
      );
    }

    // Llamar al servicio
    const resultado = await obtenerHistorialEnvios(orden);

    console.log("✅ Resultado del servicio:", JSON.stringify(resultado, null, 2));

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      resultado, // 👈 Enviamos todo el resultado
      "Historial de envíos obtenido correctamente"
    );

  } catch (error) {
    console.error("Error al obtener historial:", error);
    return sendResponse(
      res,
      StatusCodes.ERROR,
      null,
      error.message || "Error al obtener el historial"
    );
  }
};


export const getItems = async (req, res) => {
  try {
    const { orden } = req.params;
    const items = await getAll(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Saldo de canastillas.",
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getDatosPdf = async (req, res) => {
  try {
    const { orden } = req.params;
    const items = await obtenerDatosPdf(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getCajas = async (req, res) => {
  try {
    const { orden } = req.params;
    const items = await getAllCajas(orden);
    return sendResponse(res, StatusCodes.SUCCESS, items, "Lista de Cajas");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getCajasLotes = async (req, res) => {
  try {
    const { orden } = req.params;
    const items = await getAllCajasBodega(orden);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Lista de cajas en bodega.",
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
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
      "Lista de Lotes de producción",
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getCajasByProduccion = async (req, res) => {
  try {
    const { produccion } = req.params;
    const lotes = await getDetallesCajas(produccion);
    return sendResponse(res, StatusCodes.SUCCESS, lotes, "Detalle de cajas ");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getCajasProveedor = async (req, res) => {
  try {
    const { orden } = req.params;
    const lotes = await getDetalles(orden);
    return sendResponse(res, StatusCodes.SUCCESS, lotes, "Detalle de cajas por proveedor ");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// controllers/bodegaController.mjs
export const getHistorialSobrantes = async (req, res) => {
  try {
    const { orden } = req.params;
    const { fecha } = req.body; // La fecha viene del body de la petición
    
    // Validar que la fecha sea proporcionada
    if (!fecha) {
      return sendResponse(
        res, 
        StatusCodes.BAD_REQUEST, 
        null, 
        "La fecha es requerida"
      );
    }

    // Pasar orden y fecha a la función
    const resultado = await obtenerHistorialSobrante(orden, fecha);
    
    let mensaje = resultado.creado 
      ? "Sobrantes procesados y movidos a bodega exitosamente" 
      : "No hay sobrantes pendientes para procesar";
    
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      resultado,
      mensaje
    );
    
  } catch (error) {
    console.log("Error en getHistorialSobrantes:", error);
    return sendResponse(
      res, 
      StatusCodes.INTERNAL_SERVER_ERROR, 
      null, 
      `Error al procesar sobrantes: ${error.message}`
    );
  }
};


// controllers/data/bodega.mjs - Controlador update
export const updateInventario = async (req, res) => {
  try {
    const datos = req.body;
    const resultado = await update(datos);
    
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      resultado,
      "Bodega actualizada exitosamente"
    );
  } catch (error) {
    console.error("Error al actualizar bodega:", error);
    return sendResponse(
      res,
      StatusCodes.ERROR,
      null,
      error.message || "Error al actualizar la bodega"
    );
  }
};