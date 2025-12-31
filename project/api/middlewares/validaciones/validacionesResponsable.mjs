import { celebrate, Joi, Segments } from "celebrate";

export const validarResponsable = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    correo: Joi.string().email().required(),
    identificacion: Joi.string().min(9).max(12).required(),
    telefono: Joi.string().optional(),
    id_rol: Joi.number().required(),
  }),
});

export const validarResponsableEdit = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    correo: Joi.string().email().required(),
    identificacion: Joi.string().min(9).max(12).required(),
    telefono: Joi.string().optional(),
    id_rol: Joi.number().required(),
  }),
});
export const validarResponsableId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().guid().required(),
  }),
});
export const validarNombreRol = celebrate({
  [Segments.PARAMS]: Joi.object({
    nombre: Joi.string().min(4).required(),
  }),
});
