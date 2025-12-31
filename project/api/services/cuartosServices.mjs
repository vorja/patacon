import Cuartos from "../models/cuartos.mjs"; // Adjust the path according to your file structure
export const create = async (data) => {
  const cuarto = await Cuartos.create(data);
  if (!cuarto) {
    throw new Error("No se pudo registrar el cuarto.");
  }
  return cuarto;
};

export const getAll = async () => {
  const cuartos = await Cuartos.findAll({
    where: {
      estado: 1,
    },
  });
  if (cuartos.length == 0) {
    throw new Error("No hay Cuartos disponibles.");
  }

  return { cuartos: cuartos };
};

export const getById = async (id) => {
  const cuarto = await Cuartos.findByPk(id);
  if (!cuarto) {
    throw new Error("Cuarto no encontrado.");
  }

  return cuarto;
};

export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update({ estado: 0 });
};
