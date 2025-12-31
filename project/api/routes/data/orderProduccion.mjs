import express from "express";
import {
  createOrdenProduccion,
  getOrdenesProduccion,
  getOrdenProduccionById,
  updateOrdenProduccion,
  deleteOrdenProduccion,
} from "../../controllers/data/ordenProduccion.mjs";

const router = express.Router();

// Define rutas para el modelo OrdenProduccion
router.post("/crear", createOrdenProduccion);           // Crear una nueva orden de producción
router.get("/obtener", getOrdenesProduccion);           // Obtener todas las órdenes de producción
router.get("/obtener-id/:id", getOrdenProduccionById);       // Obtener una orden de producción por ID
router.put("/editar/:id", updateOrdenProduccion);           // Actualizar una orden de producción por ID
router.delete("/eliminar/:id", deleteOrdenProduccion);      // Eliminar una orden de producción por ID

export default router;