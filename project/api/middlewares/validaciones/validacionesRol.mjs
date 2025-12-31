import { celebrate, Joi, Segments } from "celebrate";

export const validarRol = celebrate({
  [Segments.BODY]: Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    descripcion: Joi.string().min(8).max(255).required(),
  }),
});

export const validarRolId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
