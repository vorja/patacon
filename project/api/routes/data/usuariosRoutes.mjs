// routes/usuarioRoutes.js
import express from "express";
import {
  createUsuario,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  statusUsuario,
} from "../../controllers/data/usuarioController.mjs";

import {
  validarUsuario,
  validarUsuarioEdit,
  validarUsuarioId,
} from "../../middlewares/validaciones/validacionesUsuarios.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);
// Definir rutas para los usuarios
router.post("/crear", verificarToken, validarUsuario, createUsuario);
router.get("/obtener", verificarToken, getUsuarios);

router.get("/obtener-id/:id", verificarToken, validarUsuarioId, getUsuarioById);
router.put(
  "/editar/:id",
  verificarToken,
  validarUsuarioEdit,
  validarUsuarioId,
  updateUsuario
);
router.delete("/eliminar/:id", verificarToken, validarUsuarioId, statusUsuario);

export default router;
