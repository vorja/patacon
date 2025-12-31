import { col, Op, fn, where } from "sequelize";
import Responsable from "../models/responsable.mjs";
import DetalleAlistamiento from "../models/detalleAlistamiento.mjs";
import ControlAlistamiento from "../models/controlAlistamiento.mjs";
import AlistamientoHasProveedor from "../models/alistamientosHasProveedor.mjs";
import Proveedor from "../models/proveedores.mjs";
import Produccion from "../models/produccion.mjs";

// Trae todos los registros de recpcion por contenedor.
export const getById = async (data) => {
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
export const update = async (id, data) => {
  const registro = await getByIdInfo(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update(data);
};

// Actualizamos el estado del registro en recepcion
export const updateRecepcion = async (data) => {
  const actualizarRecepcion = await RegistroRecepcionMateriaPrima.update(
    { estado_alistamiento: 0 },
    { where: { id: data } }
  );
  return actualizarRecepcion;
};

// actulizamos el stock de platano maduro de planta
export const updatePlano = async (data) => {
  const platanoMaduro = await InventarioPlatanoMaduro.findOne({
    where: { fecha: data.fecha },
  });

  console.log("PLAtaNO: ", platanoMaduro);
  if (!platanoMaduro) {
    const create = await platanoMaduro.create({
      fecha: data.fecha,
      cantidad: data.maduro,
    });
    return create;
  } else {
    let newStock = platanoMaduro.cantidad + data.maduro;
    const actualizacion = await platanoMaduro.update({ cantidad: newStock });
    return actualizacion;
  }
};

export const statusDelete = async (id) => {
  const registro = await getByIdInfo(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update({ estado: 0 });
};
