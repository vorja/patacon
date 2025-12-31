import { col, fn, Op } from "sequelize";
import Inventario from "../models/inventarioInsumos.mjs";
import ProveedorInsumo from "../models/proveedoresInsumos.mjs";
import Insumo from "../models/registroInsumos.mjs";

export const create = async (data) => await Inventario.create(data);

export const getAll = async () => {
  const lista = await Inventario.findAll({
    include: [
      {
        model: ProveedorInsumo,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { estado: 1 },
  });
  if (lista.length == 0)
    throw new Error("No hay Registros de Items Disponibles.");

  // Hacemos un conteo de cuantos insumos tenemos registrados.
  const conteoItems = await Inventario.count({ where: { estado: 1 } });

  // Organizamos el json, para mejor presentacion.
  const items = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Stock: op.stock,
    Medida: op.medida,
    Area: op.area,
    Proveedor: op.proveedor.nombre ?? "",
  }));

  return {
    items: items,
    conteoItems,
  };
};
export const getItemsProv = async (id) => {
  const lista = await Inventario.findAll({
    include: {
      model: ProveedorInsumo,
      as: "proveedor",
      attributes: ["nombre"],
    },
    where: { estado: 1, id_proveedor: id },
  });

  const items = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Stock: op.stock,
    Medida: op.medida,
    Proveedor: op.proveedor.nombre ?? "",
  }));

  return {
    items: items,
  };
};
export const getById = async (id) => {
  const item = await Inventario.findByPk(id, {
    include: {
      model: ProveedorInsumo,
      as: "proveedor",
      attributes: ["nombre"],
    },
  });
  const info = [];
  const registros = await Insumo.findAll({
    attributes: ["id", "fecha", "fechaVencimiento", "cantidad", "area"],
    where: { [Op.and]: { id_item: id, estado: 1 } },
  });

  info.push({
    item: item.nombre,
    registros: registros.map((registro) => ({
      llegada: registro.fecha,
      vencimiento: registro.fechaVencimiento,
      cantidad: registro.cantidad,
      area: registro.area,
    })),
  });

  return {
    item,
    info,
  };
};

export const update = async (id, data) => {
  const item = await Inventario.findByPk(id);
  if (!item) throw new Error("Item no encontrado");
  return await item.update(data);
};

export const statusDelete = async (id) => {
  const item = await Inventario.findByPk(id);
  if (!item) throw new Error("Item no encontrado");
  return await item.update({ estado: 0 });
};
