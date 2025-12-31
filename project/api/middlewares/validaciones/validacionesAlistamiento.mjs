import { celebrate, Joi, Segments } from "celebrate";

export const validarAlistamiento = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha: Joi.date().required(),
    maduro: Joi.number().required(),
    rechazo: Joi.number().required(),
    recipientes_desinf: Joi.number().required(),
    orden: Joi.number().required(),
    total: Joi.number().required(),
    observaciones: Joi.string().optional(),
    recepciones: Joi.array().required(),
    detalles: Joi.array().required(),
    proveedores: Joi.array().required(),
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
    orden: Joi.number().required(),
  }),
});
