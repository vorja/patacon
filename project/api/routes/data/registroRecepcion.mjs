import express from "express";
import {
  createRegistroRecepcionMateriaPrima,
  getRecepcionMateriaPrimaBydOrden,
  getProveedorRecepcionByIdOrdenProduccion,
  getRegistroRecepcionMateriaPrimaById,
  updateRegistroRecepcionMateriaPrima,
  deleteRegistroRecepcionMateriaPrima,
} from "../../controllers/data/registrtoRecepcion.mjs";
import {
  validarParams,
  validarId,
  validarRecepcion,
} from "../../middlewares/validaciones/validacionesRecepcion.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
const router = express.Router();

router.use(verificarACL);
// Define rutas para el modelo RegistroRecepcionMateriaPrima
router.post(
  "/crear",
  verificarToken,
  validarRecepcion,
  createRegistroRecepcionMateriaPrima
); // Crear un nuevo registro de recepción de materia prima.
router.post(
  "/crear/sobrante",
  verificarToken,
  createRegistroRecepcionMateriaPrima
); // Crear un nuevo registro de recepción de materia prima que sobro del dia anterior.
router.get(
  "/obtener/:id",
  verificarToken,
  validarId,
  getRecepcionMateriaPrimaBydOrden
); // Obtener todos los registros de recepción de materia prima por Orden
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarId,
  getRegistroRecepcionMateriaPrimaById
); // Obtener 1 registro de recepción de materia prima por ID del registro.
router.get(
  "/obtener-proveedor-recepcion-Day/:fecha/:id/:modulo",
  verificarToken,
  validarParams,
  getProveedorRecepcionByIdOrdenProduccion
); //Obtiene los proveedores de recepción de materia prima por ID de orden de producción.(Alistamiento,Fritura, Corte)
router.put(
  "/editar/:id",
  verificarToken,
  validarId,
  updateRegistroRecepcionMateriaPrima
); // Actualizar un registro de recepción de materia prima por ID
router.delete(
  "/eliminar/:id",
  verificarToken,
  validarId,
  deleteRegistroRecepcionMateriaPrima
); // Eliminar un registro de recepción de materia prima por ID

export default router;
