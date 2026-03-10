// routes/rolRoutes.js
import express, { Router } from "express";
import {
  createProduccion,
  asigCajasProduccion,
  getProduccion,
  getProduccionById,
  getPerformanceProduccion,
  getPerformanceGeneralProduccion,
  getPerformanceAnualProduccion, 
  getPerformanceAnioEspecifico, 
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

// ============= POST ROUTES =============
router.post("/crear", verificarToken, validarProduccion, createProduccion);
router.post("/asig-cajas", verificarToken, asigCajasProduccion);

// ============= GET ROUTES =============
router.get("/obtener", verificarToken, getProduccion);
router.get("/obtener-producciones", verificarToken, getProduccionesProcesos);

// Rendimientos
router.get(
  "/obtener-performance/:orden",
  verificarToken,
  getPerformanceProducciones,
); // Rendimientos diarios de un contenedor

// Rendimiento GENERAL de un contenedor específico
router.get(
  "/performance-general/:orden",
  verificarToken,
  getPerformanceGeneralProduccion,
);

// Rendimiento GENERAL del año actual
router.get("/performance-anual", verificarToken, getPerformanceAnualProduccion);

// Rendimiento GENERAL de un año específico
router.get(
  "/performance-anual/:año",
  verificarToken,
  getPerformanceAnioEspecifico,
);

router.get("/performance/:fecha", verificarToken, getPerformanceProduccion); // Rendimiento de 1 día específico

// Información de contenedor y proyecciones
router.get(
  "/proyeccion-contenedor/:id",
  verificarToken,
  getProyeccionesContenedor,
);

router.get("/container-info/:orden", verificarToken, getInfoContainer);

// Información de proveedores
router.get("/proveedor-historial/:id", verificarToken, getHistorialProveedor);

router.get("/proveedor-info/:id/:fecha", verificarToken, getInfoProveedor);

// Obtener por ID
router.get(
  "/obtener-id/:id",
  verificarToken,
  validarProduccionId,
  getProduccionById,
);

// ============= PUT ROUTES =============
router.put(
  "/editar/:id",
  verificarToken,
  validarProduccionId,
  validarProduccion,
  updateProduccion,
);

// ============= DELETE ROUTES =============
router.delete(
  "/finalizar/:id",
  verificarToken,
  validarProduccionId,
  finalizarProduccion,
);

router.delete(
  "/eliminar/:id",
  verificarToken,
  validarProduccionId,
  deleteProduccion,
);

export default router;
