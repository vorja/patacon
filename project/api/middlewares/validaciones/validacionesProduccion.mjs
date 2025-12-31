import { celebrate, Joi, Segments } from "celebrate";

export const validarProduccion = celebrate({
  [Segments.BODY]: Joi.object().keys({
    lote_produccion: Joi.string().min(3).required(),
    fecha_creacion: Joi.date().required(),
    fecha_cierre: Joi.date().optional(),
    numero_cajas: Joi.number().integer().min(1).required(),
   /*  detalle: Joi.array(), */
    id_responsable: Joi.string().guid().required(),
  }),
});

export const validarIdRelacion = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});

export const validarProduccionId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
