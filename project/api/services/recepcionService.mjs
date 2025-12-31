import { col, fn, Op } from "sequelize";
import Responsable from "../models/responsable.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import DetalleRecepcion from "../models/detalleRecepcion.mjs";
import Proveedor from "../models/proveedores.mjs";
import Produccion from "../models/produccion.mjs";
import InventarioMateriaPrima from "../models/inventarioMateriaprima.mjs";
import sequelize from "../config/database.mjs";
import InventarioPlatanoMaduro from "../models/inventarioPlatanoMaduro.mjs";

export const create = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const { defectos, ...informacion } = data;

    /*  if (!defectos || !Array.isArray(defectos) || defectos.length === 0) {
      throw new Error(
        "El array 'defectos' es requerido y no puede estar vacío."
      );
    } */

    // Registro principal
    const newRegistro = await RegistroRecepcionMateriaPrima.create(
      informacion,
      { transaction }
    );
    if (!newRegistro) {
      throw new Error("No se pudo crear el registro principal.");
    }

    // Inventario principal
    const [inventarioRegistro] = await InventarioMateriaPrima.findOrCreate({
      where: {
        fecha_recepcion: informacion.fecha_procesamiento,
        lote_proveedor: informacion.lote,
        producto: informacion.producto,
      },
      defaults: {
        fecha_recepcion: informacion.fecha_procesamiento,
        producto: informacion.producto,
        lote_proveedor: informacion.lote,
        materia_recp: 0,
        materia_proceso: informacion.cantidad,
        id_proveedor: informacion.id_proveedor,
        estado: 1,
      },
      transaction,
    });

    await inventarioRegistro.update(
      { materia_proceso: informacion.cantidad },
      { transaction }
    );

    // Inserción de defectos
    if (defectos.length > 0) {
      const detallesInsertados = await Promise.all(
        defectos.map(async (detalle) => {
          const detalleConId = {
            ...detalle,
            id_recepcion: newRegistro.id,
          };

          const detalleInsertado = await DetalleRecepcion.create(detalleConId, {
            transaction,
          });

     /*      console.log("detalle: ", detalle); */
          // Condición corregida
          if (
            detalle.defecto === "Platano Maduro" ||
            detalle.defecto === "Maduro"
          ) {
            const [inventarioMaduro] =
              await InventarioPlatanoMaduro.findOrCreate({
                where: { lote_proveedor: informacion.lote },
                defaults: {
                  fecha: informacion.fecha_procesamiento,
                  producto: informacion.producto,
                  lote_proveedor: informacion.lote,
                  cantidad: detalle.cantidad,
                  id_proveedor: informacion.id_proveedor,
                  estado: 1,
                },
                transaction,
              });

            await inventarioMaduro.update(
              { cantidad: detalle.cantidad },
              { transaction }
            );
          }

          return detalleInsertado;
        })
      );
    }

    await transaction.commit();

    return { newRegistro };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Trae todos los registros de recpcion por contenedor.
export const getAll = async (Orden) => {
  try {
    const ordenProduccion = await Produccion.findByPk(Orden);
    if (!ordenProduccion) throw new Error("Orden de producción no existe.");
    const registros = await RegistroRecepcionMateriaPrima.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre"],
        },
      ],
      where: {
        orden: Orden,
      },
    });

    if (registros.length === 0)
      throw new Error("No hay Registros de recepcion");

    const counteos = await RegistroRecepcionMateriaPrima.findAll({
      attributes: [
        [fn("COUNT", col("id")), "recepciones"],
        [fn("COUNT", col("lote")), "lotes"],
        [fn("SUM", col("cant_defectos")), "defectos"],
        [fn("SUM", col("cantidad")), "total"],
      ],
      where: { orden: Orden },
      raw: true,
    });

    const resultado = registros.map((op) => ({
      id: op.id,
      Procedimiento: op.fecha_procesamiento,
      Fecha: op.fecha,
      Producto: op.producto,
      Total: op.cantidad,
      Lote: op.lote,
      Color: op.color == "si" ? "Sí cumple" : op.color,
      Olor: op.olor == "si" ? "Sí cumple" : op.color,
      Estado: op.estado_fisico,
      Cumple: op.cumple,
      Cantidad: op.cant_defectos,
      Proveedor: op.proveedor?.nombre ?? "",
      Responsable: op.responsable?.nombre ?? "",
    }));

    return {
      recepciones: resultado,
      conteos: counteos,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retorna una lista de los "proveedores", que se registraron en el dia de producción.
export const getAllProveedores = async (Orden, fecha, modulo) => {
  const modulos = ["Alistamiento", "Fritura", "Corte"];
  const options = { fecha: fecha, orden: Orden };
  try {
    const ordenProduccion = await Produccion.findByPk(Orden);
    if (!ordenProduccion) throw new Error("Orden de producción no existe.");

    if (!modulos.includes(modulo)) {
      throw new Error(`No es valido es modulo, para iniciar la busqueda.`);
    }

    if (modulo == "Alistamiento") options.estado_alistamiento = 1;

    if (modulo == "Fritura") options.estado = 1;

    if (modulo == "Corte") options.estado_corte = 1;

    const registros = await RegistroRecepcionMateriaPrima.findAll({
      attributes: [
        "id",
        "fecha",
        "fecha_procesamiento",
        "lote",
        "cantidad",
        "id_proveedor",
        "producto",
      ],
      include: {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
      where: {
        [Op.and]: options,
      },
    });

    if (registros.length === 0)
      throw new Error("No hay Registros de recepcion");

    const resultado = registros.map((op) => ({
      id: op.id,
      fecha: op.fecha,
      lote: op.lote,
      cantidad: op.cantidad,
      id_proveedor: op.id_proveedor,
      producto: op.producto,
      proveedor: op.proveedor.nombre ?? "",
    }));

    return {
      proveedores: resultado,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Trae la informacion de un Registro de recepción
export const getById = async (id) =>
  await RegistroRecepcionMateriaPrima.findByPk(id);

export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update({ estado: 0 });
};
