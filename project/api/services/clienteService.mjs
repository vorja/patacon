import Cliente from "../models/clientes.mjs";

export const create = async (data) => {
  return await Cliente.create(data);
};

export const getAll = async () => {
  const lista = await Cliente.findAll({ where: { estado: 1 } });
  const conteoClientes = await Cliente.count({ where: { estado: 1 } });

  if (lista.length == 0) throw new Error("No hay Clientes Disponibles.");

  const clientes = lista.map((op) => ({
    id: op.id,
    Nombre: op.nombre,
    Numero_solicitud: op.numero_solicitud,
    Destino: op.destino,
    Embarque: op.puerto_embarque,
    LLegada: op.puerto_llegada,
    Estado: op.estado,
  }));

  return { clientes, conteo: conteoClientes };
};

// Obtener un Proveedor por ID
export const getById = async (id) => await Cliente.findByPk(id);

// Actualizar un Proveedor por ID
export const update = async (id, data) => {
  const cliente = await getById(id);
  if (!cliente) throw new Error("Cliente no encontrada o no existe.");
  data.actualizado_en = new Date();
  return await cliente.update(data);
};

// Eliminar un Proveedor por ID
export const statusDelete = async (id) => {
  const cliente = await Cliente.findByPk(id);
  console.log(cliente);
  if (!cliente) throw new Error("Cliente no encontrada.");
  return await cliente.update({
    estado: 0,
  });
};
