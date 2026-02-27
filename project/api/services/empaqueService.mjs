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
  const transaction = await sequelize.transaction();

  try {
    const { cajas, infoEmpaque, proveedores, ...registroEmpaque } = data;

    // Validar que el array cajas exista y tenga elementos
    if (!cajas || !Array.isArray(cajas) || cajas.length === 0) {
      await transaction.rollback();
      throw new Error("El array 'cajas' es requerido y no puede estar vacío.");
    }

    // 1. Crear registro principal
    const registroAreaEmpaque = await RegistroAreaEmpaque.create(
      registroEmpaque,
      { transaction },
    );

    if (!registroAreaEmpaque?.id) {
      await transaction.rollback();
      throw new Error("No se pudo crear el registro principal.");
    }

    // 2. Crear detalles de lotes
    const resLotes = await createDetalleLotes(
      infoEmpaque,
      registroAreaEmpaque,
      registroEmpaque,
      transaction,
    );

    if (!resLotes) {
      await transaction.rollback();
      throw new Error("No se pudo guardar los lotes de producción.");
    }

    // 3. Crear detalles de proveedores
    const resProveedores = await createDetalleProveedor(
      proveedores,
      registroAreaEmpaque.id,
      transaction,
    );

    if (!resProveedores) {
      await transaction.rollback();
      throw new Error("No se pudo guardar el detalle de los Proveedores.");
    }

    // 4. Crear detalles de cajas
    const resCajas = await createDetalleCaja(
      cajas,
      registroAreaEmpaque.id,
      transaction,
    );

    if (!resCajas) {
      await transaction.rollback();
      throw new Error("No se pudo guardar el detalle de las cajas de empaque.");
    }

    // 5. Actualizar bodega
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

    // Crear registros en Bodega por cada fecha y orden
    const fechas = [...new Set(infoEmpaque.map((r) => r.fecha_produccion))];

    for (const fecha of fechas) {
      const [bodegaRegistro, created] = await Bodega.findOrCreate({
        where: {
          fecha_produccion: fecha,
          orden: registroEmpaque.orden, // ← AHORA FILTRA POR ORDEN TAMBIÉN
        },
        defaults: {
          fecha_produccion: fecha,
          orden: registroEmpaque.orden, // ← GUARDA LA ORDEN
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
        transaction,
      });

      if (!created) {
        const updates = {};
        Object.keys(conteoTipos).forEach((columna) => {
          updates[columna] = sequelize.literal(
            `${columna} + ${conteoTipos[columna]}`,
          );
        });
        await bodegaRegistro.update(updates, { transaction });
      } else {
        await bodegaRegistro.update(conteoTipos, { transaction });
      }
    }

    // 6. Verificar y actualizar estado de lotes de fritura
    for (const item of infoEmpaque) {
      const registros = await DetalleEmpaque.findAll({
        attributes: [
          "lote_produccion",
          [fn("SUM", col("numero_canastas")), "total"],
        ],
        group: ["lote_produccion"],
        where: {
          lote_produccion: item.lote_produccion,
        },
        transaction,
        raw: true,
      });

      const detalle = await LotesFritura.findOne({
        attributes: ["canastas"],
        where: { lote_produccion: item.lote_produccion },
        transaction,
      });

      if (registros.length > 0) {
        if (Number(registros[0].total) == Number(detalle.canastas)) {
          await LotesFritura.update(
            { estado: 0 },
            {
              where: { lote_produccion: item.lote_produccion },
              transaction,
            },
          );
        }
      }
    }

    // 7. Confirmar transacción
    await transaction.commit();

    return registroAreaEmpaque;
  } catch (error) {
    // Rollback automático si ocurre algún error
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error en create empaque:", error);
    throw new Error(`Error al crear registro de empaque: ${error.message}`);
  }
};

// Funciones privadas con soporte para transacciones
const createDetalleCaja = async (cajas, id, transaction) => {
  const detallesInsertados = [];

  for (const detalle of cajas) {
    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    const detalleInsertado = await DetalleCaja.create(detalleConId, {
      transaction,
    });
    detallesInsertados.push(detalleInsertado);
  }

  if (!detallesInsertados || detallesInsertados.length == 0) {
    return false;
  }

  return true;
};

const createDetalleProveedor = async (proveedores, id, transaction) => {
  const detalleProveedor = [];

  for (const detalle of proveedores) {
    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    const detalleInsertado = await proveedoresEmpaque.create(detalleConId, {
      transaction,
    });
    detalleProveedor.push(detalleInsertado);
  }

  if (!detalleProveedor || detalleProveedor.length == 0) {
    return false;
  }
  return true;
};

const createDetalleLotes = async (infoEmpaque, registro, data, transaction) => {
  const lotesInsert = [];

  try {
    for (const detalle of infoEmpaque) {
      const detalleCompleto = {
        ...detalle,
        fecha_empaque: data.fecha_empaque,
        id_empaque: registro.id,
      };

      const detalleInsertado = await DetalleEmpaque.create(detalleCompleto, {
        transaction,
      });
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

// Las demás funciones (getAllMonth, getCajasEmpaque, etc.) permanecen igual
// ya que son solo consultas y no requieren transacciones

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
    const registrosEmpaque = await DetalleEmpaque.findAll({
      attributes: ["fecha_produccion", "tipo", "lote_produccion"],
      where: {
        fecha_produccion: fecha,
      },
      group: ["lote_produccion", "tipo", "fecha_produccion"],
      raw: true,
    });

    if (registrosEmpaque.length === 0) {
      return {
        empaques: [],
        registroBodega: null,
      };
    }

    const registroBodega = await Bodega.findOne({
      where: {
        fecha_produccion: fecha,
      },
    });

    const empaques = registrosEmpaque.map((op) => ({
      Produccion: op.fecha_produccion,
      Tipo: op.tipo,
      LoteProduccion: op.lote_produccion,
    }));

    const resultado = {
      empaques,
      registroBodega: registroBodega || null,
    };

    return resultado;
  } catch (error) {
    console.error("Error en getCajasEmpaque:", error.message);
    return {
      empaques: [],
      registroBodega: null,
    };
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
      }),
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
      throw new Error("Registro no encontrado");
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
      proveedores: proveedoresList,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

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
