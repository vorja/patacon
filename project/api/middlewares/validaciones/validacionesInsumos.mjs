import { celebrate, Joi, Segments } from "celebrate";

export const validarInsumo = celebrate({
  [Segments.BODY]: Joi.object({
    fecha: Joi.date().required(),
    fechaVencimiento: Joi.date().required(),
    cantidad: Joi.number().required(),
    cantidad_def: Joi.number().required(),
    defectos: Joi.string().min(4).max(255).required(),
    id_item: Joi.number().required(),
    id_proveedor: Joi.number().required(),
    id_responsable: Joi.string().guid().required(),
    lote: Joi.string().min(4).max(255).required(),
    area: Joi.string().min(4).max(255).required(),
    olor: Joi.string().min(2).max(255).required(),
    color: Joi.string().min(2).max(8).required(),
    estado_fisico: Joi.string().min(2).max(8).required(),
  }),
});

export const validarInsumoId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }),
});
