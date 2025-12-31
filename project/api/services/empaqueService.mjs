import moment from "moment";
import { col, Op, fn } from "sequelize";
import Responsable from "../models/responsable.mjs";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import DetalleCaja from "../models/detalleCajas.mjs";
import Bodega from "../models/bodega.mjs";
import proveedoresEmpaque from "../models/proveedoresEmpaque.mjs";
import sequelize from "../config/database.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";

export const create = async (data) => {
  try {
    const { cajas, infoEmpaque, proveedores, ...registroEmpaque } = data;

    // Validar que el array cajas exista y tenga elementos
    if (!cajas || !Array.isArray(cajas) || cajas.length === 0) {
      throw new Error("El array 'cajas' es requerido y no puede estar vacío.");
    }

    // Crear registro principal
    const registroAreaEmpaque = await RegistroAreaEmpaque.create(
      registroEmpaque
    );

    if (!registroAreaEmpaque || !registroAreaEmpaque.id) {
      throw new Error("No se pudo crear el registro principal.");
    }

    const resLotes = await createDetalleLotes(
      infoEmpaque,
      registroAreaEmpaque,
      registroEmpaque
    );

    if (!resLotes) {
      throw new Error("No se pudo guardar los lotes de producción.");
    }

    const resProveedores = await createDetalleProveedor(
      proveedores,
      registroAreaEmpaque.id
    );

    if (!resProveedores) {
      throw new Error("No se pudo guardar el detalle de los Proveedores.");
    }

    const resCajas = await createDetalleCaja(cajas, registroAreaEmpaque.id);
    if (!resCajas) {
      throw new Error("No se pudo guardar el detalle de las cajas de empaque.");
    }

    // Mapear tipos de producto a nombres de columnas
    const tipoMap = {
      A: "tipo_a",
      B: "tipo_b",
      C: "tipo_c",
      AF: "tipo_af",
      BH: "tipo_bh",
      XL: "tipo_xl",
      CIL: "tipo_cil",
      P: "tipo_p",
    };

    const conteoTipos = cajas.reduce((acc, caja) => {
      const tipoOriginal = caja.caja?.toUpperCase();
      const columna = tipoMap[tipoOriginal];

      if (columna) {
        acc[columna] = (acc[columna] || 0) + (caja.cantidad || 0);
      }
      return acc;
    }, {});

    // Buscar o crear registro en Bodega
    const fechas = [...new Set(infoEmpaque.map((r) => r.fecha_produccion))].map(
      (fecha) => ({
        fechaProduccion: fecha,
      })
    );

    fechas.forEach(async (item) => {
      const [bodegaRegistro, created] = await Bodega.findOrCreate({
        where: {
          fecha_produccion: item.fechaProduccion,
        },
        defaults: {
          fecha_produccion: item.fechaProduccion,
          tipo_a: 0,
          tipo_b: 0,
          tipo_c: 0,
          tipo_af: 0,
          tipo_bh: 0,
          tipo_xl: 0,
          tipo_cil: 0,
          tipo_p: 0,
          estado: 1,
        },
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
    });

    infoEmpaque.forEach(async (item) => {
      const registros = await DetalleEmpaque.findAll({
        attributes: [
          "lote_produccion",
          [fn("SUM", col("numero_canastas")), "total"],
        ],
        group: ["lote_produccion"],
        where: {
          lote_produccion: item.lote_produccion,
        },
        raw: true,
      });

      const detalle = await LotesFritura.findOne({
        attributes: ["canastas"],
        where: { lote_produccion: item.lote_produccion },
      });

      if (registros.length > 0) {
        if (Number(registros[0].total) == Number(detalle.canastas)) {
          await LotesFritura.update(
            { estado: 0 },
            { where: { lote_produccion: item.lote_produccion } }
          );
        }
      }
    });

    return registroAreaEmpaque;
  } catch (error) {
    throw error;
  }
};
// funciones privadas
const createDetalleCaja = async (cajas, id) => {
  // Insertar detalles de cajas
  const detallesInsertados = [];

  for (const detalle of cajas) {
    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    const detalleInsertado = await DetalleCaja.create(detalleConId);
    detallesInsertados.push(detalleInsertado);
  }

  if (!detallesInsertados || detallesInsertados.length == 0) {
    return false;
  }

  return true;
};

const createDetalleProveedor = async (proveedores, id) => {
  const detalleProveedor = [];
  for (const detalle of proveedores) {
    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    const detalleInsertado = await proveedoresEmpaque.create(detalleConId);
    detalleProveedor.push(detalleInsertado);
  }

  if (!detalleProveedor || detalleProveedor.length == 0) {
    return false;
  }
  return true;
};

const createDetalleLotes = async (infoEmpaque, registro, data) => {
  const lotesInsert = [];
  try {
    for (const detalle of infoEmpaque) {
      // Crear un nuevo objeto con todos los datos
      const detalleCompleto = {
        ...detalle,
        fecha_empaque: data.fecha_empaque,
        id_empaque: registro.id,
      };

      const detalleInsertado = await DetalleEmpaque.create(detalleCompleto);
      lotesInsert.push(detalleInsertado);
    }

    if (!lotesInsert || lotesInsert.length === 0) {
      console.log("No se insertaron registros");
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export const getAllMonth = async (fecha) => {
  if (!/^\d{4}-\d{2}$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Usa "YYYY-MM".');
  }
  const fechaInicio = moment(`${fecha}-01`)
    .startOf("month")
    .format("YYYY-MM-DD");
  const fechaFin = moment(fechaInicio).add(1, "month").format("YYYY-MM-DD");

  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        fecha_empaque: {
          [Op.gte]: fechaInicio,
          [Op.lt]: fechaFin,
        },
      },
    });

    const promedios = await RegistroAreaEmpaque.findAll({
      attributes: [
        [fn("AVG", col("rechazo_empaque")), "rechazo"],
        [fn("AVG", col("migas_empaque")), "migas"],
        [fn("COUNT", col("id")), "registros"],
      ],
      where: {
        fecha_empaque: {
          [Op.gte]: fechaInicio,
          [Op.lt]: fechaFin,
        },
      },
      raw: true,
    });

    const empaques = registrosEmpaque.map((op) => ({
      id: op.id,
      Empaque: op.fecha_empaque,
      LoteEmpaque: op.lote_empaque ?? "No tiene un Lote Asignado.",
      Canastas: op.numero_canastas,
      Cajas: op.total_cajas,
      Migas: op.migas_empaque,
      Rechazo: op.rechazo_empaque,
      Observaciones: op.observaciones,
      Responsable: op.responsable.nombre,
    }));

    if (registrosEmpaque.length == 0) {
      throw new Error("No hay Registros de Empaque.");
    }

    return {
      empaques,
      promedios,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCajasEmpaque = async (fecha) => {
  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      attributes: ["fecha_produccion", "tipo_producto", "lote_produccion"],
      where: {
        fecha_produccion: fecha,
      },
      group: ["lote_produccion", "fecha_produccion", "tipo_producto"],
    });

    const registroBodega = await Bodega.findOne({
      where: {
        fecha_produccion: fecha,
      },
    });

    if (registrosEmpaque.length == 0) {
      throw new Error("No hay Registros de Empaque.");
    }

    if (!registroBodega) {
      throw new Error("No hay Registros En la bodega.");
    }

    const empaques = registrosEmpaque.map((op) => ({
      Produccion: op.fecha_produccion,
      Tipo: `C${op.tipo_producto}`,
      LoteProduccion: op.lote_produccion,
    }));

    return {
      empaques,
      registroBodega,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getEmpaqueByOrden = async (orden) => {
  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        orden: orden,
      },
    });

    const empaques = registrosEmpaque.map((op) => ({
      id: op.id,
      Empaque: op.fecha_empaque,
      Produccion: op.fecha_produccion,
      LoteEmpaque: op.lote_empaque ?? "No tiene un Lote Asignado.",
      LoteProduccion: op.lote_produccion,
      Tipo: op.tipo_producto,
      Canastas: op.numero_canastas,
      Cajas: op.total_cajas,
      Migas: op.migas_empaque,
      Rechazo: op.rechazo_empaque,
      Observaciones: op.observaciones,
      Responsable: op.responsable.nombre,
    }));

    const detalleCajas = await Promise.all(
      empaques.map(async (empaque) => {
        const detalle = await DetalleCaja.findAll({
          attributes: ["caja", "cantidad"],
          where: { id_empaque: empaque.id },
        });
        return {
          ...empaque,
          detalle,
        };
      })
    );

    return {
      empaques: detalleCajas,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDetalleEmpaque = async (id) => {
  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findOne({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        id: id,
      },
    });

    if (!registrosEmpaque) {
    }

    const proveedores = await proveedoresEmpaque.findAll({
      attributes: [
        "tipo",
        "fecha_produccion",
        "lote_proveedor",
        [fn("SUM", col("cajas")), "totalCajas"],
        [fn("SUM", col("canastas")), "numero_canastas"],
        [fn("SUM", col("rechazo")), "totalRechazo"],
        [fn("SUM", col("migas")), "totalMigas"],
      ],
      where: { id_empaque: id },
      group: ["lote_proveedor", "tipo", "fecha_produccion"],
      raw: true,
    });

    const proveedoresList = proveedores.map((op) => ({
      fecha: op.fecha_produccion,
      proveedor: op.lote_proveedor,
      cajas: op.totalCajas,
      canastas: op.numero_canastas,
      tipo: op.tipo,
      rechazo: op.totalRechazo.toFixed(1),
      migas: op.totalMigas.toFixed(1),
    }));

    return {
      empaques: registrosEmpaque,
      /*   cajas: detalle, */
      proveedores: proveedoresList,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
// Trae la informacion de un Registro de recepción
export const getEmpaqueById = async (id) =>
  await RegistroAreaEmpaque.findByPk(id);

export const update = async (id, data) => {
  const registro = await getEmpaqueById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getEmpaqueById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update({ estado: 0 });
};
