import express from "express";
import {
  createControlAlistamiento,
  getControlAlistamientosMonth,
  getControlAlistamientoById,
  getDetalleAlistamientoById,
  getInfoAlistamientoById,
  updateControlAlistamiento,
  deleteControlAlistamiento,
  restarCantidadProveedor,
} from "../../controllers/data/controlAlistamiento.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

import {
  validarAlistamiento,
  validarParams,
  validarId,
} from "../../middlewares/validaciones/validacionesAlistamiento.mjs";

const router = express.Router();
router.use(verificarACL);

router.post(
  "/crear",
  verificarToken,
  validarAlistamiento,
  createControlAlistamiento
);
router.get(
  "/obtener-detalle/:id",
  verificarToken,
  validarId,
  getDetalleAlistamientoById
);
router.get(
  "/obtener-by-Id/:id",
  verificarToken,
  validarId,
  getControlAlistamientoById
);
router.get(
  "/obtener-info-id/:id",
  verificarToken,
  validarId,
  getInfoAlistamientoById
);
router.get(
  "/obtener-by-Order/:orden",
  verificarToken,
  validarParams,
  getControlAlistamientosMonth
);

router.put("/editar/:id", verificarToken, validarId, updateControlAlistamiento);

router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteControlAlistamiento
);

// En routes/data/recepcion.mjs - AÑADIR ESTA RUTA

router.put(
  "/restar-cantidad/:id", 
  verificarToken, 
  restarCantidadProveedor
);

export default router;
