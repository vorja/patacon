import Joi from "joi";

// Validar ID
export const validarId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "ID inválido o no proporcionado",
    });
  }

  req.params.id = parseInt(id);
  next();
};

// Esquema de validación para creación/actualización
export const validarLoteFritura = (req, res, next) => {
  const schema = Joi.object({
    fecha_produccion: Joi.date().required(),
    lote_produccion: Joi.string().max(50).required(),
    tipo: Joi.string().max(10).required(),
    canastas: Joi.number().integer().min(1).required(),
    cantidad_kg: Joi.number().min(0).required(),
    estado: Joi.number().integer().min(0).max(1).default(1),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};
