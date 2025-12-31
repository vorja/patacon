// routes/rolRoutes.js
import express from "express";
import {
  createReferencia,
  getReferencias,
  getReferenciaById,
  updateReferencia,
  deleteReferencia,
} from "../../controllers/data/referencias.mjs";
import {
  validarReferenciaId,
  validarReferencias,
} from "../../middlewares/validaciones/validacionesReferencias.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.post("/crear", verificarToken, validarReferencias, createReferencia);
router.get("/obtener", verificarToken, getReferencias);
router.get("/obtener-id/:id", verificarToken, validarReferenciaId, getReferenciaById);
router.put(
  "/editar/:id",
  verificarToken,
  validarReferenciaId,
  validarReferencias,
  updateReferencia
);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarReferenciaId,
  deleteReferencia
);

export default router;
