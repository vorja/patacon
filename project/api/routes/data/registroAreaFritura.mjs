import express from "express";
import {
  createRegistroAreaFritura,
  getRegistroAreaFrituraById,
  getRegistroFrituraDay,
  getRegistroFrituraByOrdenMonth,
  updateRegistroAreaFritura,
  deleteRegistroAreaFritura,
  getRegistroFrituraByOrdenId,
} from "../../controllers/data/registroAreaFritura.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
import {
  validarFritura,
  validarId,
  validarParamsIds,
} from "../../middlewares/validaciones/validacionesFritura.mjs";

const router = express.Router();
router.use(verificarACL);

// ============================================ //
//          Registro de Fritura
// ============================================ //

router.post(
  "/crear",
  verificarToken,
  validarFritura,
  createRegistroAreaFritura
); // Crear un nuevo registro de área de fritura
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarId,
  getRegistroAreaFrituraById
); // Obtener un registro de área de fritura por ID
router.get("/obtener-lotes-Day/:fecha", verificarToken, getRegistroFrituraDay); // Produccion: Modulo (Empaque)
router.get(
  "/obtener-lotes-Month/:id",
  verificarToken,
  validarParamsIds,
  getRegistroFrituraByOrdenMonth
); // Dashboard traer todos los registros.
router.get(
  "/obtener-lote-Id/:id",
  verificarToken,
  validarParamsIds,
  getRegistroFrituraByOrdenId
); // Dashboard PDF.
router.put("/editar/:id", verificarToken, validarId, updateRegistroAreaFritura);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteRegistroAreaFritura
);

export default router;
