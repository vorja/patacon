import express from "express";
import {
  createRegistroRecepcionMateriaPrimaOp,
  getRegistrosRecepcionMateriaPrimaOp,
  getRegistroRecepcionMateriaPrimaOpById,
  updateRegistroRecepcionMateriaPrimaOp,
  deleteRegistroRecepcionMateriaPrimaOp,
} from "../../controllers/data/resgistroRecepcionOp.mjs";
import {
  validarId,
  validarRecepcion,
} from "../../middlewares/validaciones/validacionesRecepcionOp.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);
// Define rutas para el modelo RegistroRecepcionMateriaPrima
router.post(
  "/crear",
  verificarToken,
  validarRecepcion,
  createRegistroRecepcionMateriaPrimaOp
); // Crear un nuevo registro de recepción de materia prima
router.get(
  "/obtener/:id",
  verificarToken,
  validarId,
  getRegistrosRecepcionMateriaPrimaOp
); // Obtener todos los registros de recepción de materia prima
router.get(
  "/obtener-id/id:",
  verificarToken,
  validarId,
  getRegistroRecepcionMateriaPrimaOpById
); // Obtener un registro de recepción de materia prima por ID

router.put(
  "/editar/:id",
  verificarToken,
  validarId,
  updateRegistroRecepcionMateriaPrimaOp
); // Actualizar un registro de recepción de materia prima por ID
router.delete(
  "/eliminar/:id",
  verificarToken,
  deleteRegistroRecepcionMateriaPrimaOp
); // Eliminar un registro de recepción de materia prima por ID

export default router;
