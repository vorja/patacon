import ControlAlistamiento from "../models/controlAlistamiento.mjs";
import DetalleAreaCorte from "../models/detalleAreaCorte.mjs";
import DetalleAreaFritura from "../models/detalleAreaFritura.mjs";
import DetalleCaja from "../models/detalleCajas.mjs";
import DetalleProceso from "../models/variablesProveedor.mjs";
import Produccion from "../models/produccion.mjs";
import Proveedor from "../models/proveedores.mjs";
import RegistroAreaCorte from "../models/registroAreaCorte.mjs";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";
import RegistroRecepcionMateriaPrima from "../models/registroRecepcionMateriaPrima.mjs";
import Responsable from "../models/responsable.mjs";
import { fn, col, Op, or } from "sequelize";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import ProveedorCorte from "../models/proveedorCorte.mjs";
import AlistamientoHasProveedor from "../models/alistamientosHasProveedor.mjs";
import DetalleProveedor from "../models/detalleProveedor.mjs";
import ProveedoresEmpaque from "../models/proveedoresEmpaque.mjs";
import CajasProduccion from "../models/cajasProduccion.mjs";
import Bodega from "../models/bodega.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";

// ============================================
// CONSTANTES
// ============================================
const ESTADO_ACTIVO = 1;
const ESTADO_EN_PROCESO = 2;
const ESTADO_FINALIZADO = 3;
const ESTADO_INACTIVO = 0;
const estadoMap = {
  1: "Pendiente",
  2: "En Proceso",
  3: "Finalizado",
};

// ============================================
// QUERIES REUTILIZABLES
// ============================================
const buildDateFilter = (fecha, orden = null) => {
  const filter = orden ? { orden, fecha } : { fecha };
  return { [Op.and]: [filter] };
};

const fetchRecepciones = async (filter, includeProveedor = false, attr) => {
  const options = {
    attributes: attr,
    where: filter,
  };

  if (includeProveedor) {
    options.include = [
      { model: Proveedor, as: "proveedor", attributes: ["nombre"] },
    ];
  }

  return await RegistroRecepcionMateriaPrima.findAll(options);
};

const fetchCortes = async (filter, attr) => {
  return await RegistroAreaCorte.findAll({
    attributes: attr,
    where: filter,
  });
};

const fetchFritura = async (filter, attr) => {
  const options = {
    attributes: attr,
    where: filter,
  };

  return await RegistroAreaFritura.findAll(options);
};

const fetchAlistamiento = async (filter, attr) => {
  return await ControlAlistamiento.findAll({
    attributes: attr,
    where: filter,
    raw: true,
  });
};

const fetchEmpaques = async (filter, attr) => {
  return await RegistroAreaEmpaque.findAll({
    attributes: attr,
    where: filter,
    raw: true,
  });
};

const fetchLotesEmpaques = async (filter, attr) => {
  return await DetalleEmpaque.findAll({
    attributes: attr,
    where: filter,
    raw: true,
  });
};

// ============================================ //
//          ENRIQUECIMIENTO DE DATOS
// ============================================ //

const enrichCorteWithDetailsProv = async (cortes) => {
  const corteIds = cortes.map((c) => c.id);

  return await DetalleAreaCorte.findAll({
    attributes: ["id_corte", "tipo", "materia"],
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_corte: corteIds },
    raw: true,
    nest: true,
  });
};

// Rendimiento de Proveedores Area Corte.
const enrichCorteWithDProv = async (cortes) => {
  const corteIds = cortes.map((c) => c.id);
  return await ProveedorCorte.findAll({
    attributes: [
      "id_corte",
      "fecha_produccion",
      "totalMateria",
      "rechazo",
      "rendimiento",
    ],
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_corte: corteIds },
    raw: true,
    nest: true,
  });
};

const enrichEmpaqueWithDetailsLotes = async (fechaPoduccion) => {
  const detalle = await DetalleEmpaque.findAll({
    attributes: [
      "tipo",
      "fecha_produccion",
      [fn("SUM", col("total_cajas")), "totalCajas"],
      [fn("SUM", col("peso_kg")), "totalKg"],
      [fn("SUM", col("total_rechazo")), "rechazo_empaque"],
    ],
    where: { fecha_produccion: fechaPoduccion },
    group: ["tipo"],
    raw: true,
  });

  return detalle;
};

// ============================================
//    ENRIQUECIMIENTO DE PROVEEDORES
// ============================================
const enrichAlistamientoWithProv = async (idProveedor) => {
  const detalle = await AlistamientoHasProveedor.findAll({
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_proveedor: idProveedor },
  });

  const registroAlismiento = await Promise.all(
    detalle.map(async (item) => {
      const info = await ControlAlistamiento.findAll({
        attributes: ["fecha"],
        where: { id: item.id_alistamiento },
      });

      return {
        ...item.get({ plain: true }),
        info,
      };
    })
  );

  return registroAlismiento;
};

const enrichCortesWithProv = async (idProveedor) => {
  const detalle = await ProveedorCorte.findAll({
    attributes: [
      "id_corte",
      "fecha_produccion",
      "totalMateria",
      "rechazo",
      "rendimiento",
    ],
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_proveedor: idProveedor },
  });

  const registroCorte = await Promise.all(
    detalle.map(async (item) => {
      const info = await RegistroAreaCorte.findAll({
        attributes: ["fecha"],
        where: { id: item.id_corte },
      });

      const detalles = await DetalleAreaCorte.findAll({
        where: { id_corte: item.id_corte, id_proveedor: idProveedor },
      });
      return {
        ...item.get({ plain: true }),
        info,
        detalles,
      };
    })
  );

  return registroCorte;
};

const enrichFrituraWithProv = async (idProveedor) => {
  const detalle = await DetalleProveedor.findAll({
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_proveedor: idProveedor },
  });

  const registroFritura = await Promise.all(
    detalle.map(async (item) => {
      const info = await RegistroAreaFritura.findAll({
        attributes: ["fecha"],
        where: { id: item.id_fritura },
      });

      return {
        ...item.get({ plain: true }),
        info,
      };
    })
  );

  return registroFritura;
};

const enrichEmpaqueWithProv = async (idProveedor) => {
  const detalle = await ProveedoresEmpaque.findAll({
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre"],
      },
    ],
    where: { id_proveedor: idProveedor },
  });

  const registroEmpaque = await Promise.all(
    detalle.map(async (item) => {
      const info = await RegistroAreaEmpaque.findAll({
        attributes: ["fecha_empaque", "promedio_peso"],
        where: { id: item.id_empaque },
      });

      return {
        ...item.get({ plain: true }),
        info,
      };
    })
  ); /* 
  console.log(registroEmpaque); */

  return registroEmpaque;
};

// ====================================================
//    CÁLCULOS DE RENDIMIENTO PRODUCCION - CONTENEDOR
// ====================================================

const calcularRendimientoMateria = (detalleCorte) => {
  return detalleCorte.map((op) => ({
    fecha: op.fecha,
    totalMateriaCorte: op.total_materia || 0,
    rendimiento: Number(op.rendimiento_materia?.toFixed(1) || 0),
  }));
};

const calcularRendimientoFritura = (fechas, fritura, detalleCorte) => {
  return fechas
    .map((item) => {
      let totalProcesada = 0;
      const corteFecha = detalleCorte.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (!corteFecha) return null;

      const frituraFecha = fritura.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      const totalCorte = corteFecha.reduce(
        (acc, d) => acc + Number(d.total_materia || 0),
        0
      );

      frituraFecha.map(
        (item) => (totalProcesada += Number(item.materia_fritura || 0)),
        0
      );

      const rendimiento =
        totalCorte > 0 ? (totalProcesada / totalCorte) * 100 : 0;

      return {
        fecha: item.fechaProduccion,
        totalFritura: Number(totalProcesada.toFixed(2)),
        totalCorte,
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoHastaFritura = (fechas, fritura, recepciones) => {
  return fechas
    .map((item) => {
      let totalProcesada = 0;

      const recepcionesFecha = recepciones.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (recepcionesFecha.length === 0) return null;

      const frituraFecha = fritura.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (frituraFecha.length === 0) return null;

      const totalMateria = recepcionesFecha.reduce(
        (acc, d) => acc + Number(d.cantidad || 0),
        0
      );

      frituraFecha.map(
        (item) => (totalProcesada += Number(item.materia_fritura || 0)),
        0
      );

      const rendimiento =
        totalMateria > 0 ? (totalProcesada / totalMateria) * 100 : 0;

      return {
        fecha: item.fechaProduccion,
        totalFritura: Number(totalProcesada.toFixed(1)),
        totalMateria,
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoEmpaque = (
  fechas,
  fritura,
  lotesEmpaque,
  incluirTotalCajas = false
) => {
  return fechas
    .map((item) => {
      const empaqueFecha = lotesEmpaque.filter(
        (c) => c.fecha_produccion === item.fechaProduccion
      );

      const frituraFecha = fritura.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (empaqueFecha.length === 0) return null;

      const totalPeso = empaqueFecha.reduce(
        (acc, e) => acc + Number(e.totalKg || 0),
        0
      );

      const totalProcesada = frituraFecha.reduce(
        (acc, frit) => acc + Number(frit.materia_fritura || 0),
        0
      );

      const rendimiento =
        totalProcesada > 0 ? (totalPeso / totalProcesada) * 100 : 0;

      const result = {
        fecha: item.fechaProduccion,
        totalFritura: Number(totalProcesada.toFixed(1)),
        totalPeso: Number(totalPeso.toFixed(2)),
        rendimiento: Number(rendimiento.toFixed(1)),
      };

      if (incluirTotalCajas) {
        result.totalCajas = empaqueFecha.reduce(
          (acc, e) => acc + Number(e.totalCajas || 0),
          0
        );
      }

      return result;
    })
    .filter(Boolean);
};

const calcularRendimientoTotal = (recepciones, empaques) => {
  const agrupadoRecepciones = recepciones.reduce((acc, item) => {
    const fecha = item.fecha;
    if (!acc[fecha]) {
      acc[fecha] = { fecha, totalMateria: 0 };
    }
    acc[fecha].totalMateria += item.cantidad || 0;
    return acc;
  }, {});

  return Object.entries(agrupadoRecepciones)
    .map(([fecha, data]) => {
      const empaqueFecha = empaques.filter((c) => c.fecha_produccion === fecha);
      if (empaqueFecha.length === 0) return null;

      const totalCajas = empaqueFecha.reduce(
        (acc, e) => acc + Number(e.totalKg || 0),
        0
      );

      const rendimiento =
        data.totalMateria > 0 ? (totalCajas / data.totalMateria) * 100 : 0;

      return {
        fecha,
        totalMateria: Number(data.totalMateria.toFixed(2)),
        totalCajas,
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoProveedores = (recepciones, cortes) => {
  return recepciones
    .map((data) => {
      const proveedor = data.proveedor.nombre;
      const corteFecha = cortes.find((c) => {
        return c.proveedor.nombre === proveedor;
      });

      if (!corteFecha) return null;
      return {
        proveedor: data.proveedor.nombre ?? "",
        id_corte: corteFecha.id_corte,
        materia: data.cantidad,
        totalMateria: corteFecha.totalMateria,
        rendimiento: corteFecha.rendimiento,
      };
    })
    .filter(Boolean);
};

const calcularRechazoTotal = (
  alistamiento,
  recepciones,
  procesoFritura,
  empaques,
  cortes
) => {
  const rechazoAlistamiento = alistamiento.reduce(
    (acc, a) => acc + Number(a.rechazo || 0),
    0
  );

  const rechazoRecepcion = recepciones.reduce(
    (acc, item) => acc + Number(item.cant_defectos || 0),
    0
  );

  const rechazoCorte = cortes.reduce(
    (acc, c) => acc + Number(c.rechazo_corte || 0),
    0
  );

  const rechazoFritura = (procesoFritura || []).reduce(
    (acc, d) => acc + Number(d.rechazo_fritura || 0),
    0
  );

  const rechazoEmpaque = empaques.reduce(
    (acc, d) => acc + Number(d.rechazo_empaque || 0),
    0
  );

  const total =
    rechazoAlistamiento +
    rechazoRecepcion +
    rechazoCorte +
    rechazoFritura +
    rechazoEmpaque;

  return [
    { name: "Recepcion", value: Number(rechazoRecepcion.toFixed(1)) },
    { name: "Alistamiento", value: Number(rechazoAlistamiento.toFixed(1)) },
    { name: "Corte", value: Number(rechazoCorte.toFixed(1)) },
    { name: "Fritura", value: Number(rechazoFritura.toFixed(1)) },
    { name: "Empaque", value: Number(rechazoEmpaque.toFixed(1)) },
    { name: "Total", value: Number(total.toFixed(1)) },
  ];
};

// =====================================================
//    CÁLCULOS DE RENDIMIENTO  DE PROVEEDOR X PRODUCCION.
// =====================================================

const calcularRendimientoMateriaProv = (fechas, cortes, recepciones) => {
  return fechas
    .map((item) => {
      const recepcionesFecha = recepciones.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (recepcionesFecha.length === 0) return null;

      const corteFecha = cortes.filter(
        (c) => c.fecha_produccion === item.fechaProduccion
      );

      if (corteFecha.length === 0) return null;

      const totalMateria = recepcionesFecha.reduce(
        (acc, d) => acc + Number(d.cantidad || 0),
        0
      );

      const totalCorte = corteFecha.reduce(
        (acc, d) => acc + Number(d.totalMateria || 0),
        0
      );

      const rendimiento =
        totalMateria > 0 ? (totalCorte / totalMateria) * 100 : 0;

      const proveedor = recepcionesFecha[0].proveedor?.nombre || "";

      return {
        fecha: item.fechaProduccion,
        proveedor: proveedor ?? "",
        totalCorte: Number(totalCorte.toFixed(1)),
        totalMateria,
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoFrituraProv = (fechas, fritura, cortes) => {
  return fechas
    .map((item) => {
      const cortesDelDia = cortes.filter(
        (corte) => corte.fecha_produccion === item.fechaProduccion
      );

      // Si no hay cortes para esta fecha, omitir
      if (cortesDelDia.length === 0) return null;

      const friturasDelDia = fritura.filter(
        (f) => f.info[0].fecha === item.fechaProduccion
      );

      // Si no hay frituras, también omitir
      if (friturasDelDia.length === 0) return null;

      const totalCorte = cortesDelDia.reduce(
        (acc, corte) => acc + Number(corte.totalMateria || 0),
        0
      );

      const totalProcesada = friturasDelDia.reduce(
        (acc, frit) => acc + Number(frit.materia_kg || 0),
        0
      );

      const rendimiento =
        totalCorte > 0 ? (totalProcesada / totalCorte) * 100 : 0;

      const proveedor = friturasDelDia[0].proveedor?.nombre || "";

      return {
        fecha: item.fechaProduccion,
        proveedor,
        totalFritura: Number(totalProcesada.toFixed(2)),
        totalCorte: Number(totalCorte.toFixed(2)),
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoHastaFrituraProv = (fechas, fritura, recepciones) => {
  return fechas
    .map((item) => {
      const recepcionesFecha = recepciones.filter(
        (c) => c.fecha === item.fechaProduccion
      );

      if (recepcionesFecha.length === 0) return null;

      const frituraFecha = fritura.filter(
        (c) => c.info[0].fecha === item.fechaProduccion
      );

      if (frituraFecha.length === 0) return null;

      const totalMateria = recepcionesFecha.reduce(
        (acc, d) => acc + Number(d.cantidad || 0),
        0
      );

      const totalProcesada = frituraFecha.reduce(
        (acc, frit) => acc + Number(frit.materia_kg || 0),
        0
      );

      const rendimiento =
        totalMateria > 0 ? (totalProcesada / totalMateria) * 100 : 0;

      const proveedor = frituraFecha[0].proveedor?.nombre || "";

      return {
        fecha: item.fechaProduccion,
        proveedor: proveedor ?? "",
        totalFritura: Number(totalProcesada.toFixed(2)),
        totalMateria: Number(totalMateria.toFixed(2)),
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

const calcularRendimientoEmpaqueProv = (fechas, empaques, fritura) => {
  return fechas
    .map((item) => {
      const empaqueFecha = empaques.filter(
        (c) => c.fecha_produccion === item.fechaProduccion
      );

      if (empaqueFecha.length === 0) return null;

      const totalCajas = empaqueFecha.reduce(
        (acc, e) =>
          acc + Number(e.cajas || 0) * Number(e.info[0].promedio_peso || 0),
        0
      );

      const frituraFecha = fritura.filter(
        (c) => c.info[0].fecha === item.fechaProduccion
      );

      if (frituraFecha.length === 0) return null;

      const totalProcesada = frituraFecha.reduce(
        (acc, frit) => acc + Number(frit.materia_kg || 0),
        0
      );

      const rendimiento =
        totalProcesada > 0 ? (totalCajas / totalProcesada) * 100 : 0;

      const proveedor = empaqueFecha[0].proveedor?.nombre || "";

      const result = {
        fecha: item.fechaProduccion,
        proveedor: proveedor ?? "",
        totalEmpaque: totalCajas,
        rendimiento: Number(rendimiento.toFixed(1)),
      };

      return result;
    })
    .filter(Boolean);
};

const calcularRendimientoTotalProv = (recepciones, empaques) => {
  const agrupadoRecepciones = recepciones.reduce((acc, item) => {
    const fecha = item.fecha;
    if (!acc[fecha]) {
      acc[fecha] = { fecha, totalMateria: 0 };
    }
    acc[fecha].totalMateria += item.cantidad || 0;
    return acc;
  }, {});

  return Object.entries(agrupadoRecepciones)
    .map(([fecha, data]) => {
      const empaqueFecha = empaques.filter((c) => c.fecha_produccion === fecha);
      if (empaqueFecha.length === 0) return null;

      const totalCajas = empaqueFecha.reduce(
        (acc, e) =>
          acc + Number(e.cajas || 0) * Number(e.info[0].promedio_peso || 0),
        0
      );

      const rendimiento =
        data.totalMateria > 0 ? (totalCajas / data.totalMateria) * 100 : 0;

      const proveedor = empaqueFecha[0].proveedor?.nombre || "";
      const id = empaqueFecha[0].id_proveedor || "";

      return {
        fecha,
        id: id ?? "",
        proveedor: proveedor ?? "",
        totalMateriaRecp: Number(data.totalMateria.toFixed(2)),
        rendimiento: Number(rendimiento.toFixed(1)),
      };
    })
    .filter(Boolean);
};

/* const calcularCajasEmpaqueProv = (fechas, empaques) => {
  return fechas
    .map((item) => {
      const empaqueFecha = empaques.filter(
        (c) => c.fecha_produccion === item.fechaProduccion
      );

      if (empaqueFecha.length === 0) return null;

      const proveedor = empaqueFecha[0].proveedor?.nombre || "";

      const totalCajas = empaqueFecha.reduce(
        (acc, e) => acc + Number(e.cajas || 0),
        0
      );

      const result = {
        fecha: item.fechaProduccion,
        proveedor: proveedor ?? "",
        totalCajas: totalCajas,
      };

      return result;
    })
    .filter(Boolean);
}; */

const calcularCanastasProv = (fechas, fritura) => {
  return fechas
    .map((item) => {
      const frituraFecha = fritura.filter(
        (c) => c.info[0].fecha === item.fechaProduccion
      );

      if (frituraFecha.length === 0) return null;

      const proveedor = frituraFecha[0].proveedor?.nombre || "";

      const totalCanastas = frituraFecha.reduce(
        (acc, e) => acc + Number(e.canastas || 0),
        0
      );
      const result = {
        fecha: item.fechaProduccion,
        proveedor: proveedor ?? "",
        totalCanastas: totalCanastas,
      };

      return result;
    })
    .filter(Boolean);
};

const calcularRechazoTotalProv = (
  alistamiento,
  recepciones,
  procesoFritura,
  empaques,
  cortes
) => {
  const rechazoAlistamiento = alistamiento.reduce(
    (acc, a) => acc + Number(a.rechazo || 0),
    0
  );

  const rechazoRecepcion = recepciones.reduce(
    (acc, item) => acc + Number(item.cant_defectos || 0),
    0
  );

  const rechazoCorte = cortes.reduce(
    (acc, c) => acc + Number(c.rechazo || 0),
    0
  );

  const rechazoFritura = (procesoFritura || []).reduce(
    (acc, d) => acc + Number(d.rechazo || 0),
    0
  );

  const rechazoEmpaque = empaques.reduce(
    (acc, d) => acc + Number(d.rechazo || 0),
    0
  );

  return [
    { name: "Recepcion", value: Number(rechazoRecepcion.toFixed(1)) },
    { name: "Alistamiento", value: Number(rechazoAlistamiento.toFixed(1)) },
    { name: "Corte", value: Number(rechazoCorte.toFixed(1)) },
    { name: "Fritura", value: Number(rechazoFritura.toFixed(1)) },
    { name: "Empaque", value: Number(rechazoEmpaque.toFixed(1)) },
  ];
};

const formatEmpaqueProv = (empaque) => {
  return empaque.map((item) => {
    return {
      caja: item.tipo,
      cantidad: item.cajas,
    };
  });
};
// ============================================
//   ACUMULACIÓN DE INFORMACIÓN DE CONTENDOR.
// ============================================

// Recepción : Contenedor
const infoRecepcion = (recepciones, cortes) => {
  const totalMateria = recepciones.reduce(
    (acc, d) => acc + Number(d.cantidad || 0),
    0
  );

  let totalProcesada = 0;

  cortes.forEach((item) => {
    totalProcesada += Number(item.total_materia || 0);
  });

  const rendimiento = (totalProcesada / totalMateria) * 100;

  return {
    prima: totalMateria,
    procesada: totalProcesada.toFixed(1),
    rendimiento: rendimiento.toFixed(2),
  };
};

// Alistamiento : Contenedor
const infoAlistamiento = (alistamientos) => {
  const canastillasTotal = alistamientos.reduce(
    (acc, d) => acc + Number(d.total || 0),
    0
  );

  const rechazoTotal = alistamientos.reduce(
    (acc, d) => acc + Number(d.rechazo || 0),
    0
  );

  const maduroTotal = alistamientos.reduce(
    (acc, d) => acc + Number(d.maduro || 0),
    0
  );

  return {
    canastillas: canastillasTotal,
    rechazo: rechazoTotal,
    maduro: maduroTotal,
  };
};

// Fritura : Contenedor
const infoFritura = (fritura) => {
  let totalProcesada = 0;
  let totalRechazo = 0;
  let totalCanastillas = 0;

  fritura.forEach((item) => {
    totalRechazo += Number(item.rechazo_fritura || 0);
    totalCanastillas += Number(item.canastillas || 0);
    totalProcesada += Number(item.materia_fritura || 0);
  });

  const registros = Object.values(
    fritura.reduce((acc, item) => {
      acc[item.fecha] = {
        migas: item.migas_proceso ?? 0,
      };
      return acc;
    }, {})
  );

  const migasTotal = registros.reduce(
    (acc, d) => acc + Number(d.migas || 0),
    0
  );

  console.log("Total Procesada: ", totalProcesada);

  return {
    patacon: totalProcesada.toFixed(1),
    canastillas: totalCanastillas,
    rechazo: totalRechazo.toFixed(1),
    migas: migasTotal.toFixed(1),
  };
};

// Empaque : Contenedor
const infoEmpaque = (empaques) => {
  const totalRechazo = empaques.reduce(
    (acc, d) => acc + Number(d.rechazo_empaque || 0),
    0
  );
  const totalMigas = empaques.reduce(
    (acc, d) => acc + Number(d.migas_empaque || 0),
    0
  );
  const totalCajas = empaques.reduce(
    (acc, d) => acc + Number(d.total_cajas || 0),
    0
  );
  return {
    cajas: totalCajas,
    rechazo: totalRechazo,
    migas: totalMigas,
  };
};

// Gas y Bidones: Contenedor
const infoGas = (fritura) => {
  let porcentajes = 0; // Agumulamos el porcentaje de consumo de gas, de cada reigstro de gritura.
  const registros = Object.values(
    fritura.reduce((acc, item) => {
      if (!acc[item.fecha]) {
        acc[item.fecha] = {
          gas: Number(item.gas_inicio || 0) - Number(item.gas_final || 0),
          bidones: item.inventario_aceite ?? 0,
        };
      }
      return acc;
    }, {})
  );
  const totalBidones = registros.reduce(
    (acc, d) => acc + Number(d.bidones || 0),
    0
  );

  // Promedio de consumo de gas.
  registros.forEach((item) => {
    porcentajes += Number(item.gas || 0);
  });

  const promedio = porcentajes / registros.length;
  return {
    bidones: totalBidones || 0,
    gas: promedio || 0,
  };
};

// Rechazo Contenedor
const infoRechazo = (recepcion, alistamiento, corte, fritura, empaque) => {
  const rechazoRecepcion = recepcion.reduce(
    (acc, d) => acc + Number(d.cant_defectos || 0),
    0
  );
  const rechazoAlistamiento = alistamiento.reduce(
    (acc, d) => acc + Number(d.rechazo || 0) + Number(d.maduro || 0),
    0
  );
  const rechazoCorte = corte.reduce(
    (acc, d) => acc + Number(d.rechazo_corte || 0),
    0
  );

  let rechazoFritura = 0;
  fritura.forEach((item) => {
    rechazoFritura += Number(item.rechazo_fritura || 0);
  });

  const rechazoEmpaque = empaque.reduce(
    (acc, d) => acc + Number(d.rechazo_empaque || 0),
    0
  );

  const totalContenedor =
    rechazoRecepcion +
    rechazoAlistamiento +
    rechazoCorte +
    rechazoFritura +
    rechazoEmpaque;

  return {
    RechazoAreas: {
      Recepcion: rechazoRecepcion,
      Alistamiento: rechazoAlistamiento,
      Corte: rechazoCorte,
      Fritura: rechazoFritura,
      Empaque: rechazoEmpaque,
    },
    RechazoTotal: totalContenedor,
  };
};

// ============================================
//          FORMATEO DE DATOS
// ============================================

const formatEstructura = (
  fechasObj,
  platano,
  fritura,
  hfritura,
  empaque,
  total
) => {
  return fechasObj.map((item) => {
    const getRendimiento = (arr) => {
      const data = arr.find((c) => c.fecha === item.fechaProduccion);
      return Number(data?.rendimiento || 0);
    };

    return {
      fecha: item.fechaProduccion,
      RendPlatano: getRendimiento(platano),
      RendFritura: getRendimiento(fritura),
      RendHFritura: getRendimiento(hfritura),
      RendEmpaque: getRendimiento(empaque),
      RendTotal: getRendimiento(total),
    };
  });
};

const formatEmpaque = (empaque) => {
  return empaque.map((item) => {
    return {
      caja: item.tipo,
      cantidad: item.totalCajas,
    };
  });
};

// ============================================
//          SERVICIOS PRINCIPALES
// ============================================

export const getAll = async () => {
  const lista = await Produccion.findAll({
    include: { model: Responsable, as: "responsable", attributes: ["nombre"] },
    where: { estado: ESTADO_ACTIVO },
  });

  if (!lista || lista.length === 0) {
    throw new Error("No hay Registros de Produccion Disponibles.");
  }

  return lista.map((op) => ({
    id: op.id,
    Lote: op.lote_produccion,
    Fecha: op.fecha_creacion,
    Cierre: op.fecha_cierre,
    Estado: op.estado,
    Responsable: op.responsable?.nombre || "",
  }));
};

// Traer solo las Producciones que no esten terminadas.
export const getProducciones = async () => {
  const lista = await Produccion.findAll({
    include: { model: Responsable, as: "responsable", attributes: ["nombre"] },
    where: { estado: { [Op.ne]: ESTADO_FINALIZADO } },
  });

  if (!lista || lista.length === 0) {
    throw new Error("No hay Registros de Produccion en Proceso.");
  }

  return lista.map((op) => ({
    id: op.id,
    Lote: op.lote_produccion,
    Fecha: op.fecha_creacion,
    Cierre: op.fecha_cierre,
    ordenadas: op.numero_cajas,
    Estado: op.estado,
    // 1: pendiente, 2: en proceso, 3: finalizado
    Proceso: estadoMap[op.estado_sincronizado] || "Desconocido",
    Responsable: op.responsable?.nombre || "",
  }));
};

// Informacion de Proyecciones.
export const getProyeccionContenedor = async (orden) => {
  const produccion = await Produccion.findOne({ where: { id: orden } });
  if (!produccion) {
    throw new Error("La Orden de Produccion no existe.");
  }

  const solicitado = await CajasProduccion.findAll({
    where: { id_produccion: orden },
  });

  if (!solicitado) {
    throw new Error("No se ha establecido una solicitud de cajas.");
  }

  const inventarioData = await Bodega.findAll({
    attributes: [
      "fecha_produccion",
      "tipo_a",
      "tipo_b",
      "tipo_c",
      "tipo_af",
      "tipo_bh",
      "tipo_xl",
      "tipo_cil",
      "tipo_p",
    ],
    raw: true,
  });

  if (inventarioData.length == 0) {
    throw new Error("No Hay Cajas en Bodega, Actualmente.");
  }

  const registrosProduccion = await RegistroAreaFritura.findAll({
    attributes: ["id", "fecha"],
    where: { orden: orden },
  });

  if (registrosProduccion.length == 0) {
    throw new Error("No Hay Registro de Fritura, Actualmente.");
  }

  const infoProduccion = (
    await Promise.all(
      registrosProduccion.map(async (item) => {
        const fechaProduccion = item.fecha;
        const bajadas = await DetalleAreaFritura.findAll({
          attributes: ["lote_produccion", "tipo", "peso", "canastas"],
          where: { id_fritura: item.id },
        });

        const totalProduccion = bajadas.reduce((acc, item) => {
          const cajaTipo = item.tipo;
          if (!acc[cajaTipo]) {
            acc[cajaTipo] = {
              fecha_produccion: fechaProduccion,
              lote_produccion: item.lote_produccion,
              tipo: cajaTipo,
              canastas: 0,
              totalMateria: 0,
            };
          }

          acc[cajaTipo].totalMateria += item.peso;
          acc[cajaTipo].canastas += item.canastas || 0;

          return acc;
        }, {});

        const datos = Object.values(totalProduccion);

        const resultado = datos.map((item) => {
          const totalKg = item.canastas * 1.5;
          const totalMateria = item.totalMateria - totalKg;

          console.log(totalMateria);
          return {
            ...item,
            totalMateria,
          };
        });

        console.log("formateado: ", resultado);

        return resultado;

        /* return lotesProduccion; */
      })
    )
  ).flat();

  const registrosEmpaque = await RegistroAreaEmpaque.findAll({
    attributes: ["id", "promedio_peso"],
    where: { orden: orden },
  });

  if (registrosEmpaque.length == 0) {
    throw new Error("No Hay Registros de Empaque, Actualmente.");
  }

  const inventarioCajas = (
    await Promise.all(
      registrosEmpaque.map(async (item) => {
        const pesoPromedio = item.promedio_peso || 0;
        const registroEmpaque = await DetalleEmpaque.findAll({
          attributes: [
            "fecha_produccion",
            "tipo",
            "numero_canastas",
            "total_cajas",
          ],
          where: { id_empaque: item.id },
        });

        return registroEmpaque.map((detalle) => ({
          fecha_produccion: detalle.fecha_produccion,
          tipo: detalle.tipo,
          numero_canastas: detalle.numero_canastas || 0,
          total_cajas: detalle.total_cajas || 0,
          totalMateria: (detalle.total_cajas || 0) * pesoPromedio,
        }));
      })
    )
  ).flat();

  // AHORA SÍ AGRUPAMOS TODO
  const inventarioAgrupado = inventarioCajas.reduce((acc, item) => {
    const key = `${item.fecha_produccion}_${item.tipo}`;

    if (!acc[key]) {
      acc[key] = {
        fecha_produccion: item.fecha_produccion,
        tipo: item.tipo,
        numero_canastas: 0,
        total_cajas: 0,
        totalMateria: 0,
      };
    }

    acc[key].numero_canastas += item.numero_canastas;
    acc[key].total_cajas += item.total_cajas;
    acc[key].totalMateria += item.totalMateria;

    return acc;
  }, {});

  const resultado = Object.values(inventarioAgrupado);

  return {
    solicitud: solicitado,
    bodega: inventarioData,
    inventarioCajas: resultado,
    inventarioProduccion: infoProduccion,
  };
};

// Trae el rendimiento de todos los lotes de Producción de un contenedor.
export const getPerformances = async (orden) => {
  // Validar orden de producción
  const produccion = await Produccion.findOne({ where: { id: orden } });
  if (!produccion) {
    throw new Error("La Orden de Produccion no existe.");
  }

  // Obtener datos
  const filter = buildDateFilter(null, orden);

  const recepciones = await fetchRecepciones({ [Op.and]: [{ orden }] }, [
    "id",
    "fecha",
    "cantidad",
    "cant_defectos",
  ]);

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles en este contenedor."
    );
  }

  const cortes = await fetchCortes({ [Op.and]: [{ orden }] }, [
    "id",
    "rendimiento_materia",
    "fecha",
    "rechazo_corte",
    "total_materia",
  ]);

  const fritura = await fetchFritura({ [Op.and]: [{ orden }] }, [
    "id",
    "migas_fritura",
    "rechazo_fritura",
    "canastillas",
    "materia_fritura",
    "fecha",
  ]);

  const empaques = await fetchEmpaques({ [Op.and]: [{ orden }] }, [
    "id",
    "fecha_produccion",
    "total_cajas",
    "tipo_producto",
    "peso_kg",
    "rechazo_empaque",
  ]);

  const fechas = [...new Set(recepciones.map((r) => r.fecha))].map((fecha) => ({
    fechaProduccion: fecha,
  }));

  // Calcular rendimientos
  const rendimientoMateria = calcularRendimientoMateria(cortes);
  /* const agrupado = agruparFrituraPorFecha(detalleFritura); */
  const rendimientoFritura = calcularRendimientoFritura(
    fechas,
    fritura,
    cortes
  );
  const rendimientoHFritura = calcularRendimientoHastaFritura(
    fechas,
    fritura,
    recepciones
  );
  const rendimientoEmpaque = calcularRendimientoEmpaque(
    fechas,
    fritura,
    empaques
  );
  const rendimientoTotal = calcularRendimientoTotal(recepciones, empaques);

  const data = formatEstructura(
    fechas,
    rendimientoMateria,
    rendimientoFritura,
    rendimientoHFritura,
    rendimientoEmpaque,
    rendimientoTotal
  );

  return { dataProducciones: data };
};

// Trae el rendimiento de Un lote de Produccion.
export const getPerformanceDay = async (fecha) => {
  const fechas = [{ fechaProduccion: fecha }];
  // Obtener datos
  const filter = buildDateFilter(fecha);

  const recepciones = await fetchRecepciones(filter, true, [
    "id",
    "fecha",
    "cantidad",
    "cant_defectos",
  ]);

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles en esta fecha."
    );
  }

  const alistamiento = await fetchAlistamiento(filter, [
    "id",
    "rechazo",
    "fecha",
  ]);

  const cortes = await fetchCortes(filter, [
    "id",
    "rendimiento_materia",
    "fecha",
    "rechazo_corte",
    "total_materia",
  ]);

  const fritura = await fetchFritura(filter, [
    "id",
    "materia_fritura",
    "migas_fritura",
    "rechazo_fritura",
    "canastillas",
    "fecha",
  ]);

  // Enriquecer dato

  const detalleProv = await enrichCorteWithDetailsProv(cortes);
  const proveedoresCorte = await enrichCorteWithDProv(cortes);
  const detalleEmpaque = await enrichEmpaqueWithDetailsLotes(fecha);

  // Calcular rendimientos
  const rendimientoMateria = calcularRendimientoMateria(cortes);

  const rendimientoFritura = calcularRendimientoFritura(
    fechas,
    fritura,
    cortes
  );

  const rendimientoHFritura = calcularRendimientoHastaFritura(
    fechas,
    fritura,
    recepciones
  );

  const rendimientoEmpaque = calcularRendimientoEmpaque(
    fechas,
    fritura,
    detalleEmpaque,
    true
  );

  const rendimientoTotal = calcularRendimientoTotal(
    recepciones,
    detalleEmpaque
  );

  const rendimientoProveedores = calcularRendimientoProveedores(
    recepciones,
    proveedoresCorte
  );

  const totalCanastillas = fritura.reduce(
    (acc, d) => acc + Number(d.canastillas || 0),
    0
  );

  const dataProveedor = detalleProv.map((op) => ({
    tipo: op.tipo,
    materia: op.materia,
    proveedor: op.proveedor?.nombre || "",
  }));

  const cajas = formatEmpaque(detalleEmpaque);

  const data = formatEstructura(
    fechas,
    rendimientoMateria,
    rendimientoFritura,
    rendimientoHFritura,
    rendimientoEmpaque,
    rendimientoTotal
  );

  const rechazo = calcularRechazoTotal(
    alistamiento,
    recepciones,
    fritura,
    detalleEmpaque,
    cortes
  );

  const rechazoTotal = rechazo.find((item) => item.name == "Total");

  return {
    data,
    rechazo,
    rechazoTotal,
    rendimientoFritura,
    rendimientoHFritura,
    rendimientoEmpaque,
    rendimientoProveedores,
    cajas,
    totalCanastillas,
    dataProveedor,
  };
};

// Trae toda la información relacionada al contenedor o Orden de Producción.
export const getContainerInfo = async (orden) => {
  // Validar orden de producción.
  const produccion = await Produccion.findOne({ where: { id: orden } });
  if (!produccion) {
    throw new Error("La Orden de Produccion no existe.");
  }
  /* const filter = buildDateFilter(null, orden); */
  const recepciones = await fetchRecepciones({ [Op.and]: [{ orden }] }, true, [
    "id",
    "fecha",
    "lote",
    "cantidad",
    "cant_defectos",
  ]);

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles en este contenedor."
    );
  }

  const cortes = await fetchCortes({ [Op.and]: [{ orden }] });
  const fritura = await fetchFritura({ [Op.and]: [{ orden }] }, [
    "migas_fritura",
    "rechazo_fritura",
    "inventario_aceite",
    "materia_fritura",
    "canastillas",
    "gas_inicio",
    "gas_final",
    "fecha",
    "id",
  ]);
  const alistamiento = await fetchAlistamiento({ [Op.and]: [{ orden }] }, [
    "rechazo",
    "maduro",
    "total",
  ]);

  const empaques = await fetchEmpaques({ [Op.and]: [{ orden }] }, [
    "rechazo_empaque",
    "migas_empaque",
    "total_cajas",
  ]);

  // Proveedores Unicos.
  const proveedores = [
    ...new Set(recepciones.map((r) => r.proveedor.nombre)),
  ].map((proveName) => ({
    proveedor: proveName,
  }));
  /* 
  const detalleCorte = await enrichCorteWithDetails(cortes); */
  const { bidones, gas } = infoGas(fritura);

  const containerinfo = {
    Recepcion: infoRecepcion(recepciones, cortes) || {},
    Alistamiento: infoAlistamiento(alistamiento) || {},
    Fritura: infoFritura(fritura) || {},
    Empaque: infoEmpaque(empaques) || {},
    InfoGlobal: {
      Rechazo:
        infoRechazo(recepciones, alistamiento, cortes, fritura, empaques) || 0,
      Bidones: bidones || 0,
      Gas: gas ?? 0,
      Proveedores: proveedores.length || 0,
    },
  };

  return { container: containerinfo };
};

// Trae toda la informacion de 1 proveedor en todas las producciones registradas.
export const getHistorialProv = async (idProveedor) => {
  // Validamos que el proveedor exista
  const proveedor = await Proveedor.findOne({ where: { id: idProveedor } });
  if (!proveedor) {
    throw new Error("El proveedor no existe.");
  }
  // Obtener datos

  const recepciones = await fetchRecepciones(
    { [Op.and]: [{ id_proveedor: idProveedor }] },
    true,
    ["id", "fecha", "cantidad", "cant_defectos", "lote"]
  );

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles de esté proveedor."
    );
  }

  const empaques = await enrichEmpaqueWithProv(idProveedor);

  if (empaques.length === 0) {
    throw new Error(
      "No hay Registros de Producción Disponibles de esté proveedor."
    );
  }

  const rendimientoTotalProv = calcularRendimientoTotalProv(
    recepciones,
    empaques
  );

  return {
    global: rendimientoTotalProv,
  };
};

// Trae toda la informacion del rendimiento de un proveedor.
export const getPerformanceProv = async (idProveedor, fecha) => {
  // Validamos que el proveedor exista
  const proveedor = await Proveedor.findOne({ where: { id: idProveedor } });
  if (!proveedor) {
    throw new Error("El proveedor no existe.");
  }

  // Obtener datos
  const recepciones = await fetchRecepciones(
    {
      [Op.and]: [{ id_proveedor: idProveedor }, { fecha: fecha }],
    },
    true,
    ["id", "fecha", "cantidad", "cant_defectos", "lote"]
  );

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles con este proveedor."
    );
  }

  const fechas = [{ fechaProduccion: fecha }];

  const alistamiento = await enrichAlistamientoWithProv(idProveedor);

  const cortes = await enrichCortesWithProv(idProveedor);

  const fritura = await enrichFrituraWithProv(idProveedor);

  const empaques = await enrichEmpaqueWithProv(idProveedor);

  // Calcular rendimientos
  const rendimientoMateria = calcularRendimientoMateriaProv(
    fechas,
    cortes,
    recepciones
  );

  const rendimientoFritura = calcularRendimientoFrituraProv(
    fechas,
    fritura,
    cortes
  );

  const rendimientoHFritura = calcularRendimientoHastaFrituraProv(
    fechas,
    fritura,
    recepciones
  );

  const rendimientoEmpaque = calcularRendimientoEmpaqueProv(
    fechas,
    empaques,
    fritura
  );

  const rendimientoTotalProv = calcularRendimientoTotalProv(
    recepciones,
    empaques
  );

  const cajas = formatEmpaqueProv(empaques);

  /*const totalCanastas = calcularCanastasProv(fechas, fritura); */

  const data = formatEstructura(
    fechas,
    rendimientoMateria,
    rendimientoFritura,
    rendimientoHFritura,
    rendimientoEmpaque,
    rendimientoTotalProv
  );

  const rechazo = calcularRechazoTotalProv(
    alistamiento,
    recepciones,
    fritura,
    empaques,
    cortes
  );

  return {
    data,
    rechazo,
    cajas,
    empaques,
    recepcion: recepciones,
    cortes: cortes,
    fritura: fritura,
  };
};

// ============================================
//       SERVICIOS BASICOS DE PRODUCCIÓN
// ============================================

export const create = async (data) => {
  const produccion = await Produccion.create(data);

  if (!produccion) {
    throw new Error("No se Guardo la producción.");
  }

  return produccion;
};

export const asigCajas = async (data) => {
  const produccion = await getById(data[0].id_produccion);
  if (!produccion) {
    throw new Error("Produccion no encontrada o no existe.");
  }

  const cajasProduccion = await CajasProduccion.findOne({
    where: { id_produccion: data[0].id_produccion },
  });
  if (cajasProduccion) {
    throw new Error(
      "Ya se ha proporcionado referencias, Asigne una valida."
    );
  }

  const asignacion = await CajasProduccion.bulkCreate(data);

  if (!asignacion) {
    throw new Error("No se pudo asignar las referencias..");
  }

  return asignacion;
};

export const getById = async (id) => {
  return await Produccion.findByPk(id);
};

export const update = async (id, data) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada o no existe.");
  }
  data.actualizado_en = new Date();
  return await produccion.update(data);
};

export const statusDelete = async (id) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada.");
  }
  return await produccion.update({ estado_sincronizado: ESTADO_INACTIVO });
};

export const statusProceso = async (id) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada.");
  }
  return await produccion.update({ estado_sincronizado: ESTADO_FINALIZADO });
};
