// routes/rolRoutes.js
import express from "express";
import { getItems } from "../../controllers/data/materiaPrima.mjs";
import { verificarACL } from "../../middlewares/acl.mjs";
import { verificarToken } from "../../middlewares/auth/auth.mjs";

const router = express.Router();
router.use(verificarACL);

router.get("/obtener", verificarToken, getItems);

export default router;
