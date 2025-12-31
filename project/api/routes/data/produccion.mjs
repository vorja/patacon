// routes/rolRoutes.js
import express, { Router } from "express";
import {
  createProduccion,
  asigCajasProduccion,
  getProduccion,
  getProduccionById,
  getPerformanceProduccion,
  updateProduccion,
  deleteProduccion,
  finalizarProduccion,
  getPerformanceProducciones,
  getProduccionesProcesos,
  getInfoContainer,
  getInfoProveedor,
  getHistorialProveedor,
  getProyeccionesContenedor,
} from "../../controllers/data/produccion.mjs";
import {
  validarProduccion,
  validarProduccionId,
} from "../../middlewares/validaciones/validacionesProduccion.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
const router = express.Router();
//Verificamos los permisos ACL
router.use(verificarACL);

router.post("/crear", verificarToken, validarProduccion, createProduccion);
router.post("/asig-cajas", verificarToken, asigCajasProduccion);
router.get("/obtener", verificarToken, getProduccion);
router.get("/obtener-producciones", verificarToken, getProduccionesProcesos); // Obtener todas las producciones.
router.get(
  "/obtener-performance/:orden",
  verificarToken,
  getPerformanceProducciones
); // Obtenermos los rendimientos de las producciones diarias del contenedor.
router.get(
  "/proyeccion-contenedor/:id",
  verificarToken,
  getProyeccionesContenedor
); // Obtenemos la proyecion
router.get("/performance/:fecha", verificarToken, getPerformanceProduccion); // Obtenenemos el rendimienro de 1 produccion del contenedor.
router.get("/container-info/:orden", verificarToken, getInfoContainer); // Obtenemos los rendimientos de las producciones diarias del contenedor.
router.get("/proveedor-historial/:id", verificarToken, getHistorialProveedor); // Obtenermos los rendimientos de las producciones diarias del contenedor.
router.get("/proveedor-info/:id/:fecha", verificarToken, getInfoProveedor); // Obtenermos los rendimientos de las producciones diarias del contenedor.
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarProduccionId,
  getProduccionById
);
router.put(
  "/editar/:id",
  verificarToken,
  validarProduccionId,
  validarProduccion,
  updateProduccion
);

router.delete(
  "/finalizar/:id",
  verificarToken,
  validarProduccionId,
  finalizarProduccion
);

router.delete(
  "/eliminar/:id",
  verificarToken,
  validarProduccionId,
  deleteProduccion
);

export default router;
