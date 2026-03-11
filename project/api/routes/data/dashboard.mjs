// routes/rolRoutes.js
import express from "express";
import {
  getGastoMateria,
  getIndicadoresCalidad,
} from "../../controllers/data/dashboard.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);
router.get("/obtener-materia/:fecha", verificarToken, getGastoMateria);
router.get(
  "/indicadores-calidad/:fecha",
  verificarToken,
  getIndicadoresCalidad,
);
router.get("/obtener-id/:id", verificarToken);

export default router;
