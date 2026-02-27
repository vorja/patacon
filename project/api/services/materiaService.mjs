import { col, fn, Op } from "sequelize";
import InventarioMateriaPrima from "../models/inventarioMateriaprima.mjs";
import InventarioPlatanoMaduro from "../models/inventarioPlatanoMaduro.mjs";
import RegistroRecepcionMateriaPrimaOp from "../models/resgistroRecepcionOp.mjs";
import DetalleRecepcionOp from "../models/detalleRecepcionOp.mjs";

import Proveedor from "../models/proveedores.mjs";

// Canastillas en bodega
export const getAll = async () => {
  const registrosMateria = await InventarioMateriaPrima.findAll({
    attributes: [
      "id",
      "fecha_recepcion",
      "producto",
      "lote_proveedor",
      "materia_recp",
      "materia_proceso",
    ],
  });

  if (registrosMateria.length == 0)
    throw new Error("No hay Registros Disponibles.");

  const items = registrosMateria.map((op) => ({
    id: op.id,
    fecha_recepcion: op.fecha_recepcion,
    lote_proveedor: op.lote_proveedor,
    producto: op.producto,
    materia_recp: op.materia_recp,
    materia_proceso: op.materia_proceso,
    restante: Number(op.materia_recp) - Number(op.materia_proceso),
  }));

  const listaMaduro = await InventarioPlatanoMaduro.findAll({
    where: {
      cantidad: {
        [Op.gt]: 0,
      },
    },
  });
  const totalMaduro = await InventarioPlatanoMaduro.sum("cantidad");

  return {
    materia: items,
    maduro: listaMaduro,
    totalMaduro: totalMaduro ?? 0,
  };
};

// Obtener detalle de materia prima por ID
export const getDetalleMateriaLote = async (id) => {
  try {
    // Buscar el registro en materia prima por ID
    const materiaRegistro = await InventarioMateriaPrima.findOne({
      where: {
        id: id,
      },
    });

    if (!materiaRegistro) {
      throw new Error(
        `No se encontró el registro de materia prima con id: ${id}`,
      );
    }

    // Obtener el lote para buscar en otras tablas
    const lote = materiaRegistro.lote_proveedor;

    // Obtener información de recepción OP por lote
    const registroRecepcionOp = await RegistroRecepcionMateriaPrimaOp.findOne({
      where: {
        lote: lote,
      },
    });

    // Obtener detalles de la recepción OP si existe el registro
    let detalleRecepcionOp = [];
    if (registroRecepcionOp) {
      detalleRecepcionOp = await DetalleRecepcionOp.findAll({
        where: {
          id_recepcion: registroRecepcionOp.id,
        },
      });
    }

    // También obtener información de plátano maduro relacionada por lote
    const maduroRelacionado = await InventarioPlatanoMaduro.findAll({
      where: {
        lote_proveedor: lote,
      },
    });

    const proveedor = await Proveedor.findOne({
      where: {
        id: materiaRegistro.id_proveedor,
      },
    });

    return {
      // Información del registro principal
      registro: {
        id: materiaRegistro.id,
        fecha_recepcion: materiaRegistro.fecha_recepcion,
        producto: materiaRegistro.producto,
        lote_proveedor: materiaRegistro.lote_proveedor,
        materia_recp: materiaRegistro.materia_recp,
        materia_proceso: materiaRegistro.materia_proceso,
        restante: materiaRegistro.materia_recp - materiaRegistro.materia_proceso,
        proveedor: proveedor.nombre,
      },
      // Información de recepción OP
      recepcion_op: registroRecepcionOp
        ? {
            id: registroRecepcionOp.id,
            fecha: registroRecepcionOp.fecha,
            fecha_procedimiento: registroRecepcionOp.fecha_procedimiento,
            id_proveedor: registroRecepcionOp.id_proveedor,
            id_responsable: registroRecepcionOp.id_responsable,
            lote: registroRecepcionOp.lote,
            variedad: registroRecepcionOp.variedad,
            total_canastillas: registroRecepcionOp.total_canastillas,
            sub_total: registroRecepcionOp.sub_total,
            peso_total: registroRecepcionOp.peso_total,
            orden: registroRecepcionOp.orden,
            observaciones: registroRecepcionOp.observaciones,
            estado: registroRecepcionOp.estado,
          }
        : null,
      // Detalles de la recepción OP
      detalle_recepcion_op: detalleRecepcionOp.map((detalle) => ({
        id: detalle.id,
        id_recepcion: detalle.id_recepcion,
        canastilla: detalle.canastilla,
        peso: detalle.peso,
      })),
      // Información relacionada
      maduro_relacionado: maduroRelacionado || [],
    };
  } catch (error) {
    throw error;
  }
};

// Obtener detalle de plátano maduro por ID
export const getDetalleMaduroLote = async (id) => {
  try {
    // Buscar el registro en plátano maduro por ID
    const maduroRegistro = await InventarioPlatanoMaduro.findOne({
      where: {
        id: id,
      },
    });

    if (!maduroRegistro) {
      throw new Error(
        `No se encontró el registro de plátano maduro con id: ${id}`,
      );
    }

    // Obtener el lote para buscar en otras tablas
    const lote = maduroRegistro.lote_proveedor;

    // Buscar materia prima relacionada por lote
    const materiaRelacionada = await InventarioMateriaPrima.findAll({
      where: {
        lote_proveedor: lote,
      },
    });

    // Obtener información de recepción OP por lote
    const registroRecepcionOp = await RegistroRecepcionMateriaPrimaOp.findOne({
      where: {
        lote: lote,
      },
    });

    // Obtener detalles de la recepción OP si existe el registro
    let detalleRecepcionOp = [];
    if (registroRecepcionOp) {
      detalleRecepcionOp = await DetalleRecepcionOp.findAll({
        where: {
          id_recepcion: registroRecepcionOp.id,
        },
      });
    }

    return {
      // Información del registro principal
      registro: {
        id: maduroRegistro.id,
        fecha: maduroRegistro.fecha,
        producto: maduroRegistro.producto,
        lote_proveedor: maduroRegistro.lote_proveedor,
        cantidad: maduroRegistro.cantidad,
      },
      // Información relacionada
      materia_relacionada: materiaRelacionada || [],
      recepcion_op: registroRecepcionOp
        ? {
            id: registroRecepcionOp.id,
            fecha: registroRecepcionOp.fecha,
            fecha_procedimiento: registroRecepcionOp.fecha_procedimiento,
            variedad: registroRecepcionOp.variedad,
            total_canastillas: registroRecepcionOp.total_canastillas,
            peso_total: registroRecepcionOp.peso_total,
          }
        : null,
      detalle_recepcion_op: detalleRecepcionOp.map((detalle) => ({
        id: detalle.id,
        id_recepcion: detalle.id_recepcion,
        canastilla: detalle.canastilla,
        peso: detalle.peso,
      })),
    };
  } catch (error) {
    throw error;
  }
};

export const update = async (data) => {
  const { cajas, ...rest } = data;

  // Mapear tipos de producto a nombres de columnas
  const tipoMap = {
    A: "tipo_a",
    B: "tipo_b",
    C: "tipo_c",
    AF: "tipo_af",
    BH: "tipo_bh",
    XL: "tipo_xl",
    CIL: "tipo_cilindro",
    CP: "tipo_p",
  };

  const conteoTipos = cajas.reduce((acc, caja) => {
    const tipoOriginal = caja.caja?.toUpperCase();
    const columna = tipoMap[tipoOriginal];

    if (columna) {
      acc[columna] = (acc[columna] || 0) + (caja.cantidad || 0);
    }
    return acc;
  }, {});

  cajas.map(async (item) => {
    const registro = await Bodega.findOne({
      where: {
        fecha_produccion: cajas.fecha_produccion,
      },
    });
  });

  if (!created) {
    const updates = {};
    Object.keys(conteoTipos).forEach((columna) => {
      updates[columna] = sequelize.literal(
        `${columna} + ${conteoTipos[columna]}`,
      );
    });
    await bodegaRegistro.update(updates);
  } else {
    await bodegaRegistro.update(conteoTipos);
  }

  const lotes = await Bodega.update({
    where: { [Op.and]: { lote_produccion: lote } },
  });

  return {
    lotes: lotes,
  };
};
