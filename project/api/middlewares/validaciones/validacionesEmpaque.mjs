import { celebrate, Joi, Segments } from "celebrate";

export const validarEmpaque = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha_empaque: Joi.date().required(),
    lote_empaque: Joi.string().required(),
    numero_canastas: Joi.number().required(),
    rechazo_empaque: Joi.number().required(),
    migas_empaque: Joi.number().required(),
    total_cajas: Joi.number().required(),
    promedio_peso: Joi.number().required(),
    peso_kg: Joi.number().required(),
    orden: Joi.number().required(),
    cajas: Joi.array().required(),
    infoEmpaque: Joi.array().required(),
    proveedores: Joi.array().required(),
    observaciones: Joi.string().required(),
    id_responsable: Joi.string().guid().required(),
  }),
});

export const validarId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});

export const validarFecha = celebrate({
  [Segments.PARAMS]: Joi.object({
    fecha: Joi.string()
      .required()
      .pattern(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/)
      .messages({
        "string.pattern.base": "Debe ser formato YYYY-MM (año-mes-dia)",
      }),
  }),
});
