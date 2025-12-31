import express from "express";
import {
  getCuartos,
  getCuartoById,
  createCuarto,
  updateCuarto,
  deleteCuarto,
} from "../../controllers/data/cuartos.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
import {
  validarCuarto,
  validarCuartolId,
} from "../../middlewares/validaciones/validacionesCuartos.mjs";

const router = express.Router();
router.use(verificarACL);
router.post("/crear", verificarToken, validarCuarto, createCuarto);
router.get("/obtener", verificarToken, getCuartos);
router.get("/obtener-id/:id", verificarToken, validarCuartolId, getCuartoById);
router.put(
  "/editar/:id",
  verificarToken,
  validarCuarto,
  validarCuartolId,
  updateCuarto
);
router.delete("/eliminar/:id", verificarToken, validarCuartolId, deleteCuarto);

export default router;
