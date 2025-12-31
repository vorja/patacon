// routes/rolRoutes.js
import express from "express";
import {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
} from "../../controllers/data/clientes.mjs";
import {
  validarCliente,
  validarClientelId,
} from "../../middlewares/validaciones/validacionesCliente.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
const router = express.Router();

router.use(verificarACL);

// Define routes for the Rol model
router.post("/crear", verificarToken, validarCliente, createCliente);
router.get("/obtener", verificarToken, getClientes);
router.get("/obtener-id/:id", verificarToken, validarClientelId, getClienteById);
router.put(
  "/editar/:id",
  verificarToken,
  validarClientelId,
  validarCliente,
  updateCliente
);
router.delete("/eliminar/:id", verificarToken, validarClientelId, deleteCliente);

export default router;
