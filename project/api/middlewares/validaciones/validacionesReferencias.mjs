import { celebrate, Joi, Segments } from "celebrate";

export const validarReferencias = celebrate({
  [Segments.BODY]: Joi.object({
    nombre: Joi.string().min(1).max(100).required(),
    descripcion: Joi.string().min(8).max(255).required(),
  }),
});

export const validarReferenciaId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
