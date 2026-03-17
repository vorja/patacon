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
import Cliente from "../models/clientes.mjs";

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
      "lote_proveedor",
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
  const resultado = {};

  recepciones.forEach((data) => {
    // Validar que exista el proveedor
    if (!data.proveedor || !data.proveedor.nombre) return;

    const proveedor = data.proveedor.nombre;
    const loteRecepcion = data.lote; // Ahora SÍ existe este campo

    // Buscar el corte que coincida con el proveedor Y el lote
    const corteFecha = cortes.find((c) => {
      return (
        c.proveedor &&
        c.proveedor.nombre === proveedor &&
        c.lote_proveedor === loteRecepcion
      ); // Comparar por lote
    });

    if (!corteFecha) return;

    // Clave única por proveedor + lote + id_corte
    const clave = `${proveedor}-${corteFecha.lote_proveedor}-${corteFecha.id_corte}`;

    if (resultado[clave]) {
      resultado[clave].materia += data.cantidad;
    } else {
      resultado[clave] = {
        proveedor: proveedor,
        lote_proveedor: corteFecha.lote_proveedor,
        id_corte: corteFecha.id_corte,
        materia: data.cantidad,
        totalMateria: corteFecha.totalMateria,
        rendimiento: corteFecha.rendimiento,
      };
    }
  });

  return Object.values(resultado);
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
    rechazo: Number(rechazoTotal.toFixed(2)),
    maduro: Number(maduroTotal.toFixed(2)),
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
  let porcentajes = 0;
  const registros = Object.values(
    fritura.reduce((acc, item) => {
      if (!acc[item.fecha]) {
        acc[item.fecha] = {
          gas: Math.max(0, Number(item.gas_inicio || 0) - Number(item.gas_final || 0)),
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
      Alistamiento: Number(rechazoAlistamiento.toFixed(2)),
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
    Orden: op.numero_orden,
    cliente: op.cliente_relacionado,
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
    where: { estado: 1 },
    order: [["fecha_creacion", "DESC"]],
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
  try {

    const produccion = await Produccion.findOne({ where: { id: orden } });
    if (!produccion) {
      return { success: false, message: "La Orden de Producción no existe." };
    }

    const solicitado = await CajasProduccion.findAll({
      where: { id_produccion: orden },
    });

    if (!solicitado || solicitado.length === 0) {
      return { success: false, message: "No se ha establecido una solicitud de cajas." };
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
        "estado",
      ],
      raw: true,
      where: { orden }
    });

    if (!inventarioData.length) {
      return { success: false, message: "No hay cajas en bodega actualmente." };
    }

    const registrosProduccion = await RegistroAreaFritura.findAll({
      attributes: ["id", "fecha"],
      where: { orden },
    });

    if (!registrosProduccion.length) {
      return { success: false, message: "No hay registros de fritura actualmente." };
    }

    const infoProduccion = (
      await Promise.all(
        registrosProduccion.map(async (item) => {
          const fechaProduccion = item.fecha;

          const bajadas = await DetalleAreaFritura.findAll({
            attributes: ["lote_produccion", "tipo", "peso", "canastas"],
            where: { id_fritura: item.id },
          });

          const totalProduccion = bajadas.reduce((acc, it) => {
            const tipo = it.tipo;

            if (!acc[tipo]) {
              acc[tipo] = {
                fecha_produccion: fechaProduccion,
                lote_produccion: it.lote_produccion,
                tipo,
                canastas: 0,
                totalMateria: 0,
              };
            }

            acc[tipo].totalMateria += it.peso;
            acc[tipo].canastas += it.canastas || 0;

            return acc;
          }, {});

          return Object.values(totalProduccion).map((it) => {
            const totalKg = it.canastas * 1.5;
            return {
              ...it,
              totalMateria: (it.totalMateria - totalKg).toFixed(1),
            };
          });
        })
      )
    ).flat();

    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      attributes: ["id", "promedio_peso"],
      where: { orden },
    });

    if (!registrosEmpaque.length) {
      return { success: false, message: "No hay registros de empaque actualmente." };
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

    return {
      success: true,
      solicitud: solicitado,
      bodega: inventarioData,
      inventarioCajas: Object.values(inventarioAgrupado),
      inventarioProduccion: infoProduccion,
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error interno al obtener la proyección.",
    };
  }
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

  const fechas = [...new Set(recepciones.map((
  ) => r.fecha))].map((fecha) => ({
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
    "lote",
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

// Trae el rendimiento general sumando todos los días de un contenedor específico
export const getPerformanceGeneral = async (orden) => {
  // Validar que la orden existe
  const produccion = await Produccion.findOne({ where: { id: orden } });
  if (!produccion) {
    throw new Error("La Orden de Produccion no existe.");
  }

  // Obtener todos los registros filtrados por la orden
  const recepciones = await RegistroRecepcionMateriaPrima.findAll({
    attributes: ["id", "fecha", "cantidad", "cant_defectos", "lote"],
    include: [{ model: Proveedor, as: "proveedor", attributes: ["nombre"] }],
    where: { orden },
    raw: true,
    nest: true,
  });

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles para este contenedor.",
    );
  }

  // Obtener todos los cortes filtrados por la orden
  const cortes = await RegistroAreaCorte.findAll({
    attributes: [
      "id",
      "rendimiento_materia",
      "fecha",
      "rechazo_corte",
      "total_materia",
    ],
    where: { orden },
    raw: true,
  });

  // Obtener todas las frituras filtradas por la orden
  const fritura = await RegistroAreaFritura.findAll({
    attributes: [
      "id",
      "materia_fritura",
      "migas_fritura",
      "rechazo_fritura",
      "canastillas",
      "fecha",
    ],
    where: { orden },
    raw: true,
  });

  // Obtener todos los alistamientos filtrados por la orden
  const alistamiento = await ControlAlistamiento.findAll({
    attributes: ["id", "rechazo", "fecha"],
    where: { orden },
    raw: true,
  });

  // Obtener todos los detalles de empaque (estos no tienen orden directa,
  // pero se relacionan a través de las fechas de producción)
  const fechasUnicas = [...new Set(recepciones.map((r) => r.fecha))];

  const detalleEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "tipo",
      [fn("SUM", col("total_cajas")), "totalCajas"],
      [fn("SUM", col("peso_kg")), "totalKg"],
      [fn("SUM", col("total_rechazo")), "rechazo_empaque"],
    ],
    where: {
      fecha_produccion: fechasUnicas,
    },
    group: ["tipo"],
    raw: true,
  });

  // Enriquecer datos de proveedores para cortes
  const corteIds = cortes.map((c) => c.id);
  const detalleProv = await DetalleAreaCorte.findAll({
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

  const proveedoresCorte = await ProveedorCorte.findAll({
    attributes: [
      "id_corte",
      "fecha_produccion",
      "lote_proveedor",
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

  // CALCULAR TOTALES GENERALES

  // 1. Total Materia Prima Recibida
  const totalMateriaPrima = recepciones.reduce(
    (acc, d) => acc + Number(d.cantidad || 0),
    0,
  );

  // 2. Total Materia Procesada en Corte
  const totalMateriaCorte = cortes.reduce(
    (acc, d) => acc + Number(d.total_materia || 0),
    0,
  );

  // 3. Total Materia Procesada en Fritura
  const totalMateriaFritura = fritura.reduce(
    (acc, d) => acc + Number(d.materia_fritura || 0),
    0,
  );

  // 4. Total Producto Terminado (Empaque)
  const totalProductoTerminado = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.totalKg || 0),
    0,
  );

  // 5. Total Cajas Producidas
  const totalCajas = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.totalCajas || 0),
    0,
  );

  // 6. Total Canastillas en Fritura
  const totalCanastillas = fritura.reduce(
    (acc, d) => acc + Number(d.canastillas || 0),
    0,
  );

  // 7. CÁLCULO DE RENDIMIENTOS GENERALES
  const rendimientoMateriaGeneral =
    totalMateriaPrima > 0 ? (totalMateriaCorte / totalMateriaPrima) * 100 : 0;

  const rendimientoFrituraGeneral =
    totalMateriaCorte > 0 ? (totalMateriaFritura / totalMateriaCorte) * 100 : 0;

  const rendimientoHFrituraGeneral =
    totalMateriaPrima > 0 ? (totalMateriaFritura / totalMateriaPrima) * 100 : 0;

  const rendimientoEmpaqueGeneral =
    totalMateriaFritura > 0
      ? (totalProductoTerminado / totalMateriaFritura) * 100
      : 0;

  const rendimientoTotalGeneral =
    totalMateriaPrima > 0
      ? (totalProductoTerminado / totalMateriaPrima) * 100
      : 0;

  // 8. CÁLCULO DE RECHAZOS GENERALES
  const rechazoRecepcion = recepciones.reduce(
    (acc, d) => acc + Number(d.cant_defectos || 0),
    0,
  );

  const rechazoAlistamiento = alistamiento.reduce(
    (acc, a) => acc + Number(a.rechazo || 0),
    0,
  );

  const rechazoCorte = cortes.reduce(
    (acc, c) => acc + Number(c.rechazo_corte || 0),
    0,
  );

  const rechazoFritura = fritura.reduce(
    (acc, d) => acc + Number(d.rechazo_fritura || 0),
    0,
  );

  const rechazoEmpaque = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.rechazo_empaque || 0),
    0,
  );

  const rechazoTotal =
    rechazoRecepcion +
    rechazoAlistamiento +
    rechazoCorte +
    rechazoFritura +
    rechazoEmpaque;

  // 9. RENDIMIENTO POR PROVEEDORES - VERSIÓN CORREGIDA (SIN DUPLICADOS)
  const rendimientoProveedores = {};

  // Primero, crear un mapa de materia recibida por proveedor (SIN DUPLICAR)
  const materiaRecibidaPorProveedor = {};
  const recepcionesPorLote = {}; // Para mantener el detalle por lote si es necesario

  recepciones.forEach((recep) => {
    if (recep.proveedor?.nombre) {
      const proveedor = recep.proveedor.nombre;
      
      // Acumular por proveedor (solo una vez por recepción, pero sumamos todas las recepciones)
      if (!materiaRecibidaPorProveedor[proveedor]) {
        materiaRecibidaPorProveedor[proveedor] = 0;
      }
      materiaRecibidaPorProveedor[proveedor] += Number(recep.cantidad || 0);
      
      // También guardar por lote para detalles
      if (recep.lote) {
        const key = `${proveedor}|${recep.lote}`;
        if (!recepcionesPorLote[key]) {
          recepcionesPorLote[key] = {
            proveedor,
            lote: recep.lote,
            cantidad: 0
          };
        }
        recepcionesPorLote[key].cantidad += Number(recep.cantidad || 0);
      }
    }
  });

  // Procesar los cortes
  const lotesProcesados = new Set(); // Para evitar duplicar lotes en el array de lotes

  proveedoresCorte.forEach((corte) => {
    const proveedor = corte.proveedor?.nombre || "Sin proveedor";

    if (!rendimientoProveedores[proveedor]) {
      rendimientoProveedores[proveedor] = {
        proveedor,
        totalMateriaRecibida: materiaRecibidaPorProveedor[proveedor] || 0, // Asignar solo una vez
        totalMateriaProcesada: 0,
        rendimiento: 0,
        lotes: [],
      };
    }

    // Sumar materia procesada (esto SÍ debe sumar por cada corte)
    rendimientoProveedores[proveedor].totalMateriaProcesada += Number(
      corte.totalMateria || 0,
    );

    // Agregar detalle de lote (evitando duplicados)
    const loteKey = `${proveedor}|${corte.lote_proveedor}`;
    const recepcionLote = recepcionesPorLote[loteKey];
    
    if (!lotesProcesados.has(loteKey)) {
      // Si es un lote nuevo, lo agregamos completo
      rendimientoProveedores[proveedor].lotes.push({
        lote: corte.lote_proveedor,
        materiaRecibida: recepcionLote?.cantidad || 0,
        materiaProcesada: Number(corte.totalMateria || 0),
        rendimiento: Number(corte.rendimiento || 0),
      });
      lotesProcesados.add(loteKey);
    } else {
      // Si el lote ya existe, actualizamos la materia procesada sumando
      const loteExistente = rendimientoProveedores[proveedor].lotes.find(
        l => l.lote === corte.lote_proveedor
      );
      if (loteExistente) {
        loteExistente.materiaProcesada += Number(corte.totalMateria || 0);
        // Recalcular rendimiento del lote
        loteExistente.rendimiento = loteExistente.materiaRecibida > 0
          ? (loteExistente.materiaProcesada / loteExistente.materiaRecibida) * 100
          : 0;
      }
    }
  });

  // Calcular rendimiento final por proveedor
  Object.values(rendimientoProveedores).forEach((prov) => {
    prov.rendimiento =
      prov.totalMateriaRecibida > 0
        ? (prov.totalMateriaProcesada / prov.totalMateriaRecibida) * 100
        : 0;
    prov.rendimiento = Number(prov.rendimiento.toFixed(1));
    prov.totalMateriaRecibida = Number(prov.totalMateriaRecibida.toFixed(2));
    prov.totalMateriaProcesada = Number(prov.totalMateriaProcesada.toFixed(2));
    
    // Redondear valores de lotes
    prov.lotes = prov.lotes.map(lote => ({
      ...lote,
      materiaRecibida: Number(lote.materiaRecibida.toFixed(2)),
      materiaProcesada: Number(lote.materiaProcesada.toFixed(2)),
      rendimiento: Number(lote.rendimiento.toFixed(1))
    }));
  });

  // 10. DATOS DE PROVEEDORES POR TIPO
  const dataProveedor = detalleProv.map((op) => ({
    tipo: op.tipo,
    materia: op.materia,
    proveedor: op.proveedor?.nombre || "",
  }));

  // 11. CAJAS POR TIPO
  const cajas = detalleEmpaque.map((item) => ({
    caja: item.tipo,
    cantidad: item.totalCajas,
    peso_total: Number(item.totalKg || 0).toFixed(2),
  }));

  // 12. ESTRUCTURA DE RENDIMIENTOS
  const dataGeneral = [
    {
      fecha: "GENERAL",
      orden: orden,
      lote: produccion.lote_produccion,
      RendPlatano: Number(rendimientoMateriaGeneral.toFixed(1)),
      RendFritura: Number(rendimientoFrituraGeneral.toFixed(1)),
      RendHFritura: Number(rendimientoHFrituraGeneral.toFixed(1)),
      RendEmpaque: Number(rendimientoEmpaqueGeneral.toFixed(1)),
      RendTotal: Number(rendimientoTotalGeneral.toFixed(1)),
    },
  ];

  const rechazoArray = [
    { name: "Recepcion", value: Number(rechazoRecepcion.toFixed(1)) },
    { name: "Alistamiento", value: Number(rechazoAlistamiento.toFixed(1)) },
    { name: "Corte", value: Number(rechazoCorte.toFixed(1)) },
    { name: "Fritura", value: Number(rechazoFritura.toFixed(1)) },
    { name: "Empaque", value: Number(rechazoEmpaque.toFixed(1)) },
    { name: "Total", value: Number(rechazoTotal.toFixed(1)) },
  ];

  return {
    data: dataGeneral,
    rechazo: rechazoArray,
    rechazoTotal: rechazoArray.find((item) => item.name === "Total"),
    rendimientoFritura: [
      {
        fecha: "GENERAL",
        totalFritura: Number(totalMateriaFritura.toFixed(2)),
        totalCorte: Number(totalMateriaCorte.toFixed(2)),
        rendimiento: Number(rendimientoFrituraGeneral.toFixed(1)),
      },
    ],
    rendimientoHFritura: [
      {
        fecha: "GENERAL",
        totalFritura: Number(totalMateriaFritura.toFixed(2)),
        totalMateria: Number(totalMateriaPrima.toFixed(2)),
        rendimiento: Number(rendimientoHFrituraGeneral.toFixed(1)),
      },
    ],
    rendimientoEmpaque: [
      {
        fecha: "GENERAL",
        totalFritura: Number(totalMateriaFritura.toFixed(2)),
        totalPeso: Number(totalProductoTerminado.toFixed(2)),
        totalCajas: totalCajas,
        rendimiento: Number(rendimientoEmpaqueGeneral.toFixed(1)),
      },
    ],
    rendimientoProveedores: Object.values(rendimientoProveedores),
    cajas: cajas,
    totalCanastillas: totalCanastillas,
    dataProveedor: dataProveedor,
    totales: {
      materiaPrima: Number(totalMateriaPrima.toFixed(2)),
      materiaCorte: Number(totalMateriaCorte.toFixed(2)),
      materiaFritura: Number(totalMateriaFritura.toFixed(2)),
      productoTerminado: Number(totalProductoTerminado.toFixed(2)),
      cajasProducidas: totalCajas,
      canastillasUtilizadas: totalCanastillas,
    },
    metadata: {
      orden: orden,
      lote: produccion.lote_produccion,
      totalRecepciones: recepciones.length,
      totalCortes: cortes.length,
      totalFrituras: fritura.length,
      totalEmpaques: detalleEmpaque.length,
      proveedoresUnicos: Object.keys(rendimientoProveedores).length,
      rangoFechas: {
        desde: recepciones[recepciones.length - 1]?.fecha,
        hasta: recepciones[0]?.fecha,
      },
    },
  };
};


// Trae el rendimiento general del año actual con detalle por producción
export const getPerformanceAnual = async () => {
  const añoActual = new Date().getFullYear();
  const fechaInicio = new Date(`${añoActual}-01-01`);
  //const fechaInicio = new Date(`2025-01-01`);
  const fechaFin = new Date(`${añoActual}-12-31`);

  // Obtener todas las producciones del año
  const producciones = await Produccion.findAll({
    where: {
      fecha_creacion: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    },
    attributes: ['id', 'lote_produccion', 'fecha_creacion'],
    raw: true
  });

  if (producciones.length === 0) {
    throw new Error("No hay producciones registradas en el año actual.");
  }

  const ordenesIds = producciones.map(p => p.id);

  // ============================================
  // DATOS AGREGADOS (TOTALES DEL AÑO)
  // ============================================
  
  // Obtener todas las recepciones del año
  const recepciones = await RegistroRecepcionMateriaPrima.findAll({
    attributes: ["id", "fecha", "cantidad", "cant_defectos", "lote", "orden"],
    include: [{ model: Proveedor, as: "proveedor", attributes: ["nombre", "id"] }],
    where: { 
      orden: ordenesIds
    },
    raw: true,
    nest: true,
  });

  if (recepciones.length === 0) {
    throw new Error("No hay registros de recepciones en el año actual.");
  }

  // Obtener todos los cortes del año
  const cortes = await RegistroAreaCorte.findAll({
    attributes: [
      "id",
      "rendimiento_materia",
      "fecha",
      "rechazo_corte",
      "total_materia",
      "orden",
    ],
    where: { 
      orden: ordenesIds
    },
    raw: true,
  });

  // Obtener todas las frituras del año
  const fritura = await RegistroAreaFritura.findAll({
    attributes: [
      "id",
      "materia_fritura",
      "migas_fritura",
      "rechazo_fritura",
      "canastillas",
      "fecha",
      "orden",
    ],
    where: { 
      orden: ordenesIds
    },
    raw: true,
  });

  // Obtener todos los alistamientos del año
  const alistamiento = await ControlAlistamiento.findAll({
    attributes: ["id", "rechazo", "fecha", "orden"],
    where: { 
      orden: ordenesIds
    },
    raw: true,
  });

  // Obtener IDs de cortes para buscar proveedores
  const corteIds = cortes.map(c => c.id);

  // Obtener proveedores de corte
  const proveedoresCorte = await ProveedorCorte.findAll({
    attributes: [
      "id_corte",
      "fecha_produccion",
      "lote_proveedor",
      "totalMateria",
      "rechazo",
      "rendimiento",
      "id_proveedor",
    ],
    include: [
      {
        model: Proveedor,
        as: "proveedor",
        attributes: ["nombre", "id"],
      },
    ],
    where: { id_corte: corteIds },
    raw: true,
    nest: true,
  });

  // Obtener detalle de proveedores para corte
  const detalleProv = await DetalleAreaCorte.findAll({
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

  // Obtener todas las fechas de producción para empaques
  const fechasProduccion = [
    ...new Set([
      ...cortes.map(c => c.fecha),
      ...fritura.map(f => f.fecha),
      ...alistamiento.map(a => a.fecha),
      ...recepciones.map(r => r.fecha)
    ].filter(Boolean))
  ];

  // Obtener todos los detalles de empaque del año
  const detalleEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "tipo",
      "fecha_produccion",
      [fn("SUM", col("total_cajas")), "totalCajas"],
      [fn("SUM", col("peso_kg")), "totalKg"],
      [fn("SUM", col("total_rechazo")), "rechazo_empaque"],
    ],
    where: {
      fecha_produccion: fechasProduccion,
    },
    group: ["tipo", "fecha_produccion"],
    raw: true,
  });

  // ============================================
  // CÁLCULOS AGREGADOS (TOTALES DEL AÑO)
  // ============================================

  // 1. Total Materia Prima Recibida
  const totalMateriaPrima = recepciones.reduce(
    (acc, d) => acc + Number(d.cantidad || 0),
    0,
  );

  // 2. Total Materia Procesada en Corte
  const totalMateriaCorte = cortes.reduce(
    (acc, d) => acc + Number(d.total_materia || 0),
    0,
  );

  // 3. Total Materia Procesada en Fritura
  const totalMateriaFritura = fritura.reduce(
    (acc, d) => acc + Number(d.materia_fritura || 0),
    0,
  );

  // 4. Total Producto Terminado (Empaque)
  const totalProductoTerminado = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.totalKg || 0),
    0,
  );

  // 5. Total Cajas Producidas
  const totalCajas = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.totalCajas || 0),
    0,
  );

  // 6. Total Canastillas en Fritura
  const totalCanastillas = fritura.reduce(
    (acc, d) => acc + Number(d.canastillas || 0),
    0,
  );

  // 7. CÁLCULO DE RENDIMIENTOS GENERALES ANUALES
  const rendimientoMateriaAnual =
    totalMateriaPrima > 0 ? (totalMateriaCorte / totalMateriaPrima) * 100 : 0;

  const rendimientoFrituraAnual =
    totalMateriaCorte > 0 ? (totalMateriaFritura / totalMateriaCorte) * 100 : 0;

  const rendimientoHFrituraAnual =
    totalMateriaPrima > 0 ? (totalMateriaFritura / totalMateriaPrima) * 100 : 0;

  const rendimientoEmpaqueAnual =
    totalMateriaFritura > 0
      ? (totalProductoTerminado / totalMateriaFritura) * 100
      : 0;

  const rendimientoTotalAnual =
    totalMateriaPrima > 0
      ? (totalProductoTerminado / totalMateriaPrima) * 100
      : 0;

  // 8. CÁLCULO DE RECHAZOS GENERALES ANUALES
  const rechazoRecepcion = recepciones.reduce(
    (acc, d) => acc + Number(d.cant_defectos || 0),
    0,
  );

  const rechazoAlistamiento = alistamiento.reduce(
    (acc, a) => acc + Number(a.rechazo || 0),
    0,
  );

  const rechazoCorte = cortes.reduce(
    (acc, c) => acc + Number(c.rechazo_corte || 0),
    0,
  );

  const rechazoFritura = fritura.reduce(
    (acc, d) => acc + Number(d.rechazo_fritura || 0),
    0,
  );

  const rechazoEmpaque = detalleEmpaque.reduce(
    (acc, d) => acc + Number(d.rechazo_empaque || 0),
    0,
  );

  const rechazoTotal =
    rechazoRecepcion +
    rechazoAlistamiento +
    rechazoCorte +
    rechazoFritura +
    rechazoEmpaque;

  // 9. CAJAS POR TIPO (AGREGADO)
  const cajasAgrupadasPorTipo = {};
  detalleEmpaque.forEach(item => {
    if (!cajasAgrupadasPorTipo[item.tipo]) {
      cajasAgrupadasPorTipo[item.tipo] = {
        tipo: item.tipo,
        cantidad: 0,
        peso_total: 0
      };
    }
    cajasAgrupadasPorTipo[item.tipo].cantidad += item.totalCajas;
    cajasAgrupadasPorTipo[item.tipo].peso_total += Number(item.totalKg || 0);
  });

  const cajasPorTipo = Object.values(cajasAgrupadasPorTipo).map(item => ({
    tipo: item.tipo,
    cantidad: item.cantidad,
    peso_total: item.peso_total.toFixed(2),
    porcentaje: totalCajas > 0 
      ? Number(((item.cantidad / totalCajas) * 100).toFixed(1)) 
      : 0
  }));

  // ============================================
  // RENDIMIENTO DE PROVEEDORES - CON RECHAZO INCLUIDO
  // ============================================
  
  // Set para llevar registro de lotes ya procesados
  const lotesProcesados = new Set();

  // Primero, agrupar todas las recepciones por proveedor y lote
  const recepcionesPorProveedorYLote = {};
  recepciones.forEach((recep) => {
    if (recep.proveedor?.nombre && recep.lote) {
      const key = `${recep.proveedor.nombre}|${recep.lote}`;
      if (!recepcionesPorProveedorYLote[key]) {
        recepcionesPorProveedorYLote[key] = {
          proveedor: recep.proveedor.nombre,
          proveedorId: recep.proveedor.id,
          lote: recep.lote,
          totalCantidad: 0,
        };
      }
      recepcionesPorProveedorYLote[key].totalCantidad += Number(
        recep.cantidad || 0,
      );
    }
  });

  // Inicializar proveedores con sus recepciones (UNA SOLA VEZ por lote)
  const rendimientoProveedoresGlobal = {};
  
  Object.values(recepcionesPorProveedorYLote).forEach((recepcion) => {
    const proveedor = recepcion.proveedor;
    
    if (!rendimientoProveedoresGlobal[proveedor]) {
      rendimientoProveedoresGlobal[proveedor] = {
        proveedorId: recepcion.proveedorId,
        proveedor,
        totalMateriaRecibida: 0,
        totalMateriaProcesada: 0,
        totalRechazo: 0, // <-- NUEVO: campo de rechazo
        rendimiento: 0,
        lotes: [],
      };
    }
    
    // Sumar materia recibida UNA SOLA VEZ por lote
    rendimientoProveedoresGlobal[proveedor].totalMateriaRecibida += recepcion.totalCantidad;
  });

  // Procesar cortes (la materia procesada y rechazo SÍ pueden sumarse múltiples veces por lote)
  proveedoresCorte.forEach((corte) => {
    const proveedor = corte.proveedor?.nombre || "Sin proveedor";
    const lote = corte.lote_proveedor;
    const key = `${proveedor}|${lote}`;
    
    // Identificador único para este lote
    const loteId = `${proveedor}|${lote}`;
    
    // Buscar la recepción para este lote
    const recepcionAgrupada = recepcionesPorProveedorYLote[key];
    
    if (rendimientoProveedoresGlobal[proveedor]) {
      // Sumar materia procesada (SIEMPRE se suma, por cada corte)
      rendimientoProveedoresGlobal[proveedor].totalMateriaProcesada += Number(
        corte.totalMateria || 0,
      );
      
      // SUMAR RECHAZO (por cada corte)
      rendimientoProveedoresGlobal[proveedor].totalRechazo += Number(
        corte.rechazo || 0,
      );
      
      // Si es la primera vez que vemos este lote, agregamos información completa
      if (!lotesProcesados.has(loteId)) {
        lotesProcesados.add(loteId);
        
        // Agregar información del lote (con materia recibida)
        rendimientoProveedoresGlobal[proveedor].lotes.push({
          lote: lote,
          fecha: corte.fecha_produccion,
          materiaRecibida: recepcionAgrupada?.totalCantidad || 0,
          materiaProcesada: Number(corte.totalMateria || 0),
          rechazo: Number(corte.rechazo || 0), // <-- NUEVO: rechazo por lote
          rendimiento: Number(corte.rendimiento || 0),
        });
      } else {
        // Si el lote ya existe, agregamos otro corte (sin materia recibida)
        rendimientoProveedoresGlobal[proveedor].lotes.push({
          lote: lote,
          fecha: corte.fecha_produccion,
          materiaRecibida: 0, // No sumar recibida otra vez
          materiaProcesada: Number(corte.totalMateria || 0),
          rechazo: Number(corte.rechazo || 0), // <-- NUEVO: rechazo por lote
          rendimiento: Number(corte.rendimiento || 0),
        });
      }
    }
  });

  // Calcular rendimiento final por proveedor
  Object.values(rendimientoProveedoresGlobal).forEach((prov) => {
    prov.rendimiento =
      prov.totalMateriaRecibida > 0
        ? (prov.totalMateriaProcesada / prov.totalMateriaRecibida) * 100
        : 0;
    prov.rendimiento = Number(prov.rendimiento.toFixed(1));
    prov.totalMateriaRecibida = Number(prov.totalMateriaRecibida.toFixed(2));
    prov.totalMateriaProcesada = Number(prov.totalMateriaProcesada.toFixed(2));
    prov.totalRechazo = Number(prov.totalRechazo.toFixed(1)); // <-- NUEVO: formatear rechazo
    
    // Ordenar lotes por fecha
    prov.lotes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  });

  // ============================================
  // DETALLE POR PRODUCCIÓN INDIVIDUAL
  // ============================================
  
  const detalleProducciones = await Promise.all(
    producciones.map(async (prod) => {
      // Filtrar datos por esta orden específica
      const recepcionesProd = recepciones.filter(r => r.orden === prod.id);
      const cortesProd = cortes.filter(c => c.orden === prod.id);
      const frituraProd = fritura.filter(f => f.orden === prod.id);
      const alistamientoProd = alistamiento.filter(a => a.orden === prod.id);
      
      // Obtener IDs de cortes de esta producción
      const corteIdsProd = cortesProd.map(c => c.id);
      
      // Obtener proveedores de corte para esta producción
      const proveedoresCorteProd = proveedoresCorte.filter(pc => 
        corteIdsProd.includes(pc.id_corte)
      );

      // Obtener fechas de recepción de esta producción
      const fechasProd = [...new Set(recepcionesProd.map(r => r.fecha))];
      
      // Filtrar empaques por estas fechas
      const empaquesProd = detalleEmpaque.filter(e => 
        fechasProd.includes(e.fecha_produccion)
      );

      // Calcular totales de esta producción
      const materiaPrimaProd = recepcionesProd.reduce(
        (acc, d) => acc + Number(d.cantidad || 0), 0
      );

      const materiaCorteProd = cortesProd.reduce(
        (acc, d) => acc + Number(d.total_materia || 0), 0
      );

      const materiaFrituraProd = frituraProd.reduce(
        (acc, d) => acc + Number(d.materia_fritura || 0), 0
      );

      const productoTerminadoProd = empaquesProd.reduce(
        (acc, d) => acc + Number(d.totalKg || 0), 0
      );

      const cajasProd = empaquesProd.reduce(
        (acc, d) => acc + Number(d.totalCajas || 0), 0
      );

      // Calcular rechazos de esta producción
      const rechazoRecepcionProd = recepcionesProd.reduce(
        (acc, d) => acc + Number(d.cant_defectos || 0), 0
      );

      const rechazoAlistamientoProd = alistamientoProd.reduce(
        (acc, a) => acc + Number(a.rechazo || 0), 0
      );

      const rechazoCorteProd = cortesProd.reduce(
        (acc, c) => acc + Number(c.rechazo_corte || 0), 0
      );

      const rechazoFrituraProd = frituraProd.reduce(
        (acc, d) => acc + Number(d.rechazo_fritura || 0), 0
      );

      const rechazoEmpaqueProd = empaquesProd.reduce(
        (acc, d) => acc + Number(d.rechazo_empaque || 0), 0
      );

      const rechazoTotalProd = 
        rechazoRecepcionProd +
        rechazoAlistamientoProd +
        rechazoCorteProd +
        rechazoFrituraProd +
        rechazoEmpaqueProd;

      // Calcular rendimientos de esta producción
      const rendimientoMateriaProd = materiaPrimaProd > 0 
        ? (materiaCorteProd / materiaPrimaProd) * 100 : 0;
      
      const rendimientoFrituraProd = materiaCorteProd > 0 
        ? (materiaFrituraProd / materiaCorteProd) * 100 : 0;
      
      const rendimientoHFrituraProd = materiaPrimaProd > 0 
        ? (materiaFrituraProd / materiaPrimaProd) * 100 : 0;
      
      const rendimientoEmpaqueProd = materiaFrituraProd > 0 
        ? (productoTerminadoProd / materiaFrituraProd) * 100 : 0;
      
      const rendimientoTotalProd = materiaPrimaProd > 0 
        ? (productoTerminadoProd / materiaPrimaProd) * 100 : 0;

      // Calcular rendimiento de proveedores para esta producción
      const rendimientoProveedoresProd = {};
      const lotesProdProcesados = new Set();
      
      // Agrupar recepciones de esta producción por proveedor y lote
      const recepcionesProdPorLote = {};
      recepcionesProd.forEach((recep) => {
        if (recep.proveedor?.nombre && recep.lote) {
          const key = `${recep.proveedor.nombre}|${recep.lote}`;
          if (!recepcionesProdPorLote[key]) {
            recepcionesProdPorLote[key] = {
              proveedor: recep.proveedor.nombre,
              proveedorId: recep.proveedor.id,
              lote: recep.lote,
              totalCantidad: 0,
            };
          }
          recepcionesProdPorLote[key].totalCantidad += Number(recep.cantidad || 0);
        }
      });

      // Inicializar proveedores con sus recepciones (UNA VEZ por lote)
      Object.values(recepcionesProdPorLote).forEach((recepcion) => {
        const proveedor = recepcion.proveedor;
        
        if (!rendimientoProveedoresProd[proveedor]) {
          rendimientoProveedoresProd[proveedor] = {
            proveedorId: recepcion.proveedorId,
            proveedor,
            totalMateriaRecibida: 0,
            totalMateriaProcesada: 0,
            totalRechazo: 0, // <-- NUEVO: rechazo por proveedor en producción
            rendimiento: 0,
          };
        }
        
        rendimientoProveedoresProd[proveedor].totalMateriaRecibida += recepcion.totalCantidad;
      });

      // Procesar cortes de esta producción
      proveedoresCorteProd.forEach((corte) => {
        const proveedor = corte.proveedor?.nombre || "Sin proveedor";
        
        if (rendimientoProveedoresProd[proveedor]) {
          // Sumar materia procesada (por cada corte)
          rendimientoProveedoresProd[proveedor].totalMateriaProcesada += Number(
            corte.totalMateria || 0,
          );
          
          // SUMAR RECHAZO (por cada corte)
          rendimientoProveedoresProd[proveedor].totalRechazo += Number(
            corte.rechazo || 0,
          );
        }
      });

      // Calcular rendimiento final por proveedor para esta producción
      Object.values(rendimientoProveedoresProd).forEach((prov) => {
        prov.rendimiento =
          prov.totalMateriaRecibida > 0
            ? (prov.totalMateriaProcesada / prov.totalMateriaRecibida) * 100
            : 0;
        prov.rendimiento = Number(prov.rendimiento.toFixed(1));
        prov.totalMateriaRecibida = Number(prov.totalMateriaRecibida.toFixed(2));
        prov.totalMateriaProcesada = Number(prov.totalMateriaProcesada.toFixed(2));
        prov.totalRechazo = Number(prov.totalRechazo.toFixed(1)); // <-- NUEVO: formatear rechazo
      });

      return {
        orden: prod.id,
        lote: prod.lote_produccion,
        fecha: prod.fecha_creacion,
        rendimiento: {
          materia: Number(rendimientoMateriaProd.toFixed(1)),
          fritura: Number(rendimientoFrituraProd.toFixed(1)),
          hfritura: Number(rendimientoHFrituraProd.toFixed(1)),
          empaque: Number(rendimientoEmpaqueProd.toFixed(1)),
          total: Number(rendimientoTotalProd.toFixed(1))
        },
        rechazo: {
          recepcion: Number(rechazoRecepcionProd.toFixed(1)),
          alistamiento: Number(rechazoAlistamientoProd.toFixed(1)),
          corte: Number(rechazoCorteProd.toFixed(1)),
          fritura: Number(rechazoFrituraProd.toFixed(1)),
          empaque: Number(rechazoEmpaqueProd.toFixed(1)),
          total: Number(rechazoTotalProd.toFixed(1))
        },
        proveedores: Object.values(rendimientoProveedoresProd), // <-- Ahora incluye rechazo
        totales: {
          materiaPrima: Number(materiaPrimaProd.toFixed(2)),
          materiaCorte: Number(materiaCorteProd.toFixed(2)),
          materiaFritura: Number(materiaFrituraProd.toFixed(2)),
          productoTerminado: Number(productoTerminadoProd.toFixed(2)),
          cajas: cajasProd,
          canastillas: frituraProd.reduce((acc, f) => acc + Number(f.canastillas || 0), 0)
        },
        registros: {
          recepciones: recepcionesProd.length,
          cortes: cortesProd.length,
          frituras: frituraProd.length,
          alistamientos: alistamientoProd.length,
          empaques: empaquesProd.length
        }
      };
    })
  );

  // Ordenar por fecha (más reciente primero)
  detalleProducciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // 10. ESTRUCTURA DE RENDIMIENTOS AGREGADOS
  const rendimiento = [
    {
      periodo: `${añoActual}`,
      totalProducciones: producciones.length,
      rendimientoMateria: Number(rendimientoMateriaAnual.toFixed(1)),
      rendimientoFritura: Number(rendimientoFrituraAnual.toFixed(1)),
      rendimientoHFritura: Number(rendimientoHFrituraAnual.toFixed(1)),
      rendimientoEmpaque: Number(rendimientoEmpaqueAnual.toFixed(1)),
      rendimientoTotal: Number(rendimientoTotalAnual.toFixed(1)),
    },
  ];

  // 11. ESTRUCTURA DE RECHAZOS AGREGADOS
  const rechazoArray = [
    { area: "Recepcion", valor: Number(rechazoRecepcion.toFixed(1)) },
    { area: "Alistamiento", valor: Number(rechazoAlistamiento.toFixed(1)) },
    { area: "Corte", valor: Number(rechazoCorte.toFixed(1)) },
    { area: "Fritura", valor: Number(rechazoFritura.toFixed(1)) },
    { area: "Empaque", valor: Number(rechazoEmpaque.toFixed(1)) },
    { area: "Total", valor: Number(rechazoTotal.toFixed(1)) },
  ];

  // 12. DATOS DE PROVEEDORES POR TIPO
  const dataProveedor = detalleProv.map((op) => ({
    tipo: op.tipo,
    materia: op.materia,
    proveedor: op.proveedor?.nombre || "",
  }));

  // 13. RESUMEN DE TOTALES
  const totales = {
    año: añoActual,
    materiaPrima: Number(totalMateriaPrima.toFixed(2)),
    materiaCorte: Number(totalMateriaCorte.toFixed(2)),
    materiaFritura: Number(totalMateriaFritura.toFixed(2)),
    productoTerminado: Number(totalProductoTerminado.toFixed(2)),
    cajasProducidas: totalCajas,
    canastillasUtilizadas: totalCanastillas,
    produccionesRealizadas: producciones.length,
  };

  // 14. ESTADÍSTICAS MENSUALES
  const produccionesPorMes = {};
  recepciones.forEach(rec => {
    if (rec.fecha) {
      const mes = new Date(rec.fecha).getMonth() + 1;
      if (!produccionesPorMes[mes]) {
        produccionesPorMes[mes] = {
          mes,
          materiaPrima: 0,
          productoTerminado: 0,
          rechazoTotal: 0,
          producciones: new Set()
        };
      }
      produccionesPorMes[mes].materiaPrima += Number(rec.cantidad || 0);
      produccionesPorMes[mes].producciones.add(rec.orden);
    }
  });

  detalleEmpaque.forEach(emp => {
    if (emp.fecha_produccion) {
      const mes = new Date(emp.fecha_produccion).getMonth() + 1;
      if (produccionesPorMes[mes]) {
        produccionesPorMes[mes].productoTerminado += Number(emp.totalKg || 0);
        produccionesPorMes[mes].rechazoTotal += Number(emp.rechazo_empaque || 0);
      }
    }
  });

  cortes.forEach(c => {
    if (c.fecha) {
      const mes = new Date(c.fecha).getMonth() + 1;
      if (produccionesPorMes[mes]) {
        produccionesPorMes[mes].rechazoTotal += Number(c.rechazo_corte || 0);
      }
    }
  });

  fritura.forEach(f => {
    if (f.fecha) {
      const mes = new Date(f.fecha).getMonth() + 1;
      if (produccionesPorMes[mes]) {
        produccionesPorMes[mes].rechazoTotal += Number(f.rechazo_fritura || 0);
      }
    }
  });

  alistamiento.forEach(a => {
    if (a.fecha) {
      const mes = new Date(a.fecha).getMonth() + 1;
      if (produccionesPorMes[mes]) {
        produccionesPorMes[mes].rechazoTotal += Number(a.rechazo || 0);
      }
    }
  });

  const estadisticasMensuales = Object.values(produccionesPorMes).map(item => ({
    mes: item.mes,
    nombreMes: new Date(añoActual, item.mes - 1, 1).toLocaleString('default', { month: 'long' }),
    materiaPrima: Number(item.materiaPrima.toFixed(2)),
    productoTerminado: Number(item.productoTerminado.toFixed(2)),
    rechazoTotal: Number(item.rechazoTotal.toFixed(1)),
    produccionesEnMes: item.producciones.size,
    rendimiento: item.materiaPrima > 0 
      ? Number(((item.productoTerminado / item.materiaPrima) * 100).toFixed(1))
      : 0
  }));

  // Verificación final: La suma de materia recibida por proveedores debe ser IGUAL al total general
  const sumaProveedores = Object.values(rendimientoProveedoresGlobal).reduce(
    (acc, prov) => acc + prov.totalMateriaRecibida, 0
  );

  const sumaRechazoProveedores = Object.values(rendimientoProveedoresGlobal).reduce(
    (acc, prov) => acc + prov.totalRechazo, 0
  );

  console.log(`📊 Verificación de Materia Prima:`);
  console.log(`   Total General: ${totalMateriaPrima.toFixed(2)}`);
  console.log(`   Suma por Proveedores: ${sumaProveedores.toFixed(2)}`);
  console.log(`   Diferencia: ${Math.abs(totalMateriaPrima - sumaProveedores).toFixed(2)}`);
  console.log(`📊 Verificación de Rechazo:`);
  console.log(`   Total General: ${rechazoCorte.toFixed(2)}`);
  console.log(`   Suma por Proveedores: ${sumaRechazoProveedores.toFixed(2)}`);

  return {
    rendimiento,
    detalleProducciones,
    rendimientoProveedores: Object.values(rendimientoProveedoresGlobal), // <-- Ahora incluye totalRechazo
    rechazo: rechazoArray,
    rechazoTotal: rechazoArray.find((item) => item.area === "Total"),
    cajas: cajasPorTipo,
    totales,
    dataProveedor,
    estadisticasMensuales,
    metadata: {
      año: añoActual,
      totalProducciones: producciones.length,
      totalRecepciones: recepciones.length,
      totalCortes: cortes.length,
      totalFrituras: fritura.length,
      totalEmpaques: detalleEmpaque.length,
      totalProveedores: Object.keys(rendimientoProveedoresGlobal).length,
      rangoFechas: {
        desde: recepciones[recepciones.length - 1]?.fecha,
        hasta: recepciones[0]?.fecha,
      },
    },
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
      Rechazo:infoRechazo(recepciones, alistamiento, cortes, fritura, empaques) || 0,
      Bidones: bidones,
      Gas: Number(gas ?? 0).toFixed(2),
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

  // Obtener datos filtrados por proveedor y fecha
  const recepciones = await fetchRecepciones(
    {
      [Op.and]: [{ id_proveedor: idProveedor }, { fecha: fecha }],
    },
    true,
    ["id", "fecha", "cantidad", "cant_defectos", "lote"],
  );

  if (recepciones.length === 0) {
    throw new Error(
      "No hay Registros de Recepciones Disponibles con este proveedor en la fecha especificada.",
    );
  }

  const fechas = [{ fechaProduccion: fecha }];

  // Filtramos alistamiento por proveedor y fecha
  const alistamientoRaw = await enrichAlistamientoWithProv(idProveedor);
  const alistamiento = alistamientoRaw.filter((item) => {
    const fechaItem = item.info?.[0]?.fecha;
    return (
      fechaItem &&
      new Date(fechaItem).toDateString() === new Date(fecha).toDateString()
    );
  });

  // Filtramos cortes por proveedor y fecha
  const cortesRaw = await enrichCortesWithProv(idProveedor);
  const cortes = cortesRaw.filter((item) => {
    const fechaItem = item.fecha_produccion || item.info?.[0]?.fecha;
    return (
      fechaItem &&
      new Date(fechaItem).toDateString() === new Date(fecha).toDateString()
    );
  });

  // Filtramos fritura por proveedor y fecha
  const frituraRaw = await enrichFrituraWithProv(idProveedor);
  const fritura = frituraRaw.filter((item) => {
    const fechaItem = item.info?.[0]?.fecha;
    return (
      fechaItem &&
      new Date(fechaItem).toDateString() === new Date(fecha).toDateString()
    );
  });

  // Filtramos empaques por proveedor y fecha (usando fecha_produccion)
  const empaquesRaw = await enrichEmpaqueWithProv(idProveedor);
  const empaques = empaquesRaw.filter((item) => {
    const fechaItem = item.fecha_produccion;
    return (
      fechaItem &&
      new Date(fechaItem).toDateString() === new Date(fecha).toDateString()
    );
  });

  // Verificar si hay datos después del filtrado
  if (cortes.length === 0) {
    console.warn(
      "No hay registros de corte para este proveedor en la fecha especificada",
    );
  }

  if (fritura.length === 0) {
    console.warn(
      "No hay registros de fritura para este proveedor en la fecha especificada",
    );
  }

  if (empaques.length === 0) {
    console.warn(
      "No hay registros de empaque para este proveedor en la fecha especificada",
    );
  }

  // Calcular rendimientos (solo si hay datos)
  const rendimientoMateria =
    cortes.length > 0
      ? calcularRendimientoMateriaProv(fechas, cortes, recepciones)
      : [];

  const rendimientoFritura =
    fritura.length > 0 && cortes.length > 0
      ? calcularRendimientoFrituraProv(fechas, fritura, cortes)
      : [];

  const rendimientoHFritura =
    fritura.length > 0
      ? calcularRendimientoHastaFrituraProv(fechas, fritura, recepciones)
      : [];

  const rendimientoEmpaque = calcularRendimientoEmpaqueProv(
    fechas,
    empaques,
    fritura,
  );

  const rendimientoTotalProv = calcularRendimientoTotalProv(
    recepciones,
    empaques,
  );

  // cajas se calcula con los empaques filtrados
  const cajas = formatEmpaqueProv(empaques);

  const data = formatEstructura(
    fechas,
    rendimientoMateria,
    rendimientoFritura,
    rendimientoHFritura,
    rendimientoEmpaque,
    rendimientoTotalProv,
  );

  const rechazo = calcularRechazoTotalProv(
    alistamiento,
    recepciones,
    fritura,
    empaques,
    cortes,
  );

  return {
    data,
    rechazo,
    cajas, // Ahora cajas solo mostrará los tipos de la fecha filtrada
    empaques, // Ahora empaques solo muestra los registros de la fecha filtrada
    recepcion: recepciones,
    cortes: cortes,
    fritura: fritura,
    metadata: {
      fecha: fecha,
      proveedor: proveedor.nombre,
      tieneCortes: cortes.length > 0,
      tieneFritura: fritura.length > 0,
      tieneEmpaque: empaques.length > 0,
    },
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

  // Si existe cliente_relacionado y no está vacío/nulo
  if (data.cliente_relacionado && data.cliente_relacionado !== "") {
    try {
      // Extraer el ID antes de la coma
      const clienteId = data.cliente_relacionado.split(",")[0]?.trim();

      // Verificar que el ID sea válido
      if (clienteId && !isNaN(clienteId)) {
        // Buscar el cliente primero
        const cliente = await Cliente.findByPk(clienteId);

        if (cliente) {
          // Actualizar incrementando numero_solicitud
          await cliente.update({
            numero_solicitud: (cliente.numero_solicitud || 0) + 1,
          });
          console.log(
            `Cliente ${clienteId} actualizado. Nuevo numero_solicitud: ${cliente.numero_solicitud + 1}`,
          );
        } else {
          console.warn(`Cliente con ID ${clienteId} no encontrado`);
        }
      }
    } catch (error) {
      console.error("Error al actualizar numero_solicitud del cliente:", error);
    }
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
    throw new Error("Ya se ha proporcionado referencias, Asigne una valida.");
  }

  // Calcular la suma de numero_cajas
  const sumaCajas = data.reduce(
    (total, item) => total + (item.numero_cajas || 0),
    0,
  );

  // Crear las cajas de producción
  const asignacion = await CajasProduccion.bulkCreate(data);

  if (!asignacion) {
    throw new Error("No se pudo asignar las referencias.");
  }

  // Actualizar el campo numero_cajas en Produccion
  await Produccion.update(
    {
      numero_cajas: sumaCajas,
    },
    {
      where: { id: data[0].id_produccion },
    },
  );

  return asignacion;
};

export const getById = async (id) => {
  return await Produccion.findByPk(id, {
    include: [
      {
        model: Responsable,
        as: "responsable",
        attributes: ["id", "nombre"], // Añade más campos si necesitas
      },
    ],
  });
};

export const update = async (id, data) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada o no existe.");
  }

  // Guardar el cliente anterior ANTES de actualizar
  const clienteAnteriorRaw = produccion.cliente_relacionado;

  // Extraer ID del cliente anterior si existe
  let clienteAnteriorId = null;
  if (clienteAnteriorRaw && clienteAnteriorRaw !== "") {
    clienteAnteriorId = clienteAnteriorRaw.split(",")[0]?.trim();
  }

  data.actualizado_en = new Date();
  const produccionActualizada = await produccion.update(data);

  // Procesar el nuevo cliente_relacionado
  if (data.cliente_relacionado && data.cliente_relacionado !== "") {
    try {
      const nuevoClienteId = data.cliente_relacionado.split(",")[0]?.trim();

      if (nuevoClienteId && !isNaN(nuevoClienteId)) {
        // Si el cliente cambió (el ID nuevo es diferente al anterior)
        if (nuevoClienteId !== clienteAnteriorId) {
          // 1. RESTAR 1 al cliente ANTERIOR (si existía)
          if (clienteAnteriorId && !isNaN(clienteAnteriorId)) {
            const clienteAnterior = await Cliente.findByPk(clienteAnteriorId);
            if (clienteAnterior) {
              await clienteAnterior.update({
                numero_solicitud: Math.max(
                  0,
                  (clienteAnterior.numero_solicitud || 0) - 1,
                ), // Evitar negativos
              });
              console.log(`Cliente anterior ${clienteAnteriorId} decrementado`);
            }
          }

          // 2. SUMAR 1 al cliente NUEVO
          const clienteNuevo = await Cliente.findByPk(nuevoClienteId);
          if (clienteNuevo) {
            await clienteNuevo.update({
              numero_solicitud: (clienteNuevo.numero_solicitud || 0) + 1,
            });
            console.log(`Cliente nuevo ${nuevoClienteId} incrementado`);
          } else {
            console.warn(
              `Cliente nuevo con ID ${nuevoClienteId} no encontrado`,
            );
          }
        } else {
          console.log(
            `Mismo cliente (${nuevoClienteId}), no se modifican los contadores`,
          );
        }
      }
    } catch (error) {
      console.error(
        "Error al actualizar numero_solicitud del cliente en update:",
        error,
      );
    }
  } else {
    // Si en la actualización se envía cliente_relacionado vacío, ¿qué hacemos?
    // Podrías restar del cliente anterior si ya no tiene solicitudes asociadas
    if (clienteAnteriorId && !isNaN(clienteAnteriorId)) {
      try {
        const clienteAnterior = await Cliente.findByPk(clienteAnteriorId);
        if (clienteAnterior) {
          await clienteAnterior.update({
            numero_solicitud: Math.max(
              0,
              (clienteAnterior.numero_solicitud || 0) - 1,
            ),
          });
          console.log(
            `Cliente anterior ${clienteAnteriorId} decrementado (se quitó la solicitud)`,
          );
        }
      } catch (error) {
        console.error("Error al decrementar cliente anterior:", error);
      }
    }
  }

  return produccionActualizada;
};

export const statusDelete = async (id) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada.");
  }
  return await produccion.update({ estado: ESTADO_INACTIVO });
};

export const statusProceso = async (id) => {
  const produccion = await getById(id);
  if (!produccion) {
    throw new Error("Produccion no encontrada.");
  }
  return await produccion.update({ estado_sincronizado: ESTADO_FINALIZADO });
};
