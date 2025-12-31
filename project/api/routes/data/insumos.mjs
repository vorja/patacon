// routes/rolRoutes.js
import express from "express";
import {
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  getItems,
} from "../../controllers/data/insumos.mjs";
import {
  validarInsumo,
  validarInsumoId,
} from "../../middlewares/validaciones/validacionesInsumos.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

// Define routes for the Rol model
router.post("/crear", verificarToken, validarInsumo, createItem);
router.get("/obtener", verificarToken, getItems);
router.get("/obtener-id/:id", verificarToken, validarInsumoId, getItemById);
router.put(
  "/editar/:id",
  verificarToken,
  validarInsumoId,
  validarInsumo,
  updateItem
);
router.delete("/eliminar/:id", verificarToken, validarInsumoId, deleteItem);

export default router;
