import { Op } from "sequelize";
import Referencias from "../models/referencias.mjs";

export const create = async (data) => await Referencias.create(data);

export const getAll = async () => {
  const lista = await Referencias.findAll({
    where: { [Op.or]: [{ estado: 1 }] },
  });

  if (lista.length == 0)
    throw new Error("No hay Registros de Referencias Disponibles.");

  const conteoReferencias = await Referencias.count({ where: { estado: 1 } });
  const referencias = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Descripcion: op.descripcion,
  }));

  return {
    referencias: referencias,
    conteoReferencias,
  };
};

export const getById = async (id) => await Referencias.findByPk(id);

export const update = async (id, data) => {
  const referencia = await getById(id);
  if (!referencia) throw new Error("Referencia no encontrado");
  return await referencia.update(data);
};

export const statusDelete = async (id) => {
  const referencia = await getById(id);
  if (!referencia) throw new Error("Referencia no encontrado");
  return await referencia.update({ estado: 0 });
};
