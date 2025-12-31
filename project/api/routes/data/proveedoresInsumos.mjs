import express from "express";
import {
  createProveedor,
  getProveedores,
  getProveedorById,
  updateProveedor,
  deleteProveedor,
} from "../../controllers/data/proveedoresInsumo.mjs";
// Importamos la validaciones del Middleware.
import {
  validarProveedor,
  validarProveedorId,
} from "../../middlewares/validaciones/validacionesProveedorInsumos.mjs";
// Importamos la Verificaciones de Token y Verificacion de Permisos.
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
const router = express.Router();
router.use(verificarACL);

router.post("/crear", verificarToken, validarProveedor, createProveedor);
router.get("/obtener", verificarToken, getProveedores);
router.get("/obtener-id/:id",verificarToken,validarProveedorId,getProveedorById);
router.put("/editar/:id", verificarToken,
  validarProveedorId,
  validarProveedor,
  updateProveedor
);
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarProveedorId,
  deleteProveedor
);

export default router;
