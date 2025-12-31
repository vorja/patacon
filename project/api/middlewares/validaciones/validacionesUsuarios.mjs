import { celebrate, Joi, Segments } from "celebrate";

export const validarUsuario = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@_\-*!\.]{8,}$/)
      .required(),
    id_rol: Joi.number().required(),
  }),
});

export const validarUsuarioEdit = celebrate({
  [Segments.BODY]: Joi.object().keys({
    nombre: Joi.string().min(3).required(),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@_\-*!\.]{8,}$/)
      .required(),
    id_rol: Joi.number().required(),
  }),
});
export const validarUsuarioId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().guid().required(),
  }),
});
