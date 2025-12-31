// routes/rolRoutes.js
import express from "express";
import {
  createRol,
  getRoles,
  getRolesMod,
  getRolById,
  updateRol,
  deleteRol,
} from "../../controllers/data/rol.mjs";
import {
  validarRol,
  validarRolId,
} from "../../middlewares/validaciones/validacionesRol.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";


const router = express.Router();
router.use(verificarACL);

// Define routes for the Rol model
router.post("/crear", verificarToken, validarRol, createRol);
router.get("/obtener", verificarToken, getRoles);
router.get("/obtener-roles", verificarToken, getRolesMod);
router.get("/obtener-id/:id", verificarToken, validarRolId, getRolById);
router.put("/editar/:id", verificarToken, validarRolId, validarRol, updateRol);
router.delete("/eliminar/:id", verificarToken, validarRolId, deleteRol);

export default router;
