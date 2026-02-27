import { col, fn, Op } from "sequelize";
import Responsable from "../models/responsable.mjs";
import Produccion from "../models/produccion.mjs";
import RegistroAreaCorte from "../models/registroAreaCorte.mjs";
import DetalleAreaCorte from "../models/detalleAreaCorte.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import ProveedorCorte from "../models/proveedorCorte.mjs";
import Proveedor from "../models/proveedores.mjs";


export const create = async (data) => {
  const { detallesCortes, recepciones, proveedores, fecha, ...restoRegistro } =
    data;

  // Buscar si ya existe un registro con la misma fecha
  let registroAreaCorte = await RegistroAreaCorte.findOne({
    where: { fecha },
  });

  let esRegistroExistente = false;

  if (!registroAreaCorte) {
    registroAreaCorte = await RegistroAreaCorte.create({
      fecha,
      ...restoRegistro,
    });
  } else {
    esRegistroExistente = true;
  }


  for (const detalle of detallesCortes) {
    // Asegurar que lote tenga un valor válido
    const loteValue = detalle.lote || "";

    console.log(
      `Procesando: Prov ${detalle.id_proveedor}, Lote: "${loteValue}", Tipo: ${detalle.tipo}, Kg: ${detalle.materia}`,
    );

    // Construir condición de búsqueda
    const whereCondition = {
      id_corte: registroAreaCorte.id,
      id_proveedor: detalle.id_proveedor,
      tipo: detalle.tipo,
    };

    // Manejar lote_proveedor correctamente
    if (loteValue) {
      whereCondition.lote_proveedor = loteValue;
    } else {
      whereCondition.lote_proveedor = {
        [Op.or]: [null, ""],
      };
    }

    const detalleExistente = await DetalleAreaCorte.findOne({
      where: whereCondition,
    });

    if (detalleExistente) {
      await detalleExistente.update({
        materia: parseFloat(detalle.materia),
      });
    } else {
      const nuevo = await DetalleAreaCorte.create({
        id_corte: registroAreaCorte.id,
        id_proveedor: detalle.id_proveedor,
        lote_proveedor: loteValue,
        tipo: detalle.tipo,
        materia: parseFloat(detalle.materia),
      });
    }
  }

  // ===== PROCESAR PROVEEDORES =====
  console.log("----- PROCESANDO PROVEEDORES -----");

  for (const detalle of proveedores) {
    console.log(
      `Procesando: Prov ${detalle.id_proveedor}, Lote: ${detalle.lote_proveedor}, Total: ${detalle.totalMateria}kg`,
    );

    const proveedorExistente = await ProveedorCorte.findOne({
      where: {
        id_corte: registroAreaCorte.id,
        id_proveedor: detalle.id_proveedor,
        lote_proveedor: detalle.lote_proveedor,
      },
    });

    if (proveedorExistente) {
      await proveedorExistente.update({
        fecha_produccion: detalle.fecha_produccion || fecha,
        totalMateria: parseFloat(detalle.totalMateria),
        rechazo: parseFloat(detalle.rechazo),
        rendimiento: parseFloat(detalle.rendimiento),
      });
      console.log(`  🔄 Actualizado ID: ${proveedorExistente.id}`);
    } else {
      const nuevo = await ProveedorCorte.create({
        id_corte: registroAreaCorte.id,
        id_proveedor: detalle.id_proveedor,
        fecha_produccion: detalle.fecha_produccion || fecha,
        lote_proveedor: detalle.lote_proveedor,
        totalMateria: parseFloat(detalle.totalMateria),
        rechazo: parseFloat(detalle.rechazo),
        rendimiento: parseFloat(detalle.rendimiento),
      });
      console.log(`  ✅ Creado ID: ${nuevo.id}`);
    }
  }

  // ===== RECALCULAR VALORES GLOBALES =====
  console.log("----- RECALCULANDO VALORES GLOBALES -----");

  const todosLosDetalles = await DetalleAreaCorte.findAll({
    where: { id_corte: registroAreaCorte.id },
  });

  const todosLosProveedores = await ProveedorCorte.findAll({
    where: { id_corte: registroAreaCorte.id },
  });

  const totalMateriaCalculado = todosLosDetalles.reduce(
    (sum, d) => sum + parseFloat(d.materia || 0),
    0,
  );

  const rechazoCalculado = todosLosProveedores.reduce(
    (sum, p) => sum + parseFloat(p.rechazo || 0),
    0,
  );

  const todasLasRecepciones = await RegistroRecepcionMateriaPrima.findAll({
    where: {
      fecha: fecha,
      estado_corte: { [Op.in]: [0, 1] },
    },
    attributes: ["cantidad"],
  });

  const materiaRecepcionadaTotal = todasLasRecepciones.reduce(
    (sum, r) => sum + parseFloat(r.cantidad || 0),
    0,
  );

  const rendimientoCalculado =
    materiaRecepcionadaTotal > 0
      ? parseFloat(
          ((totalMateriaCalculado / materiaRecepcionadaTotal) * 100).toFixed(2),
        )
      : 0;

  console.log(`Total materia: ${totalMateriaCalculado}kg`);
  console.log(`Total rechazo: ${rechazoCalculado}kg`);
  console.log(`Rendimiento: ${rendimientoCalculado}%`);

  await registroAreaCorte.update({
    total_materia: parseFloat(totalMateriaCalculado.toFixed(2)),
    rechazo_corte: parseFloat(rechazoCalculado.toFixed(2)),
    rendimiento_materia: rendimientoCalculado,
  });

  // ===== ACTUALIZAR RECEPCIONES =====
  const idsRecepciones = Array.isArray(recepciones)
    ? recepciones
    : [recepciones];

  if (idsRecepciones.length > 0) {
    await RegistroRecepcionMateriaPrima.update(
      { estado_corte: 0 },
      { where: { id: idsRecepciones } },
    );
    console.log("✅ Recepciones actualizadas:", idsRecepciones);
  }

  console.log("========== CREATE FINALIZADO ==========");

  return {
    success: true,
    message: esRegistroExistente
      ? "Registro actualizado correctamente"
      : "Registro creado correctamente",
    data: registroAreaCorte,
  };
};

export const getAll = async (id_produccion) => {
  const ordenProduccion = await Produccion.findOne({
    where: {
      id: id_produccion,
    },
  });

  if (!ordenProduccion) throw new Error("La orden no existe.");

  const registrosCorte = await RegistroAreaCorte.findAll({
    include: [
      {
        model: Responsable,
        as: "responsable",
        attributes: ["nombre"],
      },
    ],
    where: {
      orden: id_produccion,
    },
  });

  if (registrosCorte.length == 0) {
    throw new Error("No hay registros de cortes.");
  }

  const promedios = await RegistroAreaCorte.findAll({
    attributes: [
      [fn("AVG", col("rechazo_corte")), "rechazo"],
      [fn("COUNT", col("id")), "registros"],
    ],
    where: {
      orden: id_produccion,
    },
    raw: true,
  });

  const cortes = registrosCorte.map((op) => ({
    id: op.id,
    Fecha: op.fecha,
    Observaciones: op.observaciones,
    Materia: op.total_materia,
    Rechazo: op.rechazo_corte,
    Responsable: op.responsable.nombre,
  }));

  return {
    cortes,
    promedios,
  };
};

export const getInfoProveedor = async (id) => {
  try {
    const registroCorte = await RegistroAreaCorte.findOne({
      attributes: ["fecha", "observaciones", "rechazo_corte"],
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: { id: id },
    });

    if (!registroCorte) {
      throw new Error("No hay Registro de cortes.");
    }
    const detalleAreaCorte = await DetalleAreaCorte.findAll({
      include: [
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: { id_corte: id },
    });

    const detalleProveedor = await ProveedorCorte.findAll({
      include: [
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: { id_corte: id },
    });

    const detalles = detalleProveedor.map((op) => ({
      Fecha: op.fecha_produccion,
      Materia: op.totalMateria,
      Rechazo: op.rechazo,
      Rendimiento: op.rendimiento,
      Lote: op.lote_proveedor,
      Proveedor: op.proveedor.nombre ?? "",
    }));

    const cortesProveedor = detalleAreaCorte.map((op) => ({
      id: op.id,
      Tipo: op.tipo,
      Cantidad: op.materia,
      Lote: op.lote_proveedor,
      id_proveedor: op.id_proveedor,
      Proveedor: op.proveedor.nombre ?? "",
    }));

    const registro = {
      fecha: registroCorte.fecha,
      observaciones: registroCorte.observaciones,
      rechazo: registroCorte.rechazo_corte,
      responsable: registroCorte.responsable.nombre ?? "",
    };

    return {
      registro,
      detalles,
      cortesProveedor,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
// Trae la informacion de un Registro de recepción
export const getById = async (id) => await RegistroAreaCorte.findByPk(id);
//
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
