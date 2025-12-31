import { col, fn, Op } from "sequelize";
import InventarioMateriaPrima from "../models/inventarioMateriaprima.mjs";
import InventarioPlatanoMaduro from "../models/inventarioPlatanoMaduro.mjs";
// Canastillas en bodega
export const getAll = async () => {
  const registrosMateria = await InventarioMateriaPrima.findAll({
    attributes: [
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

  const listaMaduro = await InventarioPlatanoMaduro.findAll();
  const totalMaduro = await InventarioPlatanoMaduro.sum("cantidad");

  return {
    materia: items,
    maduro: listaMaduro,
    totalMaduro: totalMaduro ?? 0,
  };
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
        `${columna} + ${conteoTipos[columna]}`
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
//
