import { col, Op, fn, where } from "sequelize";
import Responsable from "../models/responsable.mjs";
import Proveedor from "../models/proveedores.mjs";
import Produccion from "../models/produccion.mjs";
import ControlAlistamiento from "../models/controlAlistamiento.mjs";
import DetalleAlistamiento from "../models/detalleAlistamiento.mjs";
import AlistamientoHasProveedor from "../models/alistamientosHasProveedor.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import InventarioPlatanoMaduro from "../models/inventarioPlatanoMaduro.mjs";
import sequelize from "../config/database.mjs";

// En services/recepcionService.mjs - AÑADIR ESTA FUNCIÓN

export const restarCantidad = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const { cantidad_restar_kg, motivo, id_proveedor, fecha_resta } = data;

    // Buscar el registro de recepción
    const registro = await RegistroRecepcionMateriaPrima.findOne({
      where: {
        id: id,
        id_proveedor: id_proveedor,
      },
      transaction
    });

    if (!registro) {
      throw new Error("Registro de recepción no encontrado");
    }

    // Calcular nueva cantidad
    const nuevaMateriaRecep = registro.materia_recep - cantidad_restar_kg;
    const nuevaCantidad = registro.cantidad - cantidad_restar_kg;

    // Preparar observaciones
    const observacionNueva = `${fecha_resta}: ${motivo} (${cantidad_restar_kg} kg)`;
    const observacionesActualizadas = registro.observaciones 
      ? `${registro.observaciones} | ${observacionNueva}`
      : observacionNueva;

    // Actualizar el registro
    await registro.update({
      materia_recep: nuevaMateriaRecep,
      cantidad: nuevaCantidad,
      observaciones: observacionesActualizadas,
      estado_alistamiento: nuevaMateriaRecep === 0 ? 0 : registro.estado_alistamiento
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      data: {
        id: registro.id,
        id_proveedor: registro.id_proveedor,
        materia_actual: nuevaMateriaRecep,
        cantidad_actual: nuevaCantidad
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const create = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const { proveedores, detalles, recepciones, ...registroAlismiento } = data;
    // Insertamos el registro principal
    const controlAlistamiento = await ControlAlistamiento.create(
      registroAlismiento,
      { transaction },
    );

    if (!controlAlistamiento || !controlAlistamiento.id) {
      throw new Error("No se pudo crear el registro principal");
    }

    const proveedoresInsert = [];

    for (const proveedor of proveedores) {
      const proveedoreConId = {
        ...proveedor,
        id_alistamiento: controlAlistamiento.id,
      };
      const detalleInsertado = await AlistamientoHasProveedor.create(
        proveedoreConId,
        { transaction },
      );
      proveedoresInsert.push(detalleInsertado);
    }

    for (const detalle of detalles) {
      const deatlleConId = {
        ...detalle,
        id_alistamiento: controlAlistamiento.id,
      };
      const detalleInsertado = await DetalleAlistamiento.create(deatlleConId, {
        transaction,
      });
      proveedoresInsert.push(detalleInsertado);
    }

    // Actualizamos inventario de plano maduro
    const actPlano = await updatePlano(proveedores, controlAlistamiento);

    // Actualizamos registro de recepción
    const actualizarRecepcion = await updateRecepcion(recepciones);

    await transaction.commit();
    return { controlAlistamiento };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

// Trae todos los registros de recpcion por contenedor.
export const getAll = async (orden) => {
  const ordenProduccion = await Produccion.findOne({
    where: {
      id: orden,
    },
  });

  if (!ordenProduccion) throw new Error("La orden no existe.");

  try {
    const controlAlistamiento = await ControlAlistamiento.findAll({
      where: {
        orden: orden,
      },
    });

    if (controlAlistamiento.length == 0) {
      throw new Error("Control de Alistamiento no encontrado");
    }

    const promedios = await ControlAlistamiento.findAll({
      attributes: [
        [fn("SUM", col("maduro")), "maduro"],
        [fn("SUM", col("rechazo")), "rechazo"],
        [fn("SUM", col("total")), "total"],
      ],
      where: {
        orden: orden,
      },
      raw: true,
    });

    const alistamientos = controlAlistamiento.map((op) => ({
      id: op.id,
      Fecha: op.fecha,
      Maduro: op.maduro,
      Rechazo: op.rechazo,
      Desinfectados: op.recipientes_desinf,
      Total: op.total,
    }));

    const alistamientosDetalles = await Promise.all(
      controlAlistamiento.map(async (alistamiento) => {
        const detalle = await DetalleAlistamiento.findAll({
          include: [
            {
              model: Responsable,
              as: "pelador",
              attributes: ["nombre"],
            },
          ],
          attributes: ["cantidades", "maduro", "rechazo", "id_pelador"],
          where: {
            id_alistamiento: alistamiento.id,
          },
        });

        return {
          ...alistamiento.get({ plain: true }),
          detalle,
        };
      }),
    );

    const acumuladorCantidades = {};
    // Recorrer todos los alistamientos
    alistamientosDetalles.forEach((alistamiento) => {
      alistamiento.detalle.forEach((det) => {
        const idCortador = det.id_pelador;
        const pelador = det.pelador;
        const cantidad = Number(det.cantidades);

        if (!acumuladorCantidades[idCortador]) {
          acumuladorCantidades[idCortador] = {
            sumaCantidades: 0,
            contador: 0,
            pelador: "",
          };
        }

        acumuladorCantidades[idCortador].sumaCantidades += cantidad;
        acumuladorCantidades[idCortador].contador++;
        acumuladorCantidades[idCortador].pelador = pelador;
      });
    });

    // Calcular promedio con base en las cantidades acumuladas
    const promedioPelador = Object.entries(acumuladorCantidades)
      .map(([id_pelador, { sumaCantidades, contador, pelador }]) => ({
        id_pelador,
        pelador: pelador.nombre ?? "",
        promedio: (sumaCantidades / contador).toFixed(1),
        total: sumaCantidades,
      }))
      .sort((a, b) => b.total - a.total); // Ordenar de mayor a menor por total

    return {
      alistamientos,
      promedios,
      promedioPelador,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getById = async (id) => {
  try {
    const controlAlistamiento = await ControlAlistamiento.findOne({
      where: {
        id: id,
      },
    });

    if (!controlAlistamiento) {
      throw new Error("Control de Alistamiento no encontrado");
    }

    const proveedoresAlistamiento = await AlistamientoHasProveedor.findAll({
      include: [
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: {
        id_alistamiento: id,
      },
    });

    const resultado = proveedoresAlistamiento.map((op) => ({
      cantidad: op.cantidad,
      rechazo: op.rechazo,
      maduro: op.maduro,
      lote: op.lote_proveedor,
      nombre: op.proveedor?.nombre ?? "",
    }));

    return {
      registro: controlAlistamiento,
      proveedores: resultado,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getInfoPdf = async (id) => {
  try {
    const controlAlistamiento = await ControlAlistamiento.findOne({
      attributes: ["fecha", "id_responsable", "observaciones"],
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        id: id,
      },
    });

    if (!controlAlistamiento) {
      throw new Error("Control de Alistamiento no encontrado");
    }

    const proveedoresAlistamiento = await AlistamientoHasProveedor.findAll({
      include: [
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: {
        id_alistamiento: id,
      },
    });

    const detalleAlistamiento = await DetalleAlistamiento.findAll({
      include: [
        {
          model: Responsable,
          as: "pelador",
          attributes: ["nombre"],
        },
      ],
      where: {
        id_alistamiento: id,
      },
    });

    const listDetalle = detalleAlistamiento.map((op) => ({
      pelador: op.pelador?.nombre ?? "",
      rondas: op.totales,
      canastillas: op.cantidades,
      rechazo: op.rechazo,
      maduro: op.maduro,
    }));

    const resultado = proveedoresAlistamiento.map((op) => ({
      cantidad: op.cantidad,
      rechazo: op.rechazo,
      maduro: op.maduro,
      lote: op.lote_proveedor,
      proveedor: op.proveedor?.nombre ?? "",
    }));

    const registro = {
      fecha: controlAlistamiento.fecha,
      responsable: controlAlistamiento.responsable?.nombre ?? "",
      observaciones: controlAlistamiento.observaciones,
    };

    return {
      registro,
      proveedores: resultado,
      detalle: listDetalle,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDetalleById = async (data) => {
  try {
    const detalleAlistamiento = await DetalleAlistamiento.findAll({
      include: [
        {
          model: Responsable,
          as: "pelador",
          attributes: ["nombre"],
        },
      ],
      attributes: ["totales", "cantidades", "maduro", "rechazo"],
      where: {
        id_alistamiento: data,
        cantidades: { [Op.gt]: 0 }, 
      },
    });
    const resultado = detalleAlistamiento.map((op) => ({
      totales: op.cantidades,
      cantidad: op.totales,
      maduro: op.maduro,
      rechazo: op.rechazo,
      cortador: op.pelador?.nombre ?? "",
    }));
    return {
      resultado,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Trae la informacion de un Registro de recepción
export const getByIdInfo = async (id) => await ControlAlistamiento.findByPk(id);

export const update = async (id, data) => {
  const registro = await getByIdInfo(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update(data);
};

// Actualizamos el estado del registro en recepcion
export const updateRecepcion = async (data) => {
  const actualizarRecepcion = await RegistroRecepcionMateriaPrima.update(
    { estado_alistamiento: 0 },
    { where: { id: data } },
  );
  return actualizarRecepcion;
};

// Actualizamos el stock de platano maduro de planta.
export const updatePlano = async (proveedor, data) => {
  console.log(data);
  console.log(proveedor);
  await Promise.all(
    proveedor.map(async (item) => {
      const where = { lote_proveedor: item.lote_proveedor };

      const registro = await InventarioPlatanoMaduro.findOne({ where });

      if (!registro) {
        await InventarioPlatanoMaduro.create({
          fecha: data.fecha,
          producto: item.producto,
          lote_proveedor: item.lote_proveedor,
          cantidad: item.maduro,
          id_proveedor: item.id_proveedor,
          estado: 1,
        });
      } else {
        await registro.increment("cantidad", { by: item.maduro });
      }
    }),
  );
};

export const statusDelete = async (id) => {
  const registro = await getByIdInfo(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update({ estado: 0 });
};
