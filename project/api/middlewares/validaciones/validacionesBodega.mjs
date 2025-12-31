import { celebrate, Joi, Segments } from "celebrate";

export const validarOrdenlId = celebrate({
  [Segments.PARAMS]: Joi.object({
    orden: Joi.number().required(),
  }),
});
