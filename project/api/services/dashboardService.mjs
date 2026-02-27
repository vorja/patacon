import { col, fn, Op, where } from "sequelize";

import Produccion from "../models/produccion.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import Proveedor from "../models/proveedores.mjs";
import ControlAlistamiento from "../models/controlAlistamiento.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import RegistroAreaCorte from "../models/registroAreaCorte.mjs";

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
