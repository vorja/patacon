import { celebrate, Joi, Segments } from "celebrate";

export const validarCuarto = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha_mes: Joi.string()
      .required()
      .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
      .messages({
        "string.pattern.base": "Debe ser formato YYYY-MM (año-mes)",
      }),
    cuarto: Joi.object().required(),
  }),
});

export const validarId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});

export const validarParams = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
    fecha: Joi.string()
      .required()
      .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
      .messages({
        "string.pattern.base": "Debe ser formato YYYY-MM (año-mes)",
      }),
  }),
});
