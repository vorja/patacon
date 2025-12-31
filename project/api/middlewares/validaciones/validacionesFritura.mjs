import { celebrate, Joi, Segments } from "celebrate";

export const validarFritura = celebrate({
  [Segments.BODY]: Joi.object({
    fecha: Joi.string()
      .required()
      .messages({
        "string.pattern.base": "Debe ser formato YYYY-MM-DD (año-mes-dia)",
      }),
    producto: Joi.string().required(),
    aforo_aceite: Joi.number().required(),
    lote_aceite: Joi.string().required(),
    gas_inicio: Joi.number().required(),
    gas_final: Joi.number().required(),
    inicio_fritura: Joi.string().required(),
    fin_fritura: Joi.string().required(),
    migas_fritura: Joi.number().required(),
    rechazo_fritura: Joi.number().required(),
    materia_fritura: Joi.number().required(),
    canastillas: Joi.number().required(),
    inventario_aceite: Joi.number().required(),
    observaciones: Joi.string().allow("").optional(),
    lotes: Joi.array().required(),
    infoProveedores: Joi.array().required(),
    recepciones: Joi.array().required(),
    orden: Joi.number().required(),
    id_responsable: Joi.string().guid().required(),
  }).required(),
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
        "string.pattern.base": "Debe ser formato YYYY-MM (año-mes)",
      }),
  }),
});

export const validarParamsIds = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
