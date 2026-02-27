import { celebrate, Joi, Segments } from "celebrate";

export const validarProveedor = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    identificacion: Joi.string().min(6).max(20).required(),
    movil: Joi.string().min(6).max(100).required(),
  }),
});
export const validarProveedorId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
