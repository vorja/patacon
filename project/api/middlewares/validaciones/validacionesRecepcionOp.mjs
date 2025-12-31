import { celebrate, Joi, Segments } from "celebrate";

export const validarRecepcion = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha: Joi.date().required(),
    fecha_procedimiento: Joi.date().required(),
    variedad: Joi.string().required(),
    lote: Joi.string().required(),
    total_canastillas: Joi.number().required(),
    sub_total: Joi.number().required(),
    peso_total: Joi.number().required(),
    orden: Joi.number().required(),
    observaciones: Joi.string().optional(),
    recepcion: Joi.array().required(),
    id_responsable: Joi.string().guid().required(),
    id_proveedor: Joi.number().required(),
  }),
});

export const validarId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
