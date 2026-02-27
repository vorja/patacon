import express from "express";
import {
  getItems,
  getDetalleMateria,
  getDetalleMaduro,
} from "../../controllers/data/materiaPrima.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.get("/obtener", verificarToken, getItems);

router.get("/detalle/materia/:id", verificarToken, getDetalleMateria); // Detalle de materia prima
router.get("/detalle/maduro/:id", verificarToken, getDetalleMaduro); // Detalle de plátano maduro

export default router;
