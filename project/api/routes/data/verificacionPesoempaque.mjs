import express from "express";
import {
  createRegistroVerificacion,
  getRegistosVerificacion,
  getRegistosVerificacionById,
  updateRegistroVerificacion,
  deleteRegistosVerificacion,
} from "../../controllers/data/verificarPesoEmpaque.mjs";

import {
  validarId,
  validarVerificacion,
} from "../../middlewares/validaciones/validacionesVerificacionEmpaque.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.post(
  "/crear",
  verificarToken,
  validarVerificacion,
  createRegistroVerificacion
);
router.get(
  "/obtener-orden/:orden",
  verificarToken,
  validarId,
  getRegistosVerificacion
); // Obtener todos los registros de verificacion de empaque
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarId,
  getRegistosVerificacionById
); // Obtener un registro de verificacion verificacion de empaque
router.put(
  "/editar/:id",
  verificarToken,
  validarId,
  updateRegistroVerificacion
);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteRegistosVerificacion
);

export default router;
