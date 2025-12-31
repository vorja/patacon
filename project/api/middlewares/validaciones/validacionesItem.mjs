import { celebrate, Joi, Segments } from "celebrate";

export const validarItem = celebrate({
  [Segments.BODY]: Joi.object({
    nombre: Joi.string().min(3).max(100).required(),
    stock: Joi.number().required(),
    id_proveedor: Joi.number().required(),
    medida: Joi.string().min(2).max(255).required(),
    area: Joi.string().min(3).max(255).required(),
  }),
});

export const validarItemId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
