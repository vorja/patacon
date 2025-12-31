import { celebrate, Joi, Segments } from "celebrate";

export const validarCuarto = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    descripcion: Joi.string().min(3).required()
  }),
});
export const validarCuartolId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
