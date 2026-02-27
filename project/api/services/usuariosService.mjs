import Rol from "../models/rol.mjs";
import bcrypt from "bcryptjs";
import { fn, col, Op, and } from "sequelize";
import Usuarios from "../models/usuarios.mjs";

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

export const create = async (data) => {
  const usuarios = await Usuarios.findOne({
    where: { [Op.and]: [{ user_name: data.user_name }] },
  });
  if (usuarios)
    throw new Error("Ya Hay Un Usuario registrado con ese usuario.");
  data.password = await bcrypt.hash(data.password, 12);
  return await Usuarios.create(data);
};

export const getAll = async () => {
  const usuariosList = await Usuarios.findAll({
    attributes: ["id", "user_name", "id_rol"],
    include: { model: Rol, as: "Rol", attributes: ["nombre"] },
    where: { estado: 1 },
  });
  if (!usuariosList) throw new Error("No hay Usuarios Disponibles.");

  const conteoUsuario = await Usuarios.findAll({
    attributes: ["id_rol", [fn("COUNT", col("id_rol")), "cantidad"]],
    include: {
      model: Rol,
      as: "Rol",
      attributes: ["nombre"],
      where: { estado: 2 },
    },
    where: { estado: 1 },
    group: ["id_rol", "Rol.id"],
  });

  const usuarios = usuariosList.map((op) => ({
    id: op.id,
    Nombre: op.user_name,
    Rol: op.Rol?.nombre ?? "",
  }));

  return {
    usuarios,
    conteo: conteoUsuario.map((item) => ({
      nombre: item.Rol.nombre,
      cantidad: parseInt(item.get("cantidad")),
    })),
  };
};

// Obtener un Usuarios por ID
export const getById = async (id) => {
  const usuario = await Usuarios.findOne({
    attributes: ["id", "user_name"],
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
  if (!usuario) throw new Error("Usuario no encontrado");

  return {
    usuario,
  };
};
// Actualizar un Usuarios por ID
export const update = async (id, data) => {
  const usuarios = await Usuarios.findByPk(id);
  if (!usuarios) throw new Error("Usuario no encontrado");

  data.actualizado_en = new Date();
  if (data.password && data.password != "") {
    if (data.password.length < 8 || data.password.length > 255) {
      return res.status(400).json({
        error: "La contraseña debe tener entre 8 y 255 caracteres",
      });
    }
    data.password = await bcrypt.hash(data.password, 12);
  } else {
    delete data.password;
  }
  Usuarios.update(data, {
    where: {
      id: id,
    },
  });

  return {
    usuarios,
  };
};

// Eliminar un Responsable por ID
export const statusDelete = async (id) => {
  const usuario = await Usuarios.findByPk(id, {
    include: [
      {
        model: Rol,
        as: "Rol",
        attributes: ["nombre"],
      },
    ],
  });
  if (
    usuario.Rol.nombre === "Dashboard" ||
    usuario.Rol.nombre === "Produccion"
  ) {
    throw new Error("No se puede eliminar a usuario Administrador.");
  }
  if (!usuario) throw new Error("Usuario no encontrado");
  return await usuario.update({ estado: 0 });
};
