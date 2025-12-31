import { Op } from "sequelize";
import Rol from "../models/rol.mjs";
const ROLES_PROTEGIDOS = [
  "Dashboard",
  "Gerente",
  "Productor",
  "RRHH",
  "Produccion",
  "Recepción",
  "Alistamiento",
  "Corte",
  "Fritura",
  "Empaque",
  "Cuartos",
];
export const crearRol = async (data) => await Rol.create(data);

export const obtenerRolesActivos = async () => {
  const lista = await Rol.findAll({
    where: { [Op.or]: [{ estado: 1 }] },
  });
  if (lista.length == 0)
    throw new Error("No hay Registros de Roles Disponibles.");

  const conteoRoles = await Rol.count({ where: { estado: 1 } });
  const roles = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Descripcion: op.descripcion,
  }));

  return {
    roles: roles,
    conteoRoles,
  };
};
//Obtener solo los roles para nuevos usuarios.
export const obtenerRolesMod = async () => {
  const lista = await Rol.findAll({ where: { estado: 2 } });
  if (lista.length == 0)
    throw new Error("No hay Registros de Roles Disponibles.");

  const conteoRoles = await Rol.count({ where: { estado: 2 } });
  const roles = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Descripcion: op.descripcion,
  }));

  return {
    roles: roles,
    conteoRoles,
  };
};
export const obtenerRolPorId = async (id) => await Rol.findByPk(id);

export const actualizarRol = async (id, data) => {
  const rol = await obtenerRolPorId(id);
  if (!rol) {
    throw new Error("Rol no encontrado");
  }

  if (ROLES_PROTEGIDOS.includes(rol.nombre)) {
    throw new Error(
      `No se puede cambiar la Información de este Rol: ${rol.nombre}`
    );
  }

  return await rol.update(data);
};

export const eliminarRol = async (id) => {
  const rol = await obtenerRolPorId(id);
  if (!rol) throw new Error("Rol no encontrado");
  return await rol.update({ estado: 0 });
};
