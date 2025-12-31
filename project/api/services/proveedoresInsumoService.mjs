import ProveedorInsumo from "../models/proveedoresInsumos.mjs";
import { fn, col } from "sequelize";

export const create = async (data) => {
  
  return await ProveedorInsumo.create(data);
};

export const getAll = async () => {

  const lista = await ProveedorInsumo.findAll({ where: { estado: 1 } });
  const conteoProveedores = await ProveedorInsumo.count({
    where: { estado: 1 },
  });

  if (!lista) throw new Error("No hay Proveedores Disponibles.");

  const proveedores = lista.map((op) => ({
    id: op.id,
    Identificacion: op.identificacion,
    Nombre: op.nombre,
    Movil: op.movil,
    Estado: op.estado,
  }));

  return { proveedores, conteo: conteoProveedores };
};

// Obtener un Proveedor por ID
export const getById = async (id) => await ProveedorInsumo.findByPk(id);

// Actualizar un Proveedor por ID
export const update = async (id, data) => {
  const proveedor = await getById(id);
  if (!proveedor) throw new Error("Proveedor no encontrada o no existe.");
  return await proveedor.update(data);
};

// Eliminar un Proveedor por ID
export const statusDelete = async (id) => {
  const proveedor = await getById(id);
  if (!proveedor) throw new Error("Proveedor no encontrada.");
  return await proveedor.update({ estado: 0 });
};
