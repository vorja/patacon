// routes/usuarioRoutes.js
import express from "express";
import {
  createResponsable,
  getResponsables,
  getResponsableById,
  updateResponsable,
  statusResponsable,
  getResponsablesByRol,
} from "../../controllers/data/responsableController.mjs";
import {
  validarNombreRol,
  validarResponsable,
  validarResponsableEdit,
  validarResponsableId,
} from "../../middlewares/validaciones/validacionesResponsable.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);
// Definir rutas para los usuarios
router.post("/crear", verificarToken, validarResponsable, createResponsable);
router.get("/obtener", verificarToken, getResponsables);
router.get(
  "/obtener-by-rol/:nombre",
  verificarToken,
  validarNombreRol,
  getResponsablesByRol
);
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarResponsableId,
  getResponsableById
);
router.put(
  "/editar/:id",
  verificarToken,
  validarResponsableEdit,
  validarResponsableId,
  updateResponsable
);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarResponsableId,
  statusResponsable
);

export default router;
