// routes/rolRoutes.js
import express from "express";

import {
  deleteSesion,
  getSessions,
} from "../../controllers/data/registroSesiones.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";
const router = express.Router();

router.use(verificarACL);

router.get("/obtener", verificarToken, getSessions);
router.delete("/finalizar/:id", verificarToken, deleteSesion);

export default router;
