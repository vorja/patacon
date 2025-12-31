// routes/registroAreaCorteRoutes.js
import express from "express";
import {
  createRegistroCorte,
  getRegistroAreaCorteByIdOrden,
  getDetalleAreaCorteById,
  updateRegistroCorte,
  deleteRegistroCorte,
} from "../../controllers/data/registroAreaCorte.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
import {
  validarCorte,
  validarId,
} from "../../middlewares/validaciones/validacionesCorte.mjs";
const router = express.Router();
router.use(verificarACL);

// ============================================ //
//          Registro de Corte
// ============================================ //

router.post("/crear", verificarToken, validarCorte, createRegistroCorte);
router.get(
  "/obtener-by-orden/:id",
  verificarToken,
  validarId,
  getRegistroAreaCorteByIdOrden
);
router.get(
  "/obtener-detalle-id/:id",
  verificarToken,
  validarId,
  getDetalleAreaCorteById
);
router.delete("/eliminar/:id", verificarToken, validarId, deleteRegistroCorte);
router.put("/editar/:id", verificarToken, validarId, updateRegistroCorte);

export default router;
