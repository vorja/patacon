// routes/rolRoutes.js
import express from "express";
import {
  createItem,
  getItemsProvById,
  getItemById,
  updateItem,
  deleteItem,
  getItems,
} from "../../controllers/data/inventario.mjs";
import {
  validarItem,
  validarItemId,
} from "../../middlewares/validaciones/validacionesItem.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

// Define routes for the Rol model
router.post("/crear", verificarToken, validarItem, createItem);
router.get("/obtener", verificarToken, getItems);
router.get("/obtener-id/:id", verificarToken, validarItemId, getItemById);
router.get(
  "/obtener-by-proveedor/:id",
  verificarToken,
  validarItemId,
  getItemsProvById
);
router.put(
  "/editar/:id",
  verificarToken,
  validarItemId,
  validarItem,
  updateItem
);
router.delete("/eliminar/:id", verificarToken, validarItemId, deleteItem);

export default router;
