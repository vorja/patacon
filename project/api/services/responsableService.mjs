import Responsable from "../models/responsable.mjs";
import Rol from "../models/rol.mjs";
import { fn, col, Op, and } from "sequelize";

export const create = async (data) => {
  const usuarioDocumento = await Responsable.findOne({
    where: { identificacion: data.identificacion },
  });
  if (usuarioDocumento)
    throw new Error("Ya Hay Un Empleado Registrado con ese documento.");

  return await Responsable.create(data);
};

export const getAll = async () => {
  const usuarios = await Responsable.findAll({
    attributes: [
      "id",
      "identificacion",
      "nombre",
      "correo",
      "telefono",
      "id_rol",
    ],
    include: { model: Rol, as: "Rol", attributes: ["nombre"] },
    where: { estado: 1 },
  });
  if (!usuarios) throw new Error("No hay Empleados Disponibles.");

  const conteoUsuario = await Responsable.findAll({
    attributes: ["id_rol", [fn("COUNT", col("id_rol")), "cantidad"]],
    include: { model: Rol, as: "Rol", attributes: ["nombre"] },
    where: { estado: 1 },
    group: ["id_rol", "Rol.id"],
  });

  const responsables = usuarios.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Identificacion: op.identificacion,
    Correo: op.correo,
    Telefono: op.telefono,
    Rol: op.Rol?.nombre ?? "",
  }));

  return {
    responsables,
    conteo: conteoUsuario.map((item) => ({
      nombre: item.Rol.nombre,
      cantidad: parseInt(item.get("cantidad")),
    })),
  };
};
export const getAllByRol = async (data) => {
  let nombre = data;
  const responsables = await Responsable.findAll({
    attributes: ["id", "nombre"],
    include: [
      {
        model: Rol,
        as: "Rol",
        required: true,
        attributes: ["id"],
        where: { nombre: nombre },
      },
    ],
    where: {
      estado: 1,
    },
  });
  if (responsables.length <= 0)
    throw new Error("No existen empleados con ese rol.");

  return {
    responsables,
  };
};

// Obtener un Responsable por ID
export const getById = async (id) => {
  const responsable = await Responsable.findOne({
    attributes: ["id", "nombre", "correo", "identificacion", "telefono"],
    include: [
      {
        model: Rol,
        as: "Rol",
        attributes: ["id", "nombre"],
        required: true,
      },
    ],
    where: { id: id, estado: 1 },
  });
  if (!responsable) throw new Error("Empleado no encontrado");

  return {
    responsable,
  };
};
// Actualizar un Responsable por ID
export const update = async (id, data) => {
  const Responsables = await Responsable.findByPk(id);
  if (!Responsables) throw new Error("Empleado no encontrado");

  Responsable.update(data, {
    where: {
      id: id,
    },
  });

  return {
    Responsable,
  };
};

// Eliminar un Responsable por ID
export const statusDelete = async (id) => {
  const responsable = await Responsable.findByPk(id);
  if (!responsable) throw new Error("Responsable no encontrado");
  return await responsable.update({ estado: 0 });
};
