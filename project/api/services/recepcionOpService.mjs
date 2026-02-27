import { col, fn, Op } from "sequelize";
import Responsable from "../models/responsable.mjs";
import Proveedor from "../models/proveedores.mjs";
import Produccion from "../models/produccion.mjs";
import RegistroRecepcionMateriaPrimaOp from "../models/resgistroRecepcionOp.mjs";
import DetalleRecepcionOp from "../models/detalleRecepcionOp.mjs";
import InventarioMateriaPrima from "../models/inventarioMateriaprima.mjs";

export const create = async (data) => {
  const { recepcion: detalleRecepcion, ...registroRecepcion } = data;

  // Insertamos el registro principal
  const registroRecepcionOp = await RegistroRecepcionMateriaPrimaOp.create(
    registroRecepcion
  );

  if (!registroRecepcionOp || !registroRecepcionOp.id) {
    throw new Error("No se pudo registrar.");
  }

  const detallesInsertados = [];

  for (const detalle of detalleRecepcion) {
    const detalleConId = {
      ...detalle,
      id_recepcion: registroRecepcionOp.id,
    };
    const detalleInsertado = await DetalleRecepcionOp.create(detalleConId);
    detallesInsertados.push(detalleInsertado);
  }

  const columna = registroRecepcion.peso_total;

  const [inventarioRegistro, created] =
    await InventarioMateriaPrima.findOrCreate({
      where: {
        fecha_recepcion: registroRecepcion.fecha_procedimiento,
        lote_proveedor: registroRecepcion.lote,
        producto: registroRecepcion.variedad,
        id_proveedor: registroRecepcion.id_proveedor,
      },
      defaults: {
        fecha_recepcion: registroRecepcion.fecha_procedimiento,
        producto: registroRecepcion.variedad,
        lote_proveedor: registroRecepcion.lote,
        materia_recp: registroRecepcion.peso_total,
        materia_proceso: 0,
        id_proveedor: registroRecepcion.id_proveedor,
        estado: 1,
      },
    });

  if (!created) {
    await inventarioRegistro.update({
      materia_recp: registroRecepcion.peso_total,
    });
  } else {
    await inventarioRegistro.update({
      materia_recp: columna,
    });
  }

  return registroRecepcionOp;
};

// Trae todos los registros de recpcion por contenedor.
export const getAll = async (Orden) => {
  try {
    const ordenProduccion = await Produccion.findByPk(Orden);
    if (!ordenProduccion) throw new Error("Orden de producción no existe.");
    const registros = await RegistroRecepcionMateriaPrimaOp.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: {
        orden: Orden,
      },
    });

    if (registros.length === 0)
      throw new Error("No hay Registros de recepcion");

    const resultado = registros.map((op) => ({
      id: op.id,
      Procedimiento: op.fecha_procesamiento,
      Fecha: op.fecha,
      Producto: op.variedad,
      Total: op.total_canastillas,
      SubTotal: op.sub_total,
      PesoTotal: op.peso_total,
      Proveedor: op.proveedor?.nombre ?? "",
      Responsable: op.responsable?.nombre ?? "",
    }));

    return {
      recepciones: resultado,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Trae la informacion de un Registro de recepción
export const getById = async (id) =>
  await RegistroRecepcionMateriaPrimaOp.findByPk(id);

export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update({ estado: 0 });
};
