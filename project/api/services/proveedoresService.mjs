import Proveedor from "../models/proveedores.mjs";
import { fn, col } from "sequelize";

export const create = async (data) => {
  return await Proveedor.create(data);
};

export const getAll = async () => {
  const lista = await Proveedor.findAll({ where: { estado: 1 } });
  const conteoProveedores = await Proveedor.count({ where: { estado: 1 } });

  if (lista.length === 0) throw new Error("No hay Proveedores Disponibles.");

  const proveedores = lista.map((op) => ({
    id: op.id,
    Identificacion: op.identificacion,
    Nombre: op.nombre,
    Movil: op.movil,
    Estado: op.estado,
  }));

  return { proveedores, conteo: conteoProveedores };
};

export const getList = async () => {
  const lista = await Proveedor.findAll({ where: { estado: 1 } });

  if (lista.length === 0) throw new Error("No hay Proveedores Disponibles.");

  const proveedores = lista.map((op) => ({
    id: op.id,
    nombre: op.nombre,
  }));

  return { proveedores };
};
// Obtener un Proveedor por ID
export const getById = async (id) => await Proveedor.findByPk(id);

// Actualizar un Proveedor por ID
export const update = async (id, data) => {
  const proveedor = await getById(id);
  if (!proveedor) throw new Error("Proveedor no encontrada o no existe.");
  data.actualizado_en = new Date();
  return await proveedor.update(data);
};

// Eliminar un Proveedor por ID
export const statusDelete = async (id) => {
  const proveedor = await getById(id);
  if (!proveedor) throw new Error("Proveedor no encontrada.");
  return await proveedor.update({ estado: 0 });
};
