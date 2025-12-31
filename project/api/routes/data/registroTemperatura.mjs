import express from "express";
import {
  createRegistroTemperatura,
  getRegistroTemperaturaById,
  getRegistroTemperaturaByMonth,
  updateRegistroTemperatura,
  deleteRegistroTemperatura,
} from "../../controllers/data/registroTemperatura.mjs";

import {
  validarCuarto,
  validarId,
  validarParams,
} from "../../middlewares/validaciones/validacionesTemperaturas.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.post("/crear", verificarToken, validarCuarto, createRegistroTemperatura);
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarId,
  getRegistroTemperaturaById
);
router.get(
  "/obtener-fecha/:fecha/:id",
  verificarToken,
  validarParams,
  getRegistroTemperaturaByMonth
);
router.put("/editar/:id", verificarToken, validarId, updateRegistroTemperatura);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteRegistroTemperatura
);

export default router;
