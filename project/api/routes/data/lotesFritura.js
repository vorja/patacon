import express from "express";
import {
  createLoteFritura,
  getLotesFritura,
  getLoteFrituraById,
  getLoteByLoteNumber,
  updateLoteFritura,
  deleteLoteFritura,
  getAllWithoutFilters,
  diagnosticoModelo,
} from "../../controllers/data/lotesFritura.mjs";

import { validarId } from "../../middlewares/validaciones/validacionesLotesFritura.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

// Crear nuevo lote
router.post("/crear", verificarToken, createLoteFritura);

// Obtener todos los lotes (con filtros opcionales por query params)
router.get("/obtener", verificarToken, getLotesFritura);

// Obtener lote por ID
router.get("/obtener/:id", verificarToken, validarId, getLoteFrituraById);

// Buscar lote por número de lote
router.get("/buscar-lote/:lote", verificarToken, getLoteByLoteNumber);

// Actualizar lote
router.put("/editar/:id", verificarToken, validarId, updateLoteFritura);

// Eliminar lote (borrado lógico)
router.delete("/eliminar/:id", verificarToken, validarId, deleteLoteFritura);

// En el router lotesFritura.js, agrega esta ruta temporal
router.get(
  "/obtener-todos",
  verificarToken,
  getAllWithoutFilters
);

// En el router:
router.get("/diagnostico", diagnosticoModelo);
export default router;
