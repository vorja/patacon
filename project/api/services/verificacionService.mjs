import { col, Op, fn, where } from "sequelize";
import Responsable from "../models/responsable.mjs";
import verificaciones from "../models/verificaciones.mjs";
import VerificarPesoEmpaque from "../models/verificarPesoEmpaque.mjs";
import VerificarPesoPaquete from "../models/verificarPesoPaquete.mjs";

export const create = async (data) => {
  const { empaques, paquetes, ...rest } = data;

  if (
    !empaques ||
    !Array.isArray(empaques) ||
    empaques.length === 0 ||
    !paquetes ||
    !Array.isArray(paquetes) ||
    paquetes.length === 0
  ) {
    throw new Error("El array 'detalle' es requerido y no puede estar vacío.");
  }
  const registroVerificacion = await verificaciones.create(rest);

  if (!registroVerificacion || !registroVerificacion.id) {
    throw new Error("No se pudo crear el registro principal");
  }

  const detallesInserEmpaque = [];
  for (const detalle of empaques) {
    const detalleConId = {
      ...detalle,
      id_verificacion: registroVerificacion.id,
    };
    const detalleInsertado = await VerificarPesoEmpaque.create(detalleConId);
    detallesInserEmpaque.push(detalleInsertado);
  }

  const detallesInsertPaquetes = [];
  for (const detalle of paquetes) {
    const detalleConId = {
      ...detalle,
      id_verificacion: registroVerificacion.id,
    };
    const detalleInsertado = await VerificarPesoPaquete.create(detalleConId);
    detallesInsertPaquetes.push(detalleInsertado);
  }

  if (detallesInserEmpaque.length == 0) {
    throw new Error(
      404,
      "No se pudo registrar el detalle de la verificacion de empaque."
    );
  }
  if (detallesInsertPaquetes.length == 0) {
    throw new Error(
      "No se pudo registrar el detalle de la verificacion de paquetes."
    );
  }

  return { registroVerificacion, detallesInserEmpaque, detallesInsertPaquetes };
};

// Trae todos los registros de recpcion por contenedor.
export const getAll = async (fecha) => {
  try {
    const registros = await verificaciones.findAll({
      where: {
        fecha_verficacion: fecha,
      },
    });

    if (registros.length == 0) {
      throw new Error(
        "NO hay Registros de Verificacion, en la fecha solicitada."
      );
    }

    return {
      registros,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
// Trae la informacion de un Registro de recepción
export const getById = async (id) => await verificaciones.findByPk(id);

export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registros no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registros no encontrado");
  return await registro.update({ estado: 0 });
};
