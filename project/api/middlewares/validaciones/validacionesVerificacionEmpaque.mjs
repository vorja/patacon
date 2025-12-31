import { celebrate, Joi, Segments } from "celebrate";

export const validarVerificacion = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha_verficacion: Joi.date().required(),
    observaciones: Joi.string().optional(),
    empaque: Joi.array().required(),
    paquetes: Joi.array().required(),
    id_responsable: Joi.string().guid().required(),
  }),
});

export const validarId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});

export const validarParams = celebrate({
  [Segments.PARAMS]: Joi.object({
    fecha: Joi.string()
      .required()
      .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
      .messages({
        "string.pattern.base": "Debe ser formato YYYY-MM-D (año-mes-dia)",
      }),
  }),
});
