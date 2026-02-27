// services/lotesFrituraService.mjs
import LotesFritura from "../models/lotesFritura.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";
import sequelize from "../config/database.mjs"; // Agregar esta línea

export const getAll = async (filtros = {}) => {
  try {
    const whereClause = { estado: 1 };

    if (filtros.fecha) {
      whereClause.fecha_produccion = filtros.fecha;
    }
    if (filtros.tipo) {
      whereClause.tipo = filtros.tipo;
    }
    if (filtros.lote) {
      whereClause.lote_produccion = filtros.lote;
    }

    const registros = await LotesFritura.findAll({
      where: whereClause,
      attributes: {
        exclude: ['id_fritura'], // Excluye id_fritura
        include: [
          [sequelize.col('registroFritura.producto'), 'producto'] // Agrega producto
        ]
      },
      include: [
        {
          model: RegistroAreaFritura,
          as: "registroFritura",
          attributes: [], // No traer atributos anidados
        },
      ],
      order: [["fecha_produccion", "DESC"]],
      raw: true, // Importante para aplanar el resultado
    });

    if (registros.length === 0) {
      throw new Error("No hay registros de lotes de fritura disponibles.");
    }

    return registros;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllWithoutFilters = async () => {
  try {
    const registros = await LotesFritura.findAll({
      attributes: {
        exclude: ['id_fritura'],
        include: [
          [sequelize.col('registroFritura.producto'), 'producto']
        ]
      },
      include: [
        {
          model: RegistroAreaFritura,
          as: "registroFritura",
          attributes: [],
        },
      ],
      order: [["fecha_produccion", "DESC"]],
      raw: true,
    });
    
    return registros;
  } catch (error) {
    console.error("Error en getAllWithoutFilters:", error);
    throw new Error(error.message);
  }
};
// ... resto del código
export const create = async (data) => {
  const registro = await LotesFritura.create(data);
  if (!registro) {
    throw new Error("No se pudo crear el registro de lote de fritura");
  }
  return registro;
};

export const getById = async (id) => await LotesFritura.findByPk(id);

export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registro de lote no encontrado");
  return await registro.update(data);
};

export const deleteLogical = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registro de lote no encontrado");
  return await registro.update({ estado: 0 });
};

export const searchByLote = async (lote) => {
  const registro = await LotesFritura.findOne({
    where: {
      lote_produccion: lote,
      estado: 1,
    },
  });

  if (!registro) {
    throw new Error(`Lote ${lote} no encontrado`);
  }

  return registro;
};
