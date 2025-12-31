import Cliente from "../models/clientes.mjs";
import OrdenProduccion from "../models/ordenProduccion.mjs";
import Responsable from "../models/responsable.mjs";

export const create = async (data) => {
  return await OrdenProduccion.create(data);
};

export const getAll = async () => {
  const conteOrdenes = await OrdenProduccion.count({
    where: { estado: 1 },
  });
  const ordenesProduccion = await OrdenProduccion.findAll({
    include: [
      { model: Cliente, as: "cliente", attributes: ["nombre"] },
      {
        model: Responsable,
        as: "responsable_elaboracion",
        attributes: ["nombre"],
      },
      {
        model: Responsable,
        as: "responsable_notificacion",
        attributes: ["nombre"],
      },
      {
        model: Responsable,
        as: "responsable_autorizacion",
        attributes: ["nombre"],
      },
    ],
    where: { estado: 1 },
  });

  const ordenes = ordenesProduccion.map((op) => ({
    id: op.id,
    Numero: op.numero_orden,
    Observaciones: op.observaciones,
    Contenedor: op.lote_contenedor,
    Inicio: op.fecha_inicial,
    Estimado: op.fecha_estimada,
    Solicitud: op.fecha_solicitud,
    Cliente: op.cliente?.nombre ?? "",
    Elaboracion: op.responsable_elaboracion?.nombre ?? "",
    Notificacion: op.responsable_notificacion?.nombre ?? "",
    Autorizacion: op.responsable_autorizacion?.nombre ?? "",
  }));

  if (ordenesProduccion.length === 0) {
    throw new Error("No hay Ordenes de Produccion disponibles.");
  }
  return { ordenes, conteo: conteOrdenes };
};

export const getById = async (id) => {
  const ordenProduccion = await OrdenProduccion.findOne({
    include: [
      { model: Cliente, as: "cliente", attributes: ["nombre"] },
      {
        model: Responsable,
        as: "responsable_elaboracion",
        attributes: ["nombre"],
      },
      {
        model: Responsable,
        as: "responsable_notificacion",
        attributes: ["nombre"],
      },
      {
        model: Responsable,
        as: "responsable_autorizacion",
        attributes: ["nombre"],
      },
    ],
    where: {
      id: id,
      estado: 1,
    },
  });

  const resultado = {
    id: ordenProduccion.id,
    numero_orden: ordenProduccion.numero_orden,
    observaciones: ordenProduccion.observaciones,
    lote_contenedor: ordenProduccion.lote_contenedor,
    fecha_inicial: ordenProduccion.fecha_inicial,
    fecha_estimada: ordenProduccion.fecha_estimada,
    fecha_solicitud: ordenProduccion.fecha_solicitud,
    id_cliente: ordenProduccion.cliente?.nombre ?? "",
    id_elaboracion: ordenProduccion.responsable_elaboracion?.nombre ?? "",
    id_notificacion: ordenProduccion.responsable_notificacion?.nombre ?? "",
    id_autorizacion: ordenProduccion.responsable_autorizacion?.nombre ?? "",
  };

  if (ordenProduccion) {
    throw new Error("Orden de producción no encontrada");
  }

  return {
    resultado,
  };
};

export const update = async (id, data) => {
  const proveedor = await OrdenProduccion.findByPk(id);
  if (!proveedor) throw new Error("Orden no encontrada o no existe.");
  data.actualizado_en = new Date();
  return await proveedor.update(data);
};

export const statusDelete = async (id) => {
  const proveedor = await OrdenProduccion.findByPk(id);
  if (!proveedor) throw new Error("Orden no encontrada.");
  return await proveedor.update({ estado: 0 });
};
