import { col, fn } from "sequelize";
import Insumo from "../models/registroInsumos.mjs";
import Inventario from "../models/inventarioInsumos.mjs";
import Responsable from "../models/responsable.mjs";
import ProveedorInsumo from "../models/proveedoresInsumos.mjs";

export const create = async (data) => {
  const item = await Inventario.findByPk(data.id_item);
  if (!item) throw new Error("Item no encontrado");
  const newRegistro = await Insumo.create(data); // Creamos el nuevo registro de insumo.
  let newStock = item.stock + data.cantidad; // Traemos el stock del iitem ylo sumamos con la nueva cantidad.
  const itemActualizado = await item.update({ stock: newStock }); // Actualizamos el item y capturamos la respuesta de la Bd.
  return {
    newRegistro,
    itemActualizado,
  };
};

export const getAll = async () => {
  const lista = await Insumo.findAll({
    include: [
      { model: Responsable, as: "responsable", attributes: ["nombre"] },
      { model: ProveedorInsumo, as: "proveedor", attributes: ["nombre"] },
    ],
    where: { estado: 1 },
  });

  if (lista.length == 0)
    throw new Error("No hay Registros de Insumos Disponibles.");

  const conteoRegistros = await Insumo.count({ where: { estado: 1 } });
  const listaInsumos = lista.map((op) => ({
    id: op.id,
    Fecha: op.fecha,
    Vencimiento: op.fechaVencimiento,
    Producto: op.id_item,
    Cantidad: op.cantidad,
    Lote: op.lote,
    Area: op.area,
    Proveedor: op.proveedor.nombre,
    Responsable: op.responsable.nombre,
  }));

  return {
    items: listaInsumos,
    conteoRegistros,
  };
};

export const getById = async (id) => await Insumo.findByPk(id);

export const update = async (id, data) => {
  const item = await getById(id);
  if (!item) throw new Error("Item no encontrado");
  return await item.update(data);
};

export const statusDelete = async (id) => {
  const item = await getById(id);
  if (!item) throw new Error("Item no encontrado");
  return await item.update({ estado: 0 });
};
