import express from "express";
import {
  getItems,
  getItemLotesById,
  getCajas,
  getCajasLotes,
  getCajasByProduccion,
  getCajasProveedor,
  updateInventario,
  registrarEnvioSobrantes,
  getHistorialEnvios,
  getHistorialSobrantes,
  getDatosPdf,
} from "../../controllers/data/bodega.mjs";

import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.get("/obtener/:orden", verificarToken, getItems);
router.get("/obtener-lotes-id/:lote/:id/:tipo", verificarToken, getItemLotesById,);
router.get("/info-cajas/:produccion", verificarToken, getCajasByProduccion);

router.get("/info-cajas-proveedor/:orden", verificarToken, getCajasProveedor);

router.get("/obtener-cajas/:orden", verificarToken, getCajas);
router.get("/obtener-cajas-lotes/:orden", verificarToken, getCajasLotes);

// Añade esta nueva ruta para update
router.put("/update", verificarToken, updateInventario);

router.post("/registrar-envio", verificarToken, registrarEnvioSobrantes);

router.get("/historial-envios/:orden", verificarToken, getHistorialEnvios);

router.post("/historial-sobrante/:orden", verificarToken, getHistorialSobrantes);

router.get("/datos/:orden", verificarToken, getDatosPdf)

export default router;
