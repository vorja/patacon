import { celebrate, Joi, Segments } from "celebrate";

export const validarCorte = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha: Joi.date().required(),
    rechazo_corte: Joi.number().required(),
    total_materia: Joi.number().required(),
    rendimiento_materia: Joi.number().optional(),
    recepciones: Joi.array().required(),
    detallesCortes: Joi.array().required(),
    proveedores: Joi.array().required(),
    observaciones: Joi.string().optional(),
    id_responsable: Joi.string().guid().required(),
    orden: Joi.number().required(),
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
