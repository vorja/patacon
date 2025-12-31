// middlewares/validaciones/login.js
import { celebrate, Joi, Segments } from "celebrate";

export const validarLogin = celebrate({
  [Segments.BODY]: Joi.object({
    user_name: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
  }),
});
