import bcrypt from "bcryptjs";
import Usuario from "../models/usuarios.mjs";
import Rol from "../models/rol.mjs";
import Sesion from "../models/sesion.mjs";

// Autenticar usuario
export const autenticarUsuario = async (nombre, password) => {
  // buscams el usuario por nombre
  if (!nombre || !password) {
    throw new Error("nombre y contraseña son requeridos");
  }

  // verificamos si el usuario existe y si la contraseña es correcta..
  console.log("usuario: ", nombre);
  const usuario = await Usuario.findOne({
    include: [{ model: Rol, as: "Rol", attributes: ["nombre"] }],
    where: { user_name: nombre },
  });
  console.log(usuario);

  // Verificamos que no haya una session ya iniciada
  const sesionActiva = await Sesion.findOne({
    where: {
      id_usuario: usuario.id,
      estado: 1,
    },
  });

  if (sesionActiva) {
    throw new Error("Yá existe una sesión iniciada con este Usuario.");
  }

  if (usuario && (await bcrypt.compare(password, usuario.password))) {
    return {
      id: usuario.id,
      rol: usuario.Rol.nombre,
      nombre: usuario.user_name,
    };
  } else {
    throw new Error("Credenciales inválidas");
  }
};
