import { col, fn, Op } from "sequelize";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import DetalleCaja from "../models/detalleCajas.mjs";
import Bodega from "../models/bodega.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import ProveedoresEmpaque from "../models/proveedoresEmpaque.mjs";
import Proveedor from "../models/proveedores.mjs";
import VariablesProveedor from "../models/variablesProveedor.mjs";
import DetalleProveedor from "../models/detalleProveedor.mjs";

// Canastillas en bodega
export const getAll = async () => {
  const listaFritura = await LotesFritura.findAll({
    attributes: [
      "id",
      "id_fritura",
      "fecha_produccion",
      "lote_produccion",
      "tipo",
      "canastas",
    ],
  });

  if (listaFritura.length == 0)
    throw new Error("No hay Registros Disponibles.");

  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "fecha_empaque",
      "fecha_produccion",
      "lote_produccion",
      "numero_canastas",
    ],
  });

  // calculamos saldo de canastillas
  const saldo = listaFritura.map((fritura) => {
    const empaquesDelLote = listaEmpaque.filter(
      (e) => e.lote_produccion === fritura.lote_produccion
    );

    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.numero_canastas,
      0
    );

    return {
      id_fritura: fritura.id_fritura,
      fecha_produccion: fritura.fecha_produccion,
      lote_produccion: fritura.lote_produccion,
      tipo: fritura.tipo,
      total_producido: fritura.canastas,
      total_empaquetado: totalEmpaque,
      saldo: fritura.canastas - totalEmpaque,
    };
  });

  return {
    saldo_canastillas: saldo,
  };
};

export const getAllCajas = async () => {
  const registros = await Bodega.findAll({
    attributes: [
      [fn("SUM", col("tipo_a")), "tipo_a"],
      [fn("SUM", col("tipo_b")), "tipo_b"],
      [fn("SUM", col("tipo_c")), "tipo_c"],
      [fn("SUM", col("tipo_af")), "tipo_af"],
      [fn("SUM", col("tipo_bh")), "tipo_bh"],
      [fn("SUM", col("tipo_xl")), "tipo_xl"],
      [fn("SUM", col("tipo_cil")), "tipo_cil"],
      [fn("SUM", col("tipo_p")), "tipo_p"],
    ],
  });

  const cajas = registros.map((op) => ({
    A: op.tipo_a,
    B: op.tipo_b,
    C: op.tipo_c,
    AF: op.tipo_af,
    BH: op.tipo_bh,
    XL: op.tipo_xl,
    CIL: op.tipo_cil,
    P: op.tipo_p,
  }));

  return {
    cajas,
  };
};
// Me trae las cajas por lote de Producción
export const getAllCajaslotes = async () => {
  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "id",
      "fecha_empaque",
      "lote_empaque",
      "fecha_produccion",
      "lote_produccion",
    ],
  });

  const infoCajas = await Promise.all(
    listaEmpaque.map(async (empaque) => {
      const detalle = await DetalleCaja.findAll({
        attributes: ["caja", "cantidad"],
        where: { id_empaque: empaque.id },
      });

      return {
        ...empaque.get({ plain: true }),
        detalle,
      };
    })
  );

  // --- Agrupar por fecha_produccion ---
  const agrupado = infoCajas.reduce((acc, item) => {
    const fecha = item.fecha_produccion;
    if (!acc[fecha]) {
      acc[fecha] = {};
    }

    // Para cada detalle, acumular por lote_produccion + caja
    item.detalle.forEach((d) => {
      const key = `${item.lote_produccion}_${d.caja}`;
      if (!acc[fecha][key]) {
        acc[fecha][key] = {
          lote_produccion: item.lote_produccion,
          caja: d.caja,
          cantidad: 0,
        };
      }
      acc[fecha][key].cantidad += d.cantidad;
    });

    return acc;
  }, {});

  // --- Formatear a la estructura final ---
  const resultado = Object.entries(agrupado).map(([fecha, lotesObj]) => {
    const lotes = Object.values(lotesObj);
    const totalCajas = lotes.reduce((sum, l) => sum + l.cantidad, 0);
    return {
      producción: fecha,
      lotes,
      totalCajas,
    };
  });

  return { infoCajas: resultado };
};

// Inventairo de cajas de bodega
export const getAllCajasBodega = async () => {
  const lista = await Bodega.findAll();
  const cajas = lista.map((op) => ({
    fecha_produccion: op.fecha_produccion,
    A: op.tipo_a,
    B: op.tipo_b,
    C: op.tipo_c,
    AF: op.tipo_af,
    BH: op.tipo_bh,
    XL: op.tipo_xl,
    CIL: op.tipo_cil,
    CP: op.tipo_p,
  }));
  return { infoCajas: cajas };
};

export const getAllLotes = async (lote, idProduccion, tipo) => {
  // Obtenemos la Informacion del Proveedor de la fritrura
  const registroPro = await DetalleProveedor.findAll({
    attributes: ["id"],
    where: {
      [Op.and]: [{ id_fritura: idProduccion }],
    },
  });

  // Obtenemos la Informacion del Proveedor de Empaque
  const detalleEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "fecha_empaque",
      "fecha_produccion",
      "numero_canastas",
      "tipo",
      "lote_produccion",
      "total_cajas",
    ],
    where: { [Op.and]: [{ lote_produccion: lote }, { tipo: tipo }] },
    include: [
      {
        model: RegistroAreaEmpaque,
        as: "empaque",
        attributes: ["lote_empaque"],
      },
    ],
  });

  const proveedoresEmpaque = await ProveedoresEmpaque.findAll({
    attributes: [
      "fecha_produccion",
      "lote_proveedor",
      "tipo",
      "lote_produccion",
      "canastas",
    ],
    where: { [Op.and]: [{ lote_produccion: lote }, { tipo: tipo }] },
  });

  const infoCajas = await Promise.all(
    registroPro.map(async (proceso) => {
      const detalle = await VariablesProveedor.findAll({
        attributes: [
          "lote_proveedor",
          "lote_produccion",
          "tipo",
          "canastas",
          "id_proveedor",
        ],
        where: { id_proceso: proceso.id, tipo: tipo },
        raw: true,
      });

      return {
        ...proceso,
        detalle,
      };
    })
  );

  // Calculamos saldo de canastillas
  const saldo = infoCajas.map((fritura) => {
    const empaquesDelLote = proveedoresEmpaque.filter(
      (e) =>
        e.lote_produccion === fritura.detalle[0].lote_produccion &&
        e.lote_proveedor === fritura.detalle[0].lote_proveedor
    );

    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.canastas,
      0
    );
    return {
      lote_produccion: fritura.detalle[0].lote_produccion,
      lote_proveedor: fritura.detalle[0].lote_proveedor ?? "",
      tipo: tipo,
      saldo: fritura.detalle[0].canastas - totalEmpaque,
      canastas: fritura.detalle[0].canastas,
      empaques: totalEmpaque,
    };
  });

  const detalle = detalleEmpaque.map((op) => ({
    empaque: op.fecha_empaque,
    produccion: op.fecha_produccion,
    lote_empaque: op.empaque?.lote_empaque ?? "",
    lote_produccion: op.lote_produccion,
    canastas: op.numero_canastas,
    tipo: op.tipo,
  }));

  return {
    lotes: detalle,
    saldo,
  };
};

export const getDetallesCajas = async (lote) => {
  const lotes = await ProveedoresEmpaque.findAll({
    where: { [Op.and]: { fecha_produccion: lote } },
    include: [{ model: Proveedor, as: "proveedor", attributes: ["nombre"] }],
  });

  if (lotes.length == 0) throw new Error("No hay Registros Disponibles.");

  const detalle = lotes.map((op) => ({
    produccion: op.fecha_produccion,
    proveedor: op.proveedor?.nombre ?? "",
    lote_produccion: op.lote_produccion,
    lote_recepcion: op.lote_proveedor,
    cajas: op.cajas,
    tipo: op.tipo,
  }));

  return {
    detalle: detalle,
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
