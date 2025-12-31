import { celebrate, Joi, Segments } from "celebrate";

export const validarRecepcion = celebrate({
  [Segments.BODY]: Joi.object().keys({
    fecha: Joi.date().required(),
    fecha_procesamiento: Joi.date().required(),
    producto: Joi.string().required(),
    materia_recep: Joi.number().required(),
    cantidad: Joi.number().required(),
    lote: Joi.string().required(),
    olor: Joi.string().optional(),
    color: Joi.string().optional(),
    estado_fisico: Joi.string().optional(),
    cumple: Joi.string().optional(),
    cant_defectos: Joi.number().required(),
    defectos: Joi.array().required(),
    telefono: Joi.string().optional(),
    orden: Joi.number().required(),
    observaciones: Joi.string().optional(),
    id_responsable: Joi.string().guid().required(),
    id_proveedor: Joi.number().required(),
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
    fecha: Joi.date().required(),
    modulo: Joi.string().required(),
  }),
});
