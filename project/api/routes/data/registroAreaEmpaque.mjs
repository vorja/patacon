import express from "express";
import {
  createRegistroAreaEmpaque,
  getRegistroAreaEmpaqueById,
  getRegistroCajasEmpaque,
  getRegistrosEmpaqueByOrden,
  getDetalleEmpaqueById,
  getRegistrosEmpaqueMonth,
  updateRegistroAreaEmpaque,
  deleteRegistroAreaEmpaque,
} from "../../controllers/data/registroAreaEmpaque.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
import {
  validarEmpaque,
  validarId,
  validarFecha,
} from "../../middlewares/validaciones/validacionesEmpaque.mjs";

const router = express.Router();
router.use(verificarACL);

// Define rutas para el modelo RegistroAreaEmpaque.
router.post(
  "/crear",
  verificarToken,
  validarEmpaque,
  createRegistroAreaEmpaque
); // Crear un nuevo registro de área de empaque.
router.get(
  "/obtener-empaques-orden/:id",
  verificarToken,
  validarId,
  getRegistrosEmpaqueByOrden
); // Obtener todos los registros de área de empaque según la orden de produccion (Dashboard).
router.get(
  "/obtenerid/:id",
  verificarToken,
  validarId,
  getRegistroAreaEmpaqueById
); // Obtener un registro de área de empaque por ID.

router.get(
  "/obtener-detalle-id/:id",
  verificarToken,
  validarId,
  getDetalleEmpaqueById
); // Obtener un registro de área de empaque por ID.
router.get(
  "/obtener-lotes-fritura-Day/:fecha",
  verificarToken,
  validarFecha,
  getRegistroCajasEmpaque
); // Obtiene los registros de empaque, por fecha de produccion. (Produccion).
router.get(
  "/obtener-empaques-month/:fecha",
  verificarToken,
  getRegistrosEmpaqueMonth
); //Obtiene los registros de empaque por mes. (Dashboard)
router.put("/editar/:id", verificarToken, validarId, updateRegistroAreaEmpaque); // Actualizar un registro de área de empaque por ID.
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteRegistroAreaEmpaque
); // Eliminar un registro de área de empaque por ID.

export default router;
