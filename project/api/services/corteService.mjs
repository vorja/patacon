import { col, fn, Op } from "sequelize";
import Responsable from "../models/responsable.mjs";
import Produccion from "../models/produccion.mjs";
import RegistroAreaCorte from "../models/registroAreaCorte.mjs";
import DetalleAreaCorte from "../models/detalleAreaCorte.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import ProveedorCorte from "../models/proveedorCorte.mjs";
import Proveedor from "../models/proveedores.mjs";

export const create = async (data) => {
  const { detallesCortes, recepciones, proveedores, ...registroCorte } = data;

  const registroAreaCorte = await RegistroAreaCorte.create(registroCorte);

  if (!registroAreaCorte || !registroAreaCorte.id) {
    throw new Error("No se pudo crear el registro principal");
  }

  const detallesInsertados = [];
  for (const detalle of detallesCortes) {
    const detalleConId = {
      ...detalle,
      id_corte: registroAreaCorte.id,
    };
    const detalleInsertado = await DetalleAreaCorte.create(detalleConId);
    detallesInsertados.push(detalleInsertado);
  }

  const proveedorInsertado = [];
  for (const detalle of proveedores) {
    const detalleConId = {
      ...detalle,
      id_corte: registroAreaCorte.id,
    };
    const detalleInsertado = await ProveedorCorte.create(detalleConId);
    proveedorInsertado.push(detalleInsertado);
  }

  if (detallesInsertados.length <= 0) {
    throw new Error("No se pudo registrar el detalle de la fritura.");
  }

  if (proveedorInsertado.length <= 0) {
    throw new Error("No se pudo registrar el detalle de la fritura.");
  }
  const actualizarRecepcion = await RegistroRecepcionMateriaPrima.update(
    { estado_corte: 0 },
    { where: { id: recepciones } }
  );

  return registroAreaCorte;
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
