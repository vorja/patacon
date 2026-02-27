import { col, fn, Op } from "sequelize";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import DetalleCaja from "../models/detalleCajas.mjs";
import Bodega from "../models/bodega.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";
import ProveedoresEmpaque from "../models/proveedoresEmpaque.mjs";
import Proveedor from "../models/proveedores.mjs";
import VariablesProveedor from "../models/variablesProveedor.mjs";
import DetalleProveedor from "../models/detalleProveedor.mjs";
import RegistroAreaFritura from "../models/registroAreaFritura.mjs";

import Produccion from "../models/produccion.mjs";
import HistorialEnvios from "../models/historialEnvios.mjs";
import HistorialSobrantes from "../models/historialSobrantes.mjs";

export const obtenerDatosPdf = async (orden) => {
  try {
    // Obtener la producción
    const produccion = await Produccion.findAll({
      where: {
        id: orden,
      },
    });

    // Obtener registros de área de empaque relacionados con la orden
    const registroAreaEmpaque = await RegistroAreaEmpaque.findAll({
      where: {
        orden: orden,
      },
    });

    // Obtener los IDs de los registros de empaque encontrados
    const idsRegistroEmpaque = registroAreaEmpaque.map((reg) => reg.id);

    // Obtener detalles de empaque relacionados con los registros de área de empaque
    let detalleEmpaque = [];
    if (idsRegistroEmpaque.length > 0) {
      detalleEmpaque = await DetalleEmpaque.findAll({
        where: {
          id_empaque: {
            [Op.in]: idsRegistroEmpaque,
          },
        },
      });
    }

    // Procesar los detalles de empaque para combinar AF con A
    const detalleEmpaqueProcesado = [];
    const mapaEmpaques = new Map();

    detalleEmpaque.forEach((detalle) => {
      const key = `${detalle.id_empaque}_${detalle.tipo === "AF" ? "A" : detalle.tipo}`;

      if (detalle.tipo === "AF") {
        // Si es AF, buscamos si ya existe un registro A con el mismo id_empaque
        const keyA = `${detalle.id_empaque}_A`;

        if (mapaEmpaques.has(keyA)) {
          // Si existe, sumamos los valores
          const existente = mapaEmpaques.get(keyA);
          existente.total_cajas += detalle.total_cajas;
          existente.peso_kg += detalle.peso_kg;
          existente.numero_canastas += detalle.numero_canastas;
          existente.total_rechazo += detalle.total_rechazo;
          existente.migas_empaque += detalle.migas_empaque;
          // Agregamos el ID del AF para referencia si es necesario
          existente.ids_af = existente.ids_af || [];
          existente.ids_af.push(detalle.id);
        } else {
          // Si no existe un A, creamos uno nuevo con los datos del AF
          const nuevoRegistro = {
            ...detalle.toJSON(),
            tipo: "A",
            ids_af: [detalle.id],
          };
          mapaEmpaques.set(keyA, nuevoRegistro);
        }
      } else {
        // Si es tipo A u otro, simplemente lo agregamos o actualizamos
        if (mapaEmpaques.has(key)) {
          // Si ya existe (por ejemplo, por un AF que se convirtió), sumamos
          const existente = mapaEmpaques.get(key);
          existente.total_cajas += detalle.total_cajas;
          existente.peso_kg += detalle.peso_kg;
          existente.numero_canastas += detalle.numero_canastas;
          existente.total_rechazo += detalle.total_rechazo;
          existente.migas_empaque += detalle.migas_empaque;
        } else {
          // Si no existe, lo agregamos
          mapaEmpaques.set(key, { ...detalle.toJSON() });
        }
      }
    });

    // Convertir el mapa a array
    detalleEmpaqueProcesado.push(...mapaEmpaques.values());

    return {
      produccion: produccion,
      registroAreaEmpaque: registroAreaEmpaque,
      detalleEmpaque: detalleEmpaqueProcesado,
    };
  } catch (error) {
    console.error("❌ Error en service:", error);
    throw error;
  }
};



export const obtenerHistorialSobrante = async (orden, fecha, transaction) => {
  try {
    const existeOrden = await HistorialSobrantes.findOne({
      where: { orden: orden },
      transaction,
    });

    if (existeOrden) {
      return {
        sobrantes: [],
        total_registros: 0,
        creado: false,
        mensaje: "La orden ya existe en sobrantes, no se procesó.",
      };
    }

    const sobrantes = await HistorialSobrantes.findAll({
      where: { estado: 0 },
      raw: true,
      transaction,
    });

    if (sobrantes.length === 0) {
      return {
        sobrantes: [],
        total_registros: 0,
        creado: false,
      };
    }

    // 🧮 Calcular totales
    const totales = sobrantes.reduce(
      (acc, item) => {
        acc.tipo_a += item.tipo_a || 0;
        acc.tipo_b += item.tipo_b || 0;
        acc.tipo_c += item.tipo_c || 0;
        acc.tipo_af += item.tipo_af || 0;
        acc.tipo_bh += item.tipo_bh || 0;
        acc.tipo_xl += item.tipo_xl || 0;
        acc.tipo_cil += item.tipo_cil || 0;
        acc.tipo_p += item.tipo_p || 0;
        return acc;
      },
      {
        tipo_a: 0,
        tipo_b: 0,
        tipo_c: 0,
        tipo_af: 0,
        tipo_bh: 0,
        tipo_xl: 0,
        tipo_cil: 0,
        tipo_p: 0,
      },
    );

    // 🏭 Crear en Bodega
    await Bodega.create(
      {
        fecha_produccion: fecha,
        orden: orden,
        ...totales,
        estado: 2,
      },
      { transaction },
    );

    // 🔄 Marcar sobrantes como procesados
    await HistorialSobrantes.update(
      {
        estado: 1,
        orden_asignado: orden,
      },
      {
        where: { estado: 0 },
        transaction,
      },
    );

    return {
      sobrantes,
      total_registros: sobrantes.length,
      creado: true,
      totales,
    };
  } catch (error) {
    console.error("❌ Error en obtenerHistorialSobrante:", error);
    throw error;
  }
};

// services/bodegaService.mjs
export const obtenerHistorialEnvios = async (orden) => {
  console.log("🔍 Buscando historial para orden:", orden);

  try {
    // Buscar todos los envíos de esta orden
    const envios = await HistorialEnvios.findAll({
      where: { orden: orden },
      order: [["fecha", "DESC"]], // Ordenar por fecha descendente
      raw: true,
    });

    if (!envios || envios.length === 0) {
      return {
        envios: [],
        sobrantes: [],
        total_registros: 0,
      };
    }

    // Obtener el lote_produccion desde el modelo Produccion
    const produccion = await Produccion.findOne({
      where: { id: orden },
      attributes: ["lote_produccion"],
      raw: true,
    });

    const loteProduccion = produccion ? produccion.lote_produccion : null;

    // Para cada envío, buscar sus sobrantes correspondientes
    const enviosConSobrantes = await Promise.all(
      envios.map(async (envio) => {
        const sobrante = await HistorialSobrantes.findOne({
          where: {
            orden: orden,
            fecha: envio.fecha,
          },
          raw: true,
        });

        return {
          ...envio,
          lote_produccion: loteProduccion, // Agregar el lote de producción
          tiene_sobrantes: !!sobrante,
          sobrante: sobrante || null,
        };
      }),
    );

    // También obtener todos los sobrantes por separado
    const sobrantes = await HistorialSobrantes.findAll({
      where: { orden: orden },
      order: [["fecha", "DESC"]],
      raw: true,
    });

    // Agregar el lote de producción a los sobrantes también
    const sobrantesConLote = sobrantes.map((sobrante) => ({
      ...sobrante,
      lote_produccion: loteProduccion,
    }));

    return {
      envios: enviosConSobrantes,
      sobrantes: sobrantesConLote,
      total_registros: envios.length,
      resumen: {
        total_envios: envios.length,
        total_con_sobrantes: sobrantes.length,
      },
      lote_produccion: loteProduccion, // También incluirlo en el nivel principal
    };
  } catch (error) {
    console.error("Error en obtenerHistorialEnvios:", error);
    throw error;
  }
};

// services/bodegaService.mjs
export const registrarEnvio = async (data) => {
  console.log("🔧 Service recibió:", JSON.stringify(data, null, 2));

  const { fecha, enviados, sobrantes, orden } = data;

  try {
    // 👇 VALIDACIÓN: Verificar si ya existe un registro con esta orden
    console.log("🔍 Verificando si la orden ya está registrada:", orden);

    const envioExistente = await HistorialEnvios.findOne({
      where: { orden: orden },
    });

    if (envioExistente) {
      console.log("❌ La orden ya tiene un registro:", envioExistente.id);
      throw new Error(
        `La orden ${orden} ya tiene un envío registrado el día ${envioExistente.fecha}`,
      );
    }

    // 1. Guardar registro de envío
    console.log("💾 Guardando en HistorialEnvios...");
    const registroEnvio = await HistorialEnvios.create({
      fecha: fecha,
      orden: orden,
      tipo_a: enviados.A || 0,
      tipo_b: enviados.B || 0,
      tipo_c: enviados.C || 0,
      tipo_af: enviados.AF || 0,
      tipo_bh: enviados.BH || 0,
      tipo_xl: enviados.XL || 0,
      tipo_cil: enviados.CIL || 0,
      tipo_p: enviados.PINTON || 0,
      fecha_registro: new Date(),
    });

    console.log("✅ Envío guardado con ID:", registroEnvio.id);

    // 2. Verificar si hay sobrantes
    const haySobrantes = Object.values(sobrantes).some((val) => val > 0);
    console.log("📊 Hay sobrantes?", haySobrantes);

    let registroSobrantes = null;
    if (haySobrantes) {
      console.log("💾 Guardando en HistorialSobrantes...");
      registroSobrantes = await HistorialSobrantes.create({
        fecha: fecha,
        orden: orden,
        tipo_a: sobrantes.A || 0,
        tipo_b: sobrantes.B || 0,
        tipo_c: sobrantes.C || 0,
        tipo_af: sobrantes.AF || 0,
        tipo_bh: sobrantes.BH || 0,
        tipo_xl: sobrantes.XL || 0,
        tipo_cil: sobrantes.CIL || 0,
        tipo_p: sobrantes.PINTON || 0,
        fecha_registro: new Date(),
        estado: 0,
      });
      console.log("✅ Sobrantes guardados con ID:", registroSobrantes.id);
    }

    return {
      success: true,
      message: haySobrantes
        ? "Envío y sobrantes registrados correctamente"
        : "Envío registrado correctamente",
      data: {
        envio: registroEnvio,
        sobrantes: registroSobrantes,
        resumen: {
          enviados,
          sobrantes,
        },
      },
    };
  } catch (error) {
    console.error("❌ Error en service:", error);
    throw error;
  }
};

// Canastillas en bodega
export const getAll = async (orden) => {
  // Configurar el where dinámicamente
  const whereCondition = {};

  // Si se proporciona una orden, agregarla al where
  if (orden) {
    // Asumiendo que 'orden' es un campo en RegistroAreaFritura
    // y quieres filtrar por ese campo
    whereCondition["$fritura.orden$"] = orden; // Forma con $

    // Alternativa: Si prefieres usar include con where
  }

  const listaFritura = await LotesFritura.findAll({
    attributes: [
      "id",
      "id_fritura",
      "fecha_produccion",
      "lote_produccion",
      "tipo",
      "canastas",
    ],
    include: [
      {
        model: RegistroAreaFritura,
        as: "fritura",
        attributes: ["id", "orden"], // Incluye los campos que necesites
        where: orden ? { orden: orden } : {}, // Filtrar por orden si se proporciona
        required: orden ? true : false, // Hacer INNER JOIN solo si hay filtro
      },
    ],
    where: whereCondition,
  });

  if (listaFritura.length == 0) {
    throw new Error(
      orden
        ? `No hay Registros Disponibles para la orden: ${orden}`
        : "No hay Registros Disponibles.",
    );
  }

  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "fecha_empaque",
      "fecha_produccion",
      "lote_produccion",
      "numero_canastas",
    ],
  });

  // calculamos saldo de canastillas
  const saldo = listaFritura.map((fritura) => {
    const empaquesDelLote = listaEmpaque.filter(
      (e) => e.lote_produccion === fritura.lote_produccion,
    );

    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.numero_canastas,
      0,
    );

    // Incluir información de la orden desde la relación
    const ordenInfo = fritura.fritura ? fritura.fritura.orden : null;

    return {
      id_fritura: fritura.id_fritura,
      orden: ordenInfo, // Incluir la orden en la respuesta
      fecha_produccion: fritura.fecha_produccion,
      lote_produccion: fritura.lote_produccion,
      tipo: fritura.tipo,
      total_producido: fritura.canastas,
      total_empaquetado: totalEmpaque,
      saldo: fritura.canastas - totalEmpaque,
    };
  });

  return {
    saldo_canastillas: saldo,
    filtro_aplicado: orden ? { orden: orden } : null, // Información del filtro aplicado
  };
};

export const getAllCajas = async (orden) => {
  const registros = await Bodega.findAll({
    attributes: [
      [fn("SUM", col("tipo_a")), "tipo_a"],
      [fn("SUM", col("tipo_b")), "tipo_b"],
      [fn("SUM", col("tipo_c")), "tipo_c"],
      [fn("SUM", col("tipo_af")), "tipo_af"],
      [fn("SUM", col("tipo_bh")), "tipo_bh"],
      [fn("SUM", col("tipo_xl")), "tipo_xl"],
      [fn("SUM", col("tipo_cil")), "tipo_cil"],
      [fn("SUM", col("tipo_p")), "tipo_p"],
    ],
    where: {
      orden: orden,
    },
  });

  const cajas = registros.map((op) => ({
    A: op.tipo_a,
    B: op.tipo_b,
    C: op.tipo_c,
    AF: op.tipo_af,
    BH: op.tipo_bh,
    XL: op.tipo_xl,
    CIL: op.tipo_cil,
    P: op.tipo_p,
  }));

  return {
    cajas,
  };
};
// Me trae las cajas por lote de Producción
export const getAllCajaslotes = async () => {
  const listaEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "id",
      "fecha_empaque",
      "lote_empaque",
      "fecha_produccion",
      "lote_produccion",
    ],
  });

  const infoCajas = await Promise.all(
    listaEmpaque.map(async (empaque) => {
      const detalle = await DetalleCaja.findAll({
        attributes: ["caja", "cantidad"],
        where: { id_empaque: empaque.id },
      });

      return {
        ...empaque.get({ plain: true }),
        detalle,
      };
    }),
  );

  // --- Agrupar por fecha_produccion ---
  const agrupado = infoCajas.reduce((acc, item) => {
    const fecha = item.fecha_produccion;
    if (!acc[fecha]) {
      acc[fecha] = {};
    }

    // Para cada detalle, acumular por lote_produccion + caja
    item.detalle.forEach((d) => {
      const key = `${item.lote_produccion}_${d.caja}`;
      if (!acc[fecha][key]) {
        acc[fecha][key] = {
          lote_produccion: item.lote_produccion,
          caja: d.caja,
          cantidad: 0,
        };
      }
      acc[fecha][key].cantidad += d.cantidad;
    });

    return acc;
  }, {});

  // --- Formatear a la estructura final ---
  const resultado = Object.entries(agrupado).map(([fecha, lotesObj]) => {
    const lotes = Object.values(lotesObj);
    const totalCajas = lotes.reduce((sum, l) => sum + l.cantidad, 0);
    return {
      producción: fecha,
      lotes,
      totalCajas,
    };
  });

  return { infoCajas: resultado };
};

// Inventairo de cajas de bodega
export const getAllCajasBodega = async (orden) => {
  const lista = await Bodega.findAll({
    where: {
      orden: orden,
    },
  });
  const cajas = lista.map((op) => ({
    fecha_produccion: op.fecha_produccion,
    A: op.tipo_a,
    B: op.tipo_b,
    C: op.tipo_c,
    AF: op.tipo_af,
    BH: op.tipo_bh,
    XL: op.tipo_xl,
    CIL: op.tipo_cil,
    CP: op.tipo_p,
  }));
  return { infoCajas: cajas };
};

export const getAllLotes = async (lote, idProduccion, tipo) => {
  // Obtenemos la Informacion del Proveedor de la fritrura
  const registroPro = await DetalleProveedor.findAll({
    attributes: ["id"],
    where: {
      [Op.and]: [{ id_fritura: idProduccion }],
    },
  });

  // Obtenemos la Informacion del Proveedor de Empaque
  const detalleEmpaque = await DetalleEmpaque.findAll({
    attributes: [
      "fecha_empaque",
      "fecha_produccion",
      "numero_canastas",
      "tipo",
      "lote_produccion",
      "total_cajas",
    ],
    where: { [Op.and]: [{ lote_produccion: lote }, { tipo: tipo }] },
    include: [
      {
        model: RegistroAreaEmpaque,
        as: "empaque",
        attributes: ["lote_empaque"],
      },
    ],
  });

  const proveedoresEmpaque = await ProveedoresEmpaque.findAll({
    attributes: [
      "fecha_produccion",
      "lote_proveedor",
      "tipo",
      "lote_produccion",
      "canastas",
    ],
    where: { [Op.and]: [{ lote_produccion: lote }, { tipo: tipo }] },
  });

  const infoCajas = await Promise.all(
    registroPro.map(async (proceso) => {
      const detalle = await VariablesProveedor.findAll({
        attributes: [
          "lote_proveedor",
          "lote_produccion",
          "tipo",
          "canastas",
          "id_proveedor",
        ],
        where: { id_proceso: proceso.id, tipo: tipo },
        raw: true,
      });

      return {
        ...proceso,
        detalle,
      };
    }),
  );

  // Calculamos saldo de canastillas
  const saldo = infoCajas.map((fritura) => {
    const empaquesDelLote = proveedoresEmpaque.filter(
      (e) =>
        e.lote_produccion === fritura.detalle[0].lote_produccion &&
        e.lote_proveedor === fritura.detalle[0].lote_proveedor,
    );

    const totalEmpaque = empaquesDelLote.reduce(
      (acc, e) => acc + e.canastas,
      0,
    );
    return {
      lote_produccion: fritura.detalle[0].lote_produccion,
      lote_proveedor: fritura.detalle[0].lote_proveedor ?? "",
      tipo: tipo,
      saldo: fritura.detalle[0].canastas - totalEmpaque,
      canastas: fritura.detalle[0].canastas,
      empaques: totalEmpaque,
    };
  });

  const detalle = detalleEmpaque.map((op) => ({
    empaque: op.fecha_empaque,
    produccion: op.fecha_produccion,
    lote_empaque: op.empaque?.lote_empaque ?? "",
    lote_produccion: op.lote_produccion,
    canastas: op.numero_canastas,
    tipo: op.tipo,
  }));

  return {
    lotes: detalle,
    saldo,
  };
};

export const getDetallesCajas = async (lote) => {
  const lotes = await ProveedoresEmpaque.findAll({
    where: { [Op.and]: { fecha_produccion: lote } },
    include: [{ model: Proveedor, as: "proveedor", attributes: ["nombre"] }],
  });

  if (lotes.length == 0) throw new Error("No hay Registros Disponibles.");

  const detalle = lotes.map((op) => ({
    produccion: op.fecha_produccion,
    proveedor: op.proveedor?.nombre ?? "",
    lote_produccion: op.lote_produccion,
    lote_recepcion: op.lote_proveedor,
    cajas: op.cajas,
    tipo: op.tipo,
  }));

  return {
    detalle: detalle,
  };
};

export const getDetalles = async (orden, req, res) => {
  try {
    const lotes = await ProveedoresEmpaque.findAll({
      include: [
        {
          model: Proveedor,
          as: "proveedor",
          attributes: ["nombre", "id"],
        },
        {
          model: RegistroAreaEmpaque,
          as: "empaque",
          attributes: ["id", "orden", "fecha_empaque"],
          // Aquí puedes agregar el where si lo necesitas
          where: { orden: orden },
        },
      ],
    });

    const cajasContenedorAnterior = await Bodega.findAll({
      where: {
        estado: 2,
        orden: orden,
      },
    });

    if (lotes.length == 0) {
      return {
        success: true,
        message: "No hay Registros Disponibles.",
        data: [],
        totales: {
          A: 0,
          B: 0,
          C: 0,
          AF: 0,
          BH: 0,
          XL: 0,
          CIL: 0,
          PINTON: 0,
        },
      };
    }

    // Objeto para agrupar por proveedor
    const sumasPorProveedor = {};
    // Objeto para totales generales
    const totalesGenerales = {
      A: 0,
      B: 0,
      C: 0,
      AF: 0,
      BH: 0,
      XL: 0,
      CIL: 0,
      PINTON: 0,
    };

    lotes.forEach((lote) => {
      const proveedor = lote.proveedor?.nombre ?? "Sin proveedor";
      const tipo = lote.tipo;
      const cajas = lote.cajas || 0;

      // Inicializar proveedor si no existe
      if (!sumasPorProveedor[proveedor]) {
        sumasPorProveedor[proveedor] = {
          id_proveedor: lote.proveedor.id,
          proveedor: proveedor,
          A: 0,
          B: 0,
          C: 0,
          AF: 0,
          BH: 0,
          XL: 0,
          CIL: 0,
          PINTON: 0,
        };
      }

      // Sumar por tipo (mapeo de tipos a columnas)
      switch (tipo) {
        case "A":
          sumasPorProveedor[proveedor].A += cajas;
          totalesGenerales.A += cajas;
          break;
        case "B":
          sumasPorProveedor[proveedor].B += cajas;
          totalesGenerales.B += cajas;
          break;
        case "C":
          sumasPorProveedor[proveedor].C += cajas;
          totalesGenerales.C += cajas;
          break;
        case "AF":
          sumasPorProveedor[proveedor].AF += cajas;
          totalesGenerales.AF += cajas;
          break;
        case "BH":
          sumasPorProveedor[proveedor].BH += cajas;
          totalesGenerales.BH += cajas;
          break;
        case "XL":
          sumasPorProveedor[proveedor].XL += cajas;
          totalesGenerales.XL += cajas;
          break;
        case "CIL":
        case "CILINDRO":
          sumasPorProveedor[proveedor].CIL += cajas;
          totalesGenerales.CIL += cajas;
          break;
        case "PINTON":
          sumasPorProveedor[proveedor].PINTON += cajas;
          totalesGenerales.PINTON += cajas;
          break;
        default:
          // Si hay algún tipo no mapeado, podrías manejarlo aquí
          console.log(`Tipo no reconocido: ${tipo}`);
      }
    });

    const data = [
      ...Object.values(sumasPorProveedor),
      { cajasContenedorAnterior },
    ];

    cajasContenedorAnterior.forEach((c) => {
      totalesGenerales.A += c.tipo_a || 0;
      totalesGenerales.B += c.tipo_b || 0;
      totalesGenerales.C += c.tipo_c || 0;
      totalesGenerales.AF += c.tipo_af || 0;
      totalesGenerales.BH += c.tipo_bh || 0;
      totalesGenerales.XL += c.tipo_xl || 0;
      totalesGenerales.CIL += c.tipo_cil || 0;
      totalesGenerales.PINTON += c.tipo_p || 0;
    });

    return {
      success: true,
      message: "Detalle de cajas por proveedor",
      data: data,
      totales: totalesGenerales,
    };
  } catch (error) {
    console.error("Error en getDetalles:", error);
    return {
      success: false,
      message: "Error al obtener los detalles",
      error: error.message,
    };
  }
};

export const update = async (data) => {
  console.log("🔧 UPDATE llamado con datos:", JSON.stringify(data, null, 2));

  const { fecha_verificacion, id_responsable, observaciones, cajas } = data;

  // MAPEO CORRECTO según tu modelo
  const tipoMap = {
    A: "tipo_a",
    B: "tipo_b",
    C: "tipo_c",
    AF: "tipo_af",
    BH: "tipo_bh",
    XL: "tipo_xl",
    CIL: "tipo_cil",
    P: "tipo_p",
  };

  console.log("📊 Mapeo de tipos:", tipoMap);
  console.log(
    "🎯 Tipos recibidos en cajas:",
    cajas.map((c) => ({ tipo: c.tipo, cantidad: c.cantidad_caja })),
  );

  // Agrupar por fecha_produccion
  const updatesByDate = {};

  cajas.forEach((caja) => {
    const fecha = caja.fecha_produccion;
    const tipo = caja.tipo?.toUpperCase();
    const columna = tipoMap[tipo];

    if (!columna) {
      console.error(
        `❌ Tipo no válido: ${tipo}. Tipos permitidos:`,
        Object.keys(tipoMap),
      );
      throw new Error(`Tipo de caja no válido: ${tipo}`);
    }

    if (!updatesByDate[fecha]) {
      updatesByDate[fecha] = {};
    }

    // Sumar cantidades del mismo tipo para la misma fecha
    updatesByDate[fecha][columna] =
      (updatesByDate[fecha][columna] || 0) + caja.cantidad_caja;

    console.log(
      `📝 Agregado: ${fecha} - ${columna} = ${updatesByDate[fecha][columna]}`,
    );
  });

  console.log("📅 Agrupado por fecha:", updatesByDate);

  // Verificar que existan registros para las fechas
  for (const fecha in updatesByDate) {
    console.log(`🔍 Verificando existencia de registro para: ${fecha}`);

    const existe = await Bodega.count({
      where: { fecha_produccion: fecha },
    });

    console.log(`📊 Registros encontrados para ${fecha}: ${existe}`);

    if (existe === 0) {
      // Opción A: Lanzar error
      throw new Error(
        `No existe registro en bodega para la fecha: ${fecha}. Primero debe crearse el registro.`,
      );

      // Opción B: Crear automáticamente
      // console.log(`➕ Creando registro para ${fecha}...`);
      // await Bodega.create({
      //   fecha_produccion: fecha,
      //   tipo_a: 0,
      //   tipo_b: 0,
      //   tipo_c: 0,
      //   tipo_af: 0,
      //   tipo_bh: 0,
      //   tipo_xl: 0,
      //   tipo_cil: 0,
      //   tipo_p: 0,
      //   estado: 1
      // });
    }
  }

  // Actualizar cada fecha
  const resultados = [];
  for (const fecha in updatesByDate) {
    try {
      console.log(`🔄 Actualizando ${fecha} con:`, updatesByDate[fecha]);

      const registro = await Bodega.findOne({
        where: { fecha_produccion: fecha },
      });

      if (!registro) {
        throw new Error(`Registro no encontrado para ${fecha}`);
      }

      // Actualizar solo los campos enviados
      await registro.update(updatesByDate[fecha]);

      resultados.push({
        fecha,
        actualizado: true,
        valores: updatesByDate[fecha],
      });

      console.log(`✅ ${fecha} actualizado correctamente`);
    } catch (error) {
      console.error(`❌ Error actualizando ${fecha}:`, error);
      throw error;
    }
  }

  return {
    success: true,
    message: "Bodega actualizada exitosamente",
    datos: {
      cajas_procesadas: cajas.length,
      fechas_actualizadas: resultados.length,
      resultados,
    },
  };
};
