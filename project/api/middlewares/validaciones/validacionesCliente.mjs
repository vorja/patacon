import { celebrate, Joi, Segments } from "celebrate";

export const validarCliente = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    destino: Joi.string().min(3).required(),
    puerto_embarque: Joi.string().min(3).required(),
    puerto_llegada: Joi.string().min(3).required(),
  }),
});
export const validarClientelId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
