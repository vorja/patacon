import { col, fn, Op, where } from "sequelize";

import Produccion from "../models/produccion.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import Proveedor from "../models/proveedores.mjs";
import ControlAlistamiento from "../models/controlAlistamiento.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import RegistroAreaCorte from "../models/registroAreaCorte.mjs";
import AlistamientoHasProveedor from "../models/alistamientosHasProveedor.mjs";
import VariablesProveedor from "../models/variablesProveedor.mjs";
import DetalleProveedor from "../models/detalleProveedor.mjs";
import Verificaciones from "../models/verificaciones.mjs";
import VerificarPesoEmpaque from "../models/verificarPesoEmpaque.mjs";
import VerificarPesoPaquete from "../models/verificarPesoPaquete.mjs";
import Responsable from "../models/responsable.mjs";

// ============================================
// VARIABLE GLOBAL - AÑO ACTUAL
// ============================================
const añoActual = new Date().getFullYear();

// ============================================
// 1. CONTENEDORES POR MES (Año Actual)
// ============================================
export const obtenerContenedoresPorMes = async () => {
  const contenedores = await Produccion.findAll({
    attributes: [
      [fn("MONTH", col("fecha_creacion")), "mes"],
      [fn("COUNT", col("id")), "cantidad"],
    ],
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
    group: [fn("MONTH", col("fecha_creacion"))],
    order: [[fn("MONTH", col("fecha_creacion")), "ASC"]],
    raw: true,
  });

  // Crear array con todos los meses (1-12)
  const mesesNombres = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Mapear datos, rellenando meses sin datos con 0
  const contenedoresData = mesesNombres.map((nombre, index) => {
    const mes = index + 1;
    const dato = contenedores.find((c) => Number(c.mes) === mes);
    return {
      name: nombre,
      value: dato ? Number(dato.cantidad) : 0,
    };
  });

  return contenedoresData;
};

// ============================================
// 2. MATERIA PRIMA POR PROVEEDOR (Año Actual)
// ============================================
export const obtenerMateriaPorProveedor = async () => {
  // Obtener todas las producciones del año
  const producciones = await Produccion.findAll({
    attributes: ["id"],
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
    raw: true,
  });

  if (producciones.length === 0) {
    return {
      name: "Total",
      materia: [],
    };
  }

  const idsProduccion = producciones.map((p) => p.id);

  // Obtener recepciones agrupadas por proveedor
  const recepciones = await RegistroRecepcionMateriaPrima.findAll({
    attributes: [
      "id_proveedor",
      [fn("SUM", col("cantidad")), "total_cantidad"],
    ],
    where: {
      orden: { [Op.in]: idsProduccion },
    },
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    group: ["id_proveedor"],
    raw: true,
  });

  const proveedorData = {
    name: "Total",
    materia: recepciones.map((r) => ({
      name: r["proveedor.nombre"] || "Sin Proveedor",
      materia: [
        {
          value: Number(r.total_cantidad) || 0,
        },
      ],
    })),
  };

  return proveedorData;
};

// ============================================
// 3. CAJAS POR CONTENEDOR Y TIPO (Año Actual)
// ============================================
export const obtenerCajasPorContenedor = async () => {
  const producciones = await Produccion.findAll({
    attributes: ["id", "lote_produccion"],
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
    order: [["fecha_creacion", "ASC"]],
  });

  if (producciones.length === 0) {
    return {
      name: "Total",
      children: [],
    };
  }
  const children = await Promise.all(
    producciones.map(async (prod) => {
      // Obtener todos los empaques de esta producción
      const empaques = await RegistroAreaEmpaque.findAll({
        attributes: ["id"],
        where: {
          orden: prod.id,
        },
        raw: true,
      });

      // Obtener todos los detalles de empaque en paralelo
      const registroEmpaque = await Promise.all(
        empaques.map(async (item) => {
          const detalle = await DetalleEmpaque.findAll({
            attributes: ["tipo", "total_cajas"],
            where: { id_empaque: item.id },
            raw: true,
          });
          return detalle;
        }),
      );

      // Aplanar el array de arrays
      const todosLosDetalles = registroEmpaque.flat();

      // Agrupar por tipo y sumar las cajas
      const totalPorTipo = todosLosDetalles.reduce((acc, item) => {
        const tipo = item.tipo || "Sin Tipo";
        if (!acc[tipo]) {
          acc[tipo] = {
            tipo: tipo,
            total_cajas: 0,
          };
        }
        acc[tipo].total_cajas += Number(item.total_cajas) || 0;
        return acc;
      }, {});

      // Convertir el objeto a array
      const children = Object.values(totalPorTipo).map((e) => ({
        name: e.tipo,
        value: e.total_cajas,
      }));

      return {
        name: prod.lote_produccion,
        children: children,
      };
    }),
  );

  return {
    name: "Total",
    children: children.filter((c) => c.children.length > 0),
  };
};

// ============================================
// 4. RECHAZO POR CONTENEDOR Y ÁREA (Año Actual)
// ============================================
export const obtenerRechazoPorContenedor = async () => {
  const producciones = await Produccion.findAll({
    attributes: ["id", "lote_produccion"],
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
    order: [["fecha_creacion", "ASC"]],
  });

  if (producciones.length === 0) {
    return {
      name: "Total",
      children: [],
    };
  }

  const children = await Promise.all(
    producciones.map(async (prod) => {
      // Obtener datos de cada área
      const recepciones = await RegistroRecepcionMateriaPrima.findAll({
        attributes: [[fn("SUM", col("cant_defectos")), "total"]],
        where: { orden: prod.id },
        raw: true,
      });

      const alistamiento = await ControlAlistamiento.findAll({
        attributes: [[fn("SUM", col("rechazo")), "total"]],
        where: { orden: prod.id },
        raw: true,
      });

      const cortes = await RegistroAreaCorte.findAll({
        attributes: [[fn("SUM", col("rechazo_corte")), "total"]],
        where: { orden: prod.id },
        raw: true,
      });

      const fritura = await RegistroAreaFritura.findAll({
        attributes: [[fn("SUM", col("rechazo_fritura")), "total"]],
        where: { orden: prod.id },
        raw: true,
      });

      const empaque = await RegistroAreaEmpaque.findAll({
        attributes: [[fn("SUM", col("rechazo_empaque")), "total"]],
        where: { orden: prod.id },
        raw: true,
      });

      return {
        name: prod.lote_produccion,
        children: [
          { name: "Recepcion", value: Number(recepciones[0]?.total || 0) },
          { name: "Alistamiento", value: Number(alistamiento[0]?.total || 0) },
          { name: "Corte", value: Number(cortes[0]?.total || 0) },
          { name: "Fritura", value: Number(fritura[0]?.total || 0) },
          { name: "Empaque", value: Number(empaque[0]?.total || 0) },
        ],
      };
    }),
  );

  return {
    name: "Total",
    children,
  };
};
// ============================================
// 5. FUNCIÓN GENERAL PARA OBTENER MATERIA PRIMA
// ============================================
export const obtenerMateriaPrima = async () => {
  const lista = await Produccion.findAll({
    attributes: ["id", "lote_produccion"],
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
  });

  if (lista.length === 0)
    throw new Error("No hay Registros de Orden de Produccion Disponibles.");

  const materiaPrima = await Promise.all(
    lista.map(async (orden) => {
      const detalle = await RegistroRecepcionMateriaPrima.sum("cantidad", {
        where: { orden: orden.id },
      });

      return {
        ...orden.get({ plain: true }),
        total: detalle ?? 0,
      };
    }),
  );
  const info = await obtenerCantidades();

  console.log(info);

  const organizado = materiaPrima.map((item) => ({
    contenedor: item.lote_produccion,
    gasto: item.total,
  }));

  return { materiaPrima: organizado, info };
};

// ============================================
// 6. FUNCIÓN GENERAL PARA DASHBOARD
// ============================================
export const obtenerDashboardAnual = async () => {
  try {
    const [contenedores, proveedores, cajas, rechazos, materia] =
      await Promise.all([
        obtenerContenedoresPorMes(),
        obtenerMateriaPorProveedor(),
        obtenerCajasPorContenedor(),
        obtenerRechazoPorContenedor(),
        obtenerMateriaPrima(),
      ]);

    return {
      materiaConenedores: materia,
      contenedoresData: contenedores,
      proveedorData: proveedores,
      cajasData: cajas,
      hierarchicalData: rechazos,
    };
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    throw error;
  }
};

// ============================================
// 7. INDICADORES DE CALIDAD PARA EXCEL Y GRÁFICAS
// ============================================

export const obtenerRecepcionAlistamiento = async () => {
  const registros = await AlistamientoHasProveedor.findAll({
    attributes: [
      "lote_proveedor",
      [fn("SUM", col("materia")), "materia_total"],
      [fn("SUM", col("rechazo")), "rechazo_total"],
      [fn("SUM", col("maduro")), "maduro_total"],
    ],
    group: ["lote_proveedor"],
    order: [["lote_proveedor", "ASC"]],
    raw: true,
  });

  return registros.map((r) => {
    const materia = Number(r.materia_total ?? 0);
    const rechazo = Number(r.rechazo_total ?? 0);
    const maduro = Number(r.maduro_total ?? 0);
    const bruto = materia + rechazo + maduro;
    const rendimiento =
      bruto > 0 ? Number(((materia / bruto) * 100).toFixed(2)) : 0;
    const perdida =
      bruto > 0 ? Number((((rechazo + maduro) / bruto) * 100).toFixed(2)) : 0;

    return {
      lote_proveedor: r.lote_proveedor,
      materia,
      rechazo,
      maduro,
      bruto,
      rendimiento,
      perdida,
    };
  });
};

export const obtenerControlFrituraCalidad = async () => {
  const [detalles, variables] = await Promise.all([
    DetalleProveedor.findAll({ raw: true }),
    VariablesProveedor.findAll({ raw: true }),
  ]);

  const variablesPorProceso = variables.reduce((acc, item) => {
    const id = item.id_proceso;
    if (!acc[id]) {
      acc[id] = {
        id_proceso: id,
        lote_produccion: item.lote_produccion,
        lote_proveedor: item.lote_proveedor,
        tipo: item.tipo,
        canastas_variables: 0,
        cantidad_kg: 0,
      };
    }
    acc[id].canastas_variables += Number(item.canastas ?? 0);
    acc[id].cantidad_kg += Number(item.cantidad_kg ?? 0);
    return acc;
  }, {});

  const resultado = detalles.map((detalle) => {
    const resumen = variablesPorProceso[detalle.id] ?? {};

    return {
      id_proceso: detalle.id,
      lote_produccion: resumen.lote_produccion ?? null,
      lote_proveedor: resumen.lote_proveedor ?? null,
      tipo: resumen.tipo ?? null,
      temperatura_fritura: Number(detalle.temperatura_fritura ?? 0),
      tiempo_fritura: Number(detalle.tiempo_fritura ?? 0),
      rechazo: Number(detalle.rechazo ?? 0),
      migas: Number(detalle.migas ?? 0),
      bajadas: Number(detalle.bajadas ?? 0),
      canastas: Number(detalle.canastas ?? 0),
      materia_kg: Number(detalle.materia_kg ?? 0),
      canastas_variables: Number(resumen.canastas_variables ?? 0),
      cantidad_kg: Number(resumen.cantidad_kg ?? 0),
    };
  });

  return resultado;
};

export const obtenerVerificacionEmpaqueCalidad = async () => {
  const [verificaciones, empaques, paquetes, responsables] = await Promise.all([
    Verificaciones.findAll({ raw: true }),
    VerificarPesoEmpaque.findAll({ raw: true }),
    VerificarPesoPaquete.findAll({ raw: true }),
    Responsable.findAll({ raw: true }),
  ]);

  const responsablesPorId = responsables.reduce((acc, r) => {
    acc[r.id] = r.nombre;
    return acc;
  }, {});

  const verificacionBase = verificaciones.reduce((acc, v) => {
    acc[v.id] = {
      id_verificacion: v.id,
      fecha_verificacion: v.fecha_verificacion,
      responsable: responsablesPorId[v.id_responsable] ?? null,
    };
    return acc;
  }, {});

  const filas = [];

  empaques.forEach((e) => {
    const base = verificacionBase[e.id_verificacion] ?? {};
    filas.push({
      id_verificacion: e.id_verificacion,
      fecha_verificacion: base.fecha_verificacion ?? null,
      responsable: base.responsable ?? null,
      lote_empaque: e.lote_empaque,
      tipo_caja: e.tipo_caja,
      peso_caja: Number(e.peso_caja ?? 0),
      lote_produccion: null,
      tipo_paquete: null,
      peso_paquete: null,
    });
  });

  paquetes.forEach((p) => {
    const base = verificacionBase[p.id_verificacion] ?? {};
    filas.push({
      id_verificacion: p.id_verificacion,
      fecha_verificacion: base.fecha_verificacion ?? null,
      responsable: base.responsable ?? null,
      lote_empaque: null,
      tipo_caja: null,
      peso_caja: null,
      lote_produccion: p.lote_produccion,
      tipo_paquete: p.tipo_paquete,
      peso_paquete: Number(p.peso_paquete ?? 0),
    });
  });

  return filas;
};

export const obtenerIndicadoresCalidad = async () => {
  try {
    const [recepcionAlistamiento, controlFritura, verificacionEmpaque] =
      await Promise.all([
        obtenerRecepcionAlistamiento(),
        obtenerControlFrituraCalidad(),
        obtenerVerificacionEmpaqueCalidad(),
      ]);

    return {
      recepcionAlistamiento,
      controlFritura,
      verificacionEmpaque,
    };
  } catch (error) {
    console.error("Error al obtener indicadores de calidad:", error);
    throw error;
  }
};

const obtenerCantidades = async () => {
  const producciones = await RegistroAreaFritura.count({
    where: {
      [Op.and]: [where(fn("YEAR", col("fecha")), añoActual)],
    },
  });

  const cajas = await RegistroAreaEmpaque.sum("total_cajas", {
    where: {
      [Op.and]: [where(fn("YEAR", col("fecha_empaque")), añoActual)],
    },
  });

  const contenedores = await Produccion.count({
    where: {
      [Op.and]: [
        where(fn("YEAR", col("fecha_creacion")), añoActual),
        { estado: 1 },
      ],
    },
  });

  return {
    producciones: producciones ?? 0,
    cajas: cajas ?? 0,
    contenedores: contenedores ?? 0,
  };
};
