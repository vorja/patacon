import Configuracion from "../models/configuracion.mjs"; // Ajusta la ruta según tu estructura de archivos
import Responsable from "../models/responsable.mjs"; // Ajusta la ruta según tu estructura de archivos
import Produccion from "../models/produccion.mjs";

export const getAll = async () => {
  const configuracion = await Configuracion.findOne();

  if (!configuracion) {
    throw new Error("Orden no encontrada");
  }
  const ordenActualId = configuracion.orden_actual;
  const ordenProduccion = await Produccion.findByPk(ordenActualId, {
    include: {
      model: Responsable,
      as: "responsable",
      attributes: ["nombre", "correo", "telefono"],
    },
  });
  return { ordenProduccion };
};

export const getById = async () => {
  const configuracion = await Configuracion.findAll();
  if (configuracion.length == 0)
    throw new Error("No hay una configuracion establecida.");

  const produccion = await Produccion.findOne({
    id: configuracion.orden_actual,
  });

  if (!produccion) throw new Error("La orden no existe.");

  return {
    configuracion,
  };
};

export const update = async (data) => {
  console.log("ID recibido en el servicio:", data);

  // Buscar la producción actual
  const produccion = await Produccion.findOne({ where: { id: data.id } });
  if (!produccion) {
    throw new Error("Contenedor no encontrado");
  }

  // Buscar configuración
  let configuracion = await Configuracion.findOne();

  // Si no existe, crearla
  if (!configuracion) {
    configuracion = await Configuracion.create({
      orden_actual: data.id,
    });

    // Primera vez -> cambiar estado a "En Proceso"
    produccion.estado_sincronizado = 2;
    await produccion.save();

    return configuracion;
  }

  // Buscar producción anterior si existe
  let produccionAnterior = null;

  if (configuracion.orden_actual) {
    produccionAnterior = await Produccion.findOne({
      where: { id: configuracion.orden_actual },
    });
  }

  // Actualizar orden actual
  configuracion.orden_actual = data.id;

  const estadoMap = {
    1: "Pendiente",
    2: "En Proceso",
    3: "Finalizado",
  };

  const estadoActual =
    estadoMap[produccion.estado_sincronizado] || "Desconocido";

  // Cambios según estado
  switch (estadoActual) {
    case "Pendiente":
      produccion.estado_sincronizado = 2; // En Proceso

      if (produccionAnterior) {
        produccionAnterior.estado_sincronizado = 1; // Pendiente
        await produccionAnterior.save();
      }

      break;

    case "En Proceso":
      produccion.estado_sincronizado = 3; // Finalizado
      break;

    default:
      break;
  }

  await produccion.save();
  return await configuracion.save();
};
