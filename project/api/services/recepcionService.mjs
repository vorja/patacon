import { and, col, fn, Op } from "sequelize";
import Responsable from "../models/responsable.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import RegistroRecepcionOp from "../models/resgistroRecepcionOp.mjs";
import DetalleRecepcion from "../models/detalleRecepcion.mjs";
import Proveedor from "../models/proveedores.mjs";
import Produccion from "../models/produccion.mjs";
import InventarioMateriaPrima from "../models/inventarioMateriaprima.mjs";
import sequelize from "../config/database.mjs";
import InventarioPlatanoMaduro from "../models/inventarioPlatanoMaduro.mjs";

// Trae todos los registros de recepción por contenedor.
export const getAll = async (Orden) => {
  try {
    const ordenProduccion = await Produccion.findByPk(Orden);
    if (!ordenProduccion) throw new Error("Orden de producción no existe.");

    // 1. Primero obtenemos los registros de recepción
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
        estado: { [Op.in]: [1, 0] },
      },
      order: [["fecha", "DESC"]],
    });

    if (registros.length === 0)
      throw new Error("No hay Registros de recepción");

    // 2. Obtenemos los IDs de las recepciones para buscar los detalles
    const recepcionIds = registros.map((registro) => registro.id);

    // 3. Buscamos todos los detalles para estas recepciones
    const detalles = await DetalleRecepcion.findAll({
      where: {
        id_recepcion: {
          [Op.in]: recepcionIds,
        },
      },
      raw: true,
    });

    // 4. Agrupamos los detalles por id_recepcion
    const detallesPorRecepcion = {};
    detalles.forEach((detalle) => {
      if (!detallesPorRecepcion[detalle.id_recepcion]) {
        detallesPorRecepcion[detalle.id_recepcion] = [];
      }
      detallesPorRecepcion[detalle.id_recepcion].push({
        id: detalle.id,
        defecto: detalle.defecto,
        cantidad: detalle.cantidad,
      });
    });

    // 5. Construimos el resultado final
    const resultado = registros.map((op) => ({
      id: op.id,
      Procedimiento: op.fecha_procesamiento,
      Fecha: op.fecha,
      Brix: op.brix,
      Producto: op.producto,
      Total: op.cantidad,
      Lote: op.lote,
      Color: op.color == "si" ? "Sí cumple" : op.color,
      Olor: op.olor == "si" ? "Sí cumple" : op.olor,
      Estado: op.estado_fisico,
      Cumple: op.cumple,
      Cantidad: op.cant_defectos,
      Proveedor: op.proveedor?.nombre ?? "",
      Responsable: op.responsable?.nombre ?? "",
      Detalles: detallesPorRecepcion[op.id] || [], // Aquí agregamos los detalles
    }));

    // 6. Obtenemos los conteos
    const counteos = await RegistroRecepcionMateriaPrima.findAll({
      attributes: [
        [fn("COUNT", col("id")), "recepciones"],
        [fn("COUNT", col("lote")), "lotes"],
        [fn("SUM", col("cant_defectos")), "defectos"],
        [fn("SUM", col("cantidad")), "total"],
      ],
      where: { orden: Orden, estado: { [Op.in]: [1, 0] } },
      raw: true,
    });

    return {
      recepciones: resultado,
      conteos: counteos,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const create = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const { defectos, ...informacion } = data;

    let creado;

    // Registro principal
    const newRegistro = await RegistroRecepcionMateriaPrima.create(
      informacion,
      { transaction },
    );
    if (!newRegistro) {
      throw new Error("No se pudo crear el registro principal.");
    }

    // Determinar el estado basado en la presencia de defectos
    const estado = Array.isArray(defectos) ? 1 : 2;

    // Inventario principal - usar create directamente si estado es 2
    let inventarioRegistro;

    if (estado === 1) {
      // Usar findOrCreate solo para estado 1
      [inventarioRegistro, creado] = await InventarioMateriaPrima.findOrCreate({
        where: {
          fecha_recepcion: informacion.fecha_procesamiento,
          lote_proveedor: informacion.lote,
          producto: informacion.producto,
          id_proveedor: informacion.id_proveedor,
        },
        defaults: {
          fecha_recepcion: informacion.fecha_procesamiento,
          producto: informacion.producto,
          lote_proveedor: informacion.lote,
          materia_recp: informacion.cantidad,
          materia_proceso: informacion.cantidad,
          id_proveedor: informacion.id_proveedor,
          estado: estado,
        },
        transaction,
      });
    }
    const opcional = await RegistroRecepcionOp.findOne({
      where: {
        fecha: informacion.fecha_procesamiento,
        id_proveedor: informacion.id_proveedor,
      },
    });

    if (Array.isArray(defectos)) {
      if (!creado) {
        if (opcional) {
        await inventarioRegistro.increment(
          { materia_proceso: informacion.cantidad },
          { transaction },
        );  
        }
        else {
        await inventarioRegistro.increment(
          { 
            materia_proceso: informacion.cantidad,
            materia_recp: informacion.cantidad 
          },
          { transaction },
        );
      }
      }

      // Inserción de defectos
      const detallesInsertados = await Promise.all(
        defectos.map(async (detalle) => {
          const detalleConId = {
            ...detalle,
            id_recepcion: newRegistro.id,
          };

          const detalleInsertado = await DetalleRecepcion.create(detalleConId, {
            transaction,
          });

          // Condición corregida
          if (
            detalle.defecto === "Platano Maduro" ||
            detalle.defecto === "Maduro"
          ) {
            const [inventarioMaduro, creadoMaduro] =
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

            // Solo incrementar si el registro YA EXISTÍA
            if (!creadoMaduro) {
              await inventarioMaduro.increment(
                { cantidad: detalle.cantidad },
                { transaction },
              );
            }
          }

          return detalleInsertado;
        }),
      );
    }

    await transaction.commit();
    return { newRegistro };
  } catch (error) {
    await transaction.rollback();
    throw error;
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

    if (modulo === "Alistamiento") options.estado_alistamiento = 1;
    if (modulo === "Fritura") options.estado = { [Op.in]: [1, 2] };
    if (modulo === "Corte") options.estado_corte = 1;

    const registros = await RegistroRecepcionMateriaPrima.findAll({
      attributes: [
        "id",
        "fecha",
        "fecha_procesamiento",
        "brix",
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
      order: [["cantidad", "DESC"]], // Ordenar por cantidad de mayor a menor
    });

    if (registros.length === 0)
      throw new Error("No hay Registros de recepcion");

    let resultado;

    if (
      modulo === "Corte" ||
      modulo === "Fritura" ||
      modulo === "Alistamiento"
    ) {
      // Para Corte: agrupar y sumar cantidades, manteniendo todos los IDs
      const agrupados = {};

      registros.forEach((op) => {
        const clave = `${op.fecha}-${op.lote}-${op.producto}-${op.id_proveedor}`;

        if (!agrupados[clave]) {
          agrupados[clave] = {
            id: op.id, // Mantener el primer ID principal
            ids: [op.id], // Array con todos los IDs para actualizar estados
            fecha: op.fecha,
            fecha_procesamiento: op.fecha_procesamiento,
            lote: op.lote,
            cantidad: op.cantidad,
            id_proveedor: op.id_proveedor,
            producto: op.producto,
            proveedor: op.proveedor?.nombre ?? "",
            // Para compatibilidad con el frontend o otras llamadas
            id_recepcion: op.id,
          };
        } else {
          // Sumar la cantidad
          agrupados[clave].cantidad += op.cantidad;
          // Agregar el ID al array
          agrupados[clave].ids.push(op.id);
          // Si hay diferentes fechas_procesamiento, mantener la más reciente
          if (op.fecha_procesamiento > agrupados[clave].fecha_procesamiento) {
            agrupados[clave].fecha_procesamiento = op.fecha_procesamiento;
          }
        }
      });

      resultado = Object.values(agrupados);
    } else {
      resultado = registros.map((op) => ({
        id: op.id,
        fecha: op.fecha,
        fecha_procesamiento: op.fecha_procesamiento,
        lote: op.lote,
        cantidad: op.cantidad,
        id_proveedor: op.id_proveedor,
        producto: op.producto,
        proveedor: op.proveedor?.nombre ?? "",
      }));
    }

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
