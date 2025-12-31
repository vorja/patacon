// routes/configuracionRoutes.js
import express from "express";
import {
  cambiarOrden,
  leerIdOrden,
  leerOrden,
} from "../../controllers/data/configuracion.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();

router.use(verificarACL);
router.put("/editar", verificarToken, cambiarOrden);
router.get("/obtener", verificarToken, leerOrden);
router.get("/leer", verificarToken, leerIdOrden);
export default router;
