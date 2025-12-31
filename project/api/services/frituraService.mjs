import { col, Op, fn } from "sequelize";
import Produccion from "../models/produccion.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import DetalleProceso from "../models/variablesProveedor.mjs";
import DetalleAreaFritura from "../models/detalleAreaFritura.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";
import VariablesProceso from "../models/detalleProveedor.mjs";
import Proveedor from "../models/proveedores.mjs";
import sequelize from "../config/database.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";
import DetalleProveedor from "../models/detalleProveedor.mjs";
import VariablesProveedor from "../models/variablesProveedor.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import ProveedoresEmpaque from "../models/proveedoresEmpaque.mjs";

export const create = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const { infoProveedores, lotes, recepciones, ...registroFritura } = data;

    // 1. Registro principal de fritura
    const registroAreaFritura = await RegistroAreaFritura.create(
      registroFritura,
      { transaction }
    );

    if (!registroAreaFritura?.id) {
      await transaction.rollback();
      throw new Error("No se pudo crear el registro principal");
    }

    // 2. Procesar cada proveedor
    if (infoProveedores && infoProveedores.length > 0) {
      for (const proveedor of infoProveedores) {
        // 2.1 Crear variables de proceso por proveedor.
        const variableProceso = await VariablesProceso.create(
          {
            ...proveedor.info, // info contiene: id_proveedor, temperaturaFritura, tiempoFritura, etc.
            id_fritura: registroAreaFritura.id,
          },
          { transaction }
        );

        console.log("variables prove: ", variableProceso);

        if (!variableProceso?.id) {
          throw new Error(
            `No se pudo crear variables de proceso para proveedor: ${proveedor.proveedor}`
          );
        }

        // 2.2 Crear detalles de proceso (variables consolidadas)
        if (proveedor.variables && proveedor.variables.length > 0) {
          const detallesProceso = proveedor.variables.map((v) => ({
            ...v,
            id_proceso: variableProceso.id,
          }));

          await DetalleProceso.bulkCreate(detallesProceso, { transaction });
        }

        // 2.3 Crear detalles de fritura (canastillas individuales)
        if (proveedor.detalle && proveedor.detalle.length > 0) {
          const detallesFritura = proveedor.detalle.map((detalle) => ({
            ...detalle,
            id_fritura: registroAreaFritura.id,
            id_proceso: variableProceso.id, // Se relaciona con el proceso del proveedor
          }));

          console.log("detalles de friitura:  ", detallesFritura);

          await DetalleAreaFritura.bulkCreate(detallesFritura, { transaction });
        }
      }
    }

    // 3. Crear lotes consolidados de fritura
    if (lotes && lotes.length > 0) {
      const lotesFritura = lotes.map((lote) => ({
        ...lote,
        fecha_produccion: registroFritura.fecha,
        id_fritura: registroAreaFritura.id,
      }));

      await LotesFritura.bulkCreate(lotesFritura, { transaction });
    }

    // 4. Actualizar estado de recepciones
    if (recepciones && recepciones.length > 0) {
      await RegistroRecepcionMateriaPrima.update(
        { estado: 0 },
        {
          where: { id: recepciones },
          transaction,
        }
      );
    }

    await transaction.commit();

    return {
      success: true,
      id: registroAreaFritura.id,
      message: "Registro de fritura creado exitosamente",
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error en create fritura:", error);
    throw new Error(`Error al crear registro de fritura: ${error.message}`);
  }
};

export const getAll = async (id_produccion) => {
  const ordenProduccion = await Produccion.findOne({
    where: {
      id: id_produccion,
    },
  });

  if (!ordenProduccion) throw new Error("La orden no existe.");

  const registrosFiruta = await RegistroAreaFritura.findAll({
    where: {
      orden: id_produccion,
    },
  });

  if (registrosFiruta.length == 0)
    throw new Error(
      "No hay Registros de área de fritura con la fecha establecida."
    );

  const conteoLotes = await RegistroAreaFritura.count({
    where: {
      orden: id_produccion,
    },
  });

  // Informacion del Proveeedor
  const registros = registrosFiruta.map((op) => ({
    id: op.id,
    fecha: op.fecha,
    producto: op.producto,
    canastas: op.canastillas,
    migas: op.migas_fritura,
    rechazo: op.rechazo_fritura,
    observaciones: op.observaciones || "No hay Observaciones.",
  }));

  return {
    lostesFritura: registros,
    conteoLotes: conteoLotes,
  };
};

export const getFrituraDay = async (fecha) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Usa "YYYY-MM-DD".');
  }

  const registrosProduccion = await RegistroAreaFritura.findOne({
    attributes: ["id", "fecha", "producto", "canastillas"],
    where: {
      [Op.and]: [{ estado: 1 }, { fecha: fecha }],
    },
  });

  if (!registrosProduccion) throw new Error("No hay Registros de Produccion.");

  const registrosLotes = await LotesFritura.findAll({
    attributes: ["id", "lote_produccion", "canastas", "tipo"],
    where: {
      [Op.and]: [{ id_fritura: registrosProduccion.id }, { estado: 1 }],
    },
  });

  const registroPro = await DetalleProveedor.findAll({
    attributes: ["id"],
    where: {
      [Op.and]: [{ id_fritura: registrosProduccion.id }],
    },
  });

  const detalleFritura = await Promise.all(
    registroPro.map(async (loteFritura) => {
      return await VariablesProveedor.findAll({
        attributes: ["lote_proveedor", "tipo", "canastas", "id_proveedor"],
        where: { id_proceso: loteFritura.id },
      });
    })
  );

  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "fecha_empaque",
      "fecha_produccion",
      "lote_produccion",
      "numero_canastas",
    ],
    where: { fecha_produccion: fecha },
  });

  const listaProveedores = await ProveedoresEmpaque.findAll({
    attributes: [
      "fecha_produccion",
      "lote_produccion",
      "lote_proveedor",
      "id_proveedor",
      "cajas",
      "canastas",
      "tipo",
    ],
    where: { fecha_produccion: fecha },
  });
  const proveedoresSaldo = listaProveedores.reduce((acc, prov) => {
    const tipo = prov.tipo;

    if (!acc[prov.lote_proveedor]) {
      acc[prov.lote_proveedor] = {
        id_proveedor: prov.id_proveedor,
        tipo: tipo,
        lote_proveedor: prov.lote_proveedor,
        totalCanastas: 0,
        totalCajas: 0,
      };
    }

    acc[prov.lote_proveedor].totalCanastas += prov.canastas;
    acc[prov.lote_proveedor].totalCajas += prov.cajas;

    return acc;
  }, {});

  console.log("Saldo: ", proveedoresSaldo);

  // Aplanar detalleFritura y restar las canastas usadas del saldo de cada proveedor
  const proveedoresUsados = detalleFritura.flat().reduce((acc, proveedor) => {
    const key = proveedor.lote_proveedor;

    if (!acc[key]) {
      acc[key] = 0;
    }

    acc[key] += proveedor.canastas;

    return acc;
  }, {});

  // Calcular el saldo real de cada proveedor
  const saldoProveedores = Object.keys(proveedoresSaldo).map(
    (loteProveedor) => {
      const proveedor = proveedoresSaldo[loteProveedor];
      const canastasUsadas = proveedoresUsados[loteProveedor] || 0;

      return {
        ...proveedor,
        canastasUsadas: canastasUsadas,
        saldoCanastas: canastasUsadas - proveedor.totalCanastas,
      };
    }
  );

  console.log("Saldo por proveedor:", saldoProveedores);

  // Calculamos saldo de canastillas por lote de producción
  const saldo = registrosLotes.map((fritura) => {
    const empaquesDelLote = listaEmpaque.filter(
      (e) => e.lote_produccion === fritura.lote_produccion
    );

    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.numero_canastas,
      0
    );

    // Filtrar proveedores que corresponden a este tipo
    const proveedoresDelTipo = saldoProveedores.filter(
      (p) => p.tipo === fritura.tipo
    );

    return {
      lote_produccion: fritura.lote_produccion,
      tipo: fritura.tipo,
      saldo: fritura.canastas - totalEmpaque,
      proveedores: proveedoresDelTipo,
    };
  });

  console.log(saldo);

  return {
    lotesFritura: saldo,/* 
    saldoProveedores: saldoProveedores, //  tener el saldo disponible */
  };
};

export const getByIdInfo = async (idFritura) => {
  const registroAreaFritura = await RegistroAreaFritura.findOne({
    where: {
      [Op.and]: [{ id: idFritura }],
    },
  });

  if (!registroAreaFritura)
    throw new Error(
      "No hay Registros de área de fritura con la fecha establecida."
    );

  const resultado = {
    id: registroAreaFritura.id,
    fecha: registroAreaFritura.fecha,
    producto: registroAreaFritura.producto,
    aforo: registroAreaFritura.aforo_aceite,
    aceite: registroAreaFritura.lote_aceite,
    canastas: registroAreaFritura.canastillas,
    migas: registroAreaFritura.migas_fritura,
    rechazo: registroAreaFritura.rechazo_fritura,
    inventario: registroAreaFritura.inventario_aceite,
    gas: `${registroAreaFritura.gas_inicio - registroAreaFritura.gas_final} %`,
    horaInicio: formatearHoraAMPM(registroAreaFritura.inicio_fritura),
    horaFin: formatearHoraAMPM(registroAreaFritura.fin_fritura),
    observaciones: registroAreaFritura.observaciones || "No hay Observaciones.",
  };

  // Traemos las variables de proceso de Fritura.
  const variablesProceso = await DetalleProveedor.findAll({
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_fritura: registroAreaFritura.id },
  });

  const lotesFritura = await LotesFritura.findAll({
    where: { id_fritura: idFritura },
  });

  // Informacion del Proveeedor
  const variables = variablesProceso.map((op) => ({
    inicio: op.inicio_fritura,
    fin: op.fin_fritura,
    tiempo: op.tiempo_fritura,
    temperatura: op.temperatura_fritura,
    rechazo: op.rechazo,
    migas: op.migas,
    canastas: op.canastas,
    materia_kg: op.materia_kg,
    proveedor: op.proveedor.nombre,
  }));

  // Traemos las canastillas de la fritura.
  const detalleCanastillas = await DetalleAreaFritura.findAll({
    attributes: [
      "lote_proveedor",
      "lote_produccion",
      "tipo",
      "peso",
      "canastas",
    ],

    where: { id_fritura: registroAreaFritura.id },
  });

  // Calculamo el total de Kg de Patacon
  const { proveedores, totales_generales } =
    calcularTotalesPorProveedor(detalleCanastillas);

  resultado.materia_kg = totales_generales.peso_neto_final;

  return {
    produccion: resultado,
    detalles: lotesFritura,
    proceso: variables,
    canastillas: detalleCanastillas,
    proveedores,
  };
};

// Trae la información de un Registro de recepción
export const getById = async (id) => await RegistroAreaFritura.findByPk(id);

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

//============== FUNCIONES PRIVADAS ================
function formatearHoraAMPM(horaStr) {
  let [horas, minutos] = horaStr.split(":");
  horas = parseInt(horas, 10);
  const sufijo = horas >= 12 ? "PM" : "AM";
  horas = horas % 12 || 12; // convierte 0 → 12 y 13 → 1
  return `${horas}:${minutos} ${sufijo}`;
}

function calcularTotalesPorProveedor(detalleCanastillas) {
  const resumen = {};
  detalleCanastillas.forEach((d) => {
    const recepcion = d.lote_proveedor;
    const produccion = d.lote_produccion;
    if (!resumen[recepcion]) {
      resumen[recepcion] = {
        lote_proveedor: recepcion,
        lote_produccion: produccion,
        tipo: d.tipo,
        peso_total: 0,
        canastillas_totales: 0,
        descuento_aplicado: 0,
        peso_neto: 0,
      };
    }

    /*   resumen[proveedor].registros += 1; */
    resumen[recepcion].peso_total += Number(d.peso || 0);
    resumen[recepcion].canastillas_totales += Number(d.canastas || 0);
  });

  // Calculamos descuentos y peso neto
  for (const proveedor in resumen) {
    const data = resumen[proveedor];
    data.descuento_aplicado = data.canastillas_totales * 1.5;
    data.peso_neto = data.peso_total - data.descuento_aplicado;
  }

  // Totales generales
  const totales_generales = Object.values(resumen).reduce(
    (acc, d) => {
      acc.peso_bruto_total += d.peso_total;
      acc.canastillas_totales += d.canastillas_totales;
      acc.descuento_total += d.descuento_aplicado;
      acc.peso_neto_final += d.peso_neto;
      return acc;
    },
    {
      peso_bruto_total: 0,
      canastillas_totales: 0,
      descuento_total: 0,
      peso_neto_final: 0,
    }
  );

  return {
    proveedores: Object.values(resumen),
    totales_generales,
  };
}
