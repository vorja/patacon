import { Op, fn, col } from "sequelize";
import Produccion from "../models/produccion.mjs";
import Responsable from "../models/responsable.mjs";
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

    const registroAreaFritura = await RegistroAreaFritura.create(
      registroFritura,
      { transaction },
    );

    if (!registroAreaFritura?.id) {
      await transaction.rollback();
      throw new Error("No se pudo crear el registro principal");
    }

    if (infoProveedores && infoProveedores.length > 0) {
      for (const proveedor of infoProveedores) {
        const variableProceso = await VariablesProceso.create(
          {
            ...proveedor.info,
            id_fritura: registroAreaFritura.id,
          },
          { transaction },
        );

        if (!variableProceso?.id) {
          throw new Error(
            `No se pudo crear variables de proceso para proveedor: ${proveedor.proveedor}`,
          );
        }

        if (proveedor.variables && proveedor.variables.length > 0) {
          const detallesProceso = proveedor.variables.map((v) => ({
            ...v,
            id_proceso: variableProceso.id,
          }));
          await DetalleProceso.bulkCreate(detallesProceso, { transaction });
        }

        if (proveedor.detalle && proveedor.detalle.length > 0) {
          const detallesFritura = proveedor.detalle.map((detalle) => ({
            ...detalle,
            id_fritura: registroAreaFritura.id,
            id_proceso: variableProceso.id,
          }));
          await DetalleAreaFritura.bulkCreate(detallesFritura, { transaction });
        }
      }
    }

    if (lotes && lotes.length > 0) {
      const lotesFritura = lotes.map((lote) => ({
        ...lote,
        fecha_produccion: registroFritura.fecha,
        id_fritura: registroAreaFritura.id,
      }));
      await LotesFritura.bulkCreate(lotesFritura, { transaction });
    }

    const idsRecepciones = Array.isArray(recepciones) ? recepciones : [recepciones];

    if (recepciones && recepciones.length > 0) {
      await RegistroRecepcionMateriaPrima.update(
        { estado: 0 },
        {
          where: { 
            id: idsRecepciones,
            estado: 1, 
          },
          transaction,
        },
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

  const registrosFritura = await RegistroAreaFritura.findAll({ 
    where: {
      orden: id_produccion,
    },
  });

  if (registrosFritura.length == 0)
    throw new Error(
      "No hay Registros de área de fritura con la fecha establecida.",
    );

  const conteoLotes = await RegistroAreaFritura.count({
    where: {
      orden: id_produccion,
    },
  });

  const registros = registrosFritura.map((op) => ({
    id: op.id,
    fecha: op.fecha,
    producto: op.producto,
    canastas: op.canastillas,
    migas: op.migas_fritura,
    rechazo: op.rechazo_fritura,
    observaciones: op.observaciones || "No hay Observaciones.",
  }));

  return {
    lotesFritura: registros, 
    conteoLotes: conteoLotes,
  };
};

export const getFrituraDay = async (fecha) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Usa "YYYY-MM-DD".');
  }

  // 1. Obtener registro de producción
  const registrosProduccion = await RegistroAreaFritura.findOne({
    attributes: ["id", "fecha", "producto", "canastillas"],
    where: {
      [Op.and]: [{ estado: 1 }, { fecha: fecha }],
    },
  });

  if (!registrosProduccion) throw new Error("No hay Registros de Produccion.");

  // 2. Obtener lotes de producción
  const registrosLotes = await LotesFritura.findAll({
    attributes: ["id", "lote_produccion", "canastas", "tipo"],
    where: {
      [Op.and]: [{ id_fritura: registrosProduccion.id }, { estado: 1 }],
    },
  });

  if (registrosLotes.length == 0)
    throw new Error("No hay Registros de Produccion, fecha seleccionada");

  // 3. Obtener detalle de fritura (canastillas por proveedor)
  const detalleFritura = await DetalleAreaFritura.findAll({
    attributes: [
      "lote_proveedor",
      "lote_produccion",
      "tipo",
      "canastas",
      "id_proveedor",
    ],
    where: { id_fritura: registrosProduccion.id },
    raw: true,
  });

  // 4. Obtener canastillas ya empacadas
  const listaProveedoresEmpacados = await ProveedoresEmpaque.findAll({
    attributes: ["lote_produccion", "lote_proveedor", "canastas"],
    where: { fecha_produccion: fecha },
    raw: true,
  });

  // 5. Obtener empaques por lote
  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: ["fecha_produccion", "lote_produccion", "numero_canastas"],
    where: { fecha_produccion: fecha },
    raw: true,
  });

  // 6. Calcular canastillas usadas en fritura por proveedor
  const canastillasFritura = detalleFritura.reduce((acc, item) => {
    const key = `${item.lote_produccion}_${item.lote_proveedor}`;
    if (!acc[key]) {
      acc[key] = {
        lote_produccion: item.lote_produccion,
        lote_proveedor: item.lote_proveedor,
        id_proveedor: item.id_proveedor,
        tipo: item.tipo,
        canastillas_fritura: 0,
      };
    }
    acc[key].canastillas_fritura += item.canastas;
    return acc;
  }, {});

  // 7. Calcular canastillas empacadas por proveedor
  const canastillasEmpacadas = listaProveedoresEmpacados.reduce((acc, item) => {
    const key = `${item.lote_produccion}_${item.lote_proveedor}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.canastas;
    return acc;
  }, {});

  // 8. Calcular disponibilidad por proveedor
  const disponibilidadPorProveedor = Object.values(canastillasFritura).map(prov => {
    const key = `${prov.lote_produccion}_${prov.lote_proveedor}`;
    const empacadas = canastillasEmpacadas[key] || 0;
    const disponibles = prov.canastillas_fritura - empacadas;
    
    return {
      lote_proveedor: prov.lote_proveedor,
      lote_produccion: prov.lote_produccion,
      id_proveedor: prov.id_proveedor,
      tipo: prov.tipo,
      canastillas_fritura: prov.canastillas_fritura,
      canastillas_empacadas: empacadas,
      canastillas_disponibles: disponibles > 0 ? disponibles : 0,
    };
  });

  // 9. Agrupar por lote de producción
  const proveedoresPorLote = disponibilidadPorProveedor.reduce((acc, prov) => {
    if (!acc[prov.lote_produccion]) {
      acc[prov.lote_produccion] = [];
    }
    
    acc[prov.lote_produccion].push({
      lote_proveedor: prov.lote_proveedor,
      id_proveedor: prov.id_proveedor,
      tipo: prov.tipo,
      canastas: prov.canastillas_disponibles,
    });
    
    return acc;
  }, {});

  // 10. Calcular saldo total por lote (MANTENER estructura original)
  const saldo = registrosLotes.map((lote) => {
    const proveedoresDelLote = proveedoresPorLote[lote.lote_produccion] || [];
    const totalDisponible = proveedoresDelLote.reduce((sum, prov) => sum + prov.canastas, 0);
    
    // Calcular total empaque para este lote
    const empaquesDelLote = listaEmpaque.filter(
      (e) => e.lote_produccion === lote.lote_produccion,
    );
    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.numero_canastas,
      0,
    );
    
    // MANTENER estructura original del segundo código
    return {
      lote_produccion: lote.lote_produccion,
      tipo: lote.tipo,
      saldo: Math.max(0, lote.canastas - totalEmpaque),
      proveedores: proveedoresDelLote,
    };
  });

  return {
    lotesFritura: saldo, // Retornar TODOS los lotes, no filtrar
  };
};

export const getByIdInfo = async (idFritura) => {
  const registroAreaFritura = await RegistroAreaFritura.findOne({
    where: {
      [Op.and]: [{ id: idFritura }],
    },
    include: [
      {
        model: Responsable,
        as: "responsable",
        attributes: ["nombre"], // o solo ['nombre'] si prefieres
      },
    ],
  });

  if (!registroAreaFritura)
    throw new Error(
      "No hay Registros de área de fritura con la fecha establecida.",
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
    bajadas: registroAreaFritura.bajadas_fritura,
    inventario: registroAreaFritura.inventario_aceite,
    gas: `${registroAreaFritura.gas_inicio - registroAreaFritura.gas_final} %`,
    horaInicio: formatearHoraAMPM(registroAreaFritura.inicio_fritura),
    horaFin: formatearHoraAMPM(registroAreaFritura.fin_fritura),
    responsable: registroAreaFritura.responsable ? `${registroAreaFritura.responsable.nombre} ${registroAreaFritura.responsable.apellido || ""}`.trim() : "No asignado",
    observaciones: registroAreaFritura.observaciones || "No hay Observaciones.",
  };

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

  const detalleCanastillas = await DetalleAreaFritura.findAll({
    attributes: [
      "lote_proveedor",
      "lote_produccion",
      "id_proveedor",
      "tipo",
      "peso",
      "canastas",
    ],
    where: { id_fritura: registroAreaFritura.id },
  });

  const { proveedores, totales_generales } = calcularTotalesPorProveedor(detalleCanastillas);
  resultado.materia_kg = totales_generales.peso_neto_final;

  return {
    produccion: resultado,
    detalles: lotesFritura,
    proceso: variables,
    canastillas: detalleCanastillas,
    proveedores,
  };
};

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

function formatearHoraAMPM(horaStr) {
  if (!horaStr) return "N/A";
  let [horas, minutos] = horaStr.split(":");
  horas = parseInt(horas, 10);
  const sufijo = horas >= 12 ? "PM" : "AM";
  horas = horas % 12 || 12;
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

    resumen[recepcion].peso_total += Number(d.peso || 0);
    resumen[recepcion].canastillas_totales += Number(d.canastas || 0);
  });

  for (const proveedor in resumen) {
    const data = resumen[proveedor];
    data.descuento_aplicado = data.canastillas_totales * 1.5;
    data.peso_neto = data.peso_total - data.descuento_aplicado;
  }

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
    },
  );

  return {
    proveedores: Object.values(resumen),
    totales_generales,
  };
}