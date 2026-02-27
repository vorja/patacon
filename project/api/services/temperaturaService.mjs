import { col, fn, Op, literal } from "sequelize";
import moment from "moment";
import dayjs from "dayjs";
import RegistroTemperatura from "../models/registroTemperatura.mjs";
import DetalleTemperatura from "../models/detalleTemperatura.mjs";
import Responsable from "../models/responsable.mjs";
import Cuartos from "../models/cuartos.mjs";

export const create = async (data) => {
  const { cuarto, ...registroTemperatura } = data;

  const fechaExist = await RegistroTemperatura.findOne({
    where: { fecha_mes: registroTemperatura.fecha_mes },
  });

  if (!fechaExist) {
    // No existe registro para este mes, creamos uno nuevo
    const registroTemp = await RegistroTemperatura.create(registroTemperatura);

    if (!registroTemp || !registroTemp.id) {
      throw new Error("No se pudo crear el registro principal");
    }

    // Asociamos el detalle al registro creado

    const detalleConId = {
      ...cuarto,
      id_registro: registroTemp.id,
    };

    const detalleInsertado = await DetalleTemperatura.create(detalleConId);
    return { registroTemp, detalleInsertado };
  }

  // Si ya existe registro para ese mes, solo insertamos nuevo detalle
  const detalleConId = {
    ...cuarto,
    id_registro: fechaExist.id,
  };

  const detalleInsertado = await DetalleTemperatura.create(detalleConId);

  return detalleInsertado;
};

export const getAllMonth = async (id, fecha) => {
  const cuartoExits = await Cuartos.findByPk(id);

  if (!cuartoExits) {
    throw new Error("El Cuarto no existe.");
  }
  // Validar formato de fecha esperado: 'YYYY-MM'
  if (!/^\d{4}-\d{2}$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Usa "YYYY-MM".');
  }
  if (!/^\d+$/.test(id)) {
    throw new Error("Formato de Id invalido. Solo numeros enteros.");
  }

  const fechaInicio = moment(`${fecha}-01`)
    .startOf("month")
    .format("YYYY-MM-DD");
  const fechaFin = moment(fechaInicio).add(1, "month").format("YYYY-MM-DD");

  const resultados = await DetalleTemperatura.findAll({
    include: [
      {
        model: RegistroTemperatura,
        attributes: [
          [fn("MONTHNAME", col("RegistroTemperatura.fecha_mes")), "Mes"],
        ],
        where: {
          fecha_mes: {
            [Op.gte]: fechaInicio,
            [Op.lt]: fechaFin,
          },
        },
      },
      {
        model: Responsable,
        attributes: [],
      },
      {
        model: Cuartos,
        as: "Cuarto",
        attributes: ["nombre"],
      },
    ],
    attributes: [
      "fecha_registro",
      "horario",
      "hora",
      "temperatura",
      [literal(`CONCAT(Responsable.nombre)`), "responsable"],
    ],
    where: {
      id_cuarto: id,
      fecha_registro: {
        [Op.gte]: fechaInicio,
        [Op.lt]: fechaFin,
      },
    },
    raw: true,
  });

  if (resultados.length == 0) {
    throw new Error("No se encontraron registros de temperatura para ese mes.");
  }
  const data = resultados.map((op) => ({
    Registro: op.fecha_registro,
    Horario: op.horario,
    Hora: op.hora,
    Temperatura: op.temperatura,
    Responsable: op.responsable,
    Mes: op["RegistroTemperatura.Mes"] ?? "",
    Cuarto: op["Cuarto.nombre"] ?? "",
  }));

  const dataOrganizada = agruparPorMesYDia(data);

  return dataOrganizada;
};
// Trae la informacion de un Registro de recepción
export const getById = async (id) => await RegistroTemperatura.findByPk(id);
//
export const update = async (id, data) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getById(id);
  if (!registro) throw new Error("Item no encontrado");
  return await registro.update({ estado: 0 });
};

function agruparPorMesYDia(resultados) {
  if (!resultados.length) return {};
  const mesNombre = resultados[0].Mes || "";
  const responsable = resultados[0].Responsable || "";

  const diasAgrupados = resultados.reduce((acc, item) => {
    const registro = dayjs(item.Registro).format("DD-MM-YYYY");
    const horarioObj = {
      horario: item.Horario,
      Hora: item.Hora,
      Temperatura: item.Temperatura,
    };
    let dia = acc.find((d) => d.registro === registro);
    if (dia) {
      dia.horario.push(horarioObj);
    } else {
      acc.push({ registro, horario: [horarioObj], responsable });
    }
    return acc;
  }, []);

  return { Mes: mesNombre, dias: diasAgrupados };
}
