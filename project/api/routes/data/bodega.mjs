// routes/rolRoutes.js
import express from "express";
import {
  getItems,
  getItemLotesById,
  getCajas,
  getCajasLotes,
  getCajasByProduccion,
} from "../../controllers/data/bodega.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.get("/obtener", verificarToken, getItems);
router.get("/obtener-lotes-id/:lote/:id/:tipo", verificarToken, getItemLotesById);

router.get("/info-cajas/:produccion", verificarToken, getCajasByProduccion);
router.get("/obtener-cajas", verificarToken, getCajas);
router.get("/obtener-cajas-lotes", verificarToken, getCajasLotes);

export default router;
