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
        order: [["fecha_produccion", "ASC"]],
      });
    }

    return {
      produccion: produccion,
      registroAreaEmpaque: registroAreaEmpaque,
      detalleEmpaque: detalleEmpaque,
    };
  } catch (error) {
    console.error("❌ Error en service:", error);
    throw error;
  }
};

export const obtenerHistorialSobrante = async (orden, fecha, transaction) => {
  try {
    // Verificar si la nueva orden ya tiene sobrantes asignados
    const ordenYaTieneSobrantes = await Bodega.findOne({
      where: {
        orden: orden,
        estado: 2,
      },
      transaction,
    });

    if (ordenYaTieneSobrantes) {
      return {
        sobrantes: [],
        total_registros: 0,
        creado: false,
        mensaje: "Esta orden ya tiene sobrantes de contenedor anterior",
      };
    }

    // Tomar todos los sobrantes disponibles (estado 0)
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
        mensaje: "No hay sobrantes disponibles",
      };
    }

    // 🏭 Crear registros INDIVIDUALES en Bodega (uno por cada lote)
    for (const sobrante of sobrantes) {
      await Bodega.create(
        {
          fecha_produccion: sobrante.fecha_produccion, // ← La fecha original del lote
          orden: orden, // Nueva orden
          tipo_a: sobrante.tipo_a || 0,
          tipo_b: sobrante.tipo_b || 0,
          tipo_c: sobrante.tipo_c || 0,
          tipo_af: sobrante.tipo_af || 0,
          tipo_bh: sobrante.tipo_bh || 0,
          tipo_xl: sobrante.tipo_xl || 0,
          tipo_cil: sobrante.tipo_cil || 0,
          tipo_p: sobrante.tipo_p || 0,
          estado: 2, // 2 = Cajas de contenedor anterior
        },
        { transaction },
      );
    }

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
  console.log("🔧 ========== INICIO REGISTRO ENVÍO ==========");
  console.log("🔧 Service recibió:", JSON.stringify(data, null, 2));
  console.log("🔧 Timestamp:", new Date().toISOString());

  const { fecha, enviados, sobrantes_por_lote, orden } = data;

  try {
    // 👇 VALIDACIÓN: Verificar si ya existe un registro con esta orden
    console.log("🔍 Verificando si la orden ya está registrada:", orden);
    console.log("🔍 Tipo de orden:", typeof orden);
    console.log("🔍 Valor de orden:", orden);

    const envioExistente = await HistorialEnvios.findOne({
      where: { orden: orden },
    });

    if (envioExistente) {
      console.log("❌ La orden ya tiene un registro:", {
        id: envioExistente.id,
        fecha: envioExistente.fecha,
        fecha_registro: envioExistente.fecha_registro
      });
      throw new Error(
        `La orden ${orden} ya tiene un envío registrado el día ${envioExistente.fecha_registro}`,
      );
    } else {
      console.log("✅ Orden disponible para registrar");
    }

    // 1. Guardar registro de envío
    console.log("💾 ===== Guardando en HistorialEnvios =====");
    console.log("💾 Datos a guardar en HistorialEnvios:", {
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
      fecha_registro: new Date()
    });

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

    console.log("✅ Envío guardado con éxito:");
    console.log("   - ID:", registroEnvio.id);
    console.log("   - Fecha lote:", registroEnvio.fecha);
    console.log("   - Orden:", registroEnvio.orden);
    console.log("   - Fecha registro:", registroEnvio.fecha_registro);

    // 2. Guardar sobrantes por lote (si hay)
    console.log("📦 ===== Procesando sobrantes =====");
    console.log("📦 sobrantes_por_lote recibido:", sobrantes_por_lote);
    console.log("📦 ¿Es array?", Array.isArray(sobrantes_por_lote));
    console.log("📦 Longitud:", sobrantes_por_lote?.length || 0);

    const sobrantesGuardados = [];

    if (sobrantes_por_lote && sobrantes_por_lote.length > 0) {
      console.log(
        `💾 Guardando ${sobrantes_por_lote.length} lotes con sobrantes...`,
      );

      // Guardar cada lote individualmente (sin transacción)
      for (let i = 0; i < sobrantes_por_lote.length; i++) {
        const lote = sobrantes_por_lote[i];
        console.log(`\n📋 Procesando lote #${i + 1}:`, lote);
        console.log(`   - fecha_produccion:`, lote.fecha_produccion);
        console.log(`   - Tipo A:`, lote.A);
        console.log(`   - Tipo B:`, lote.B);
        console.log(`   - Tipo C:`, lote.C);
        console.log(`   - Tipo AF:`, lote.AF);
        console.log(`   - Tipo BH:`, lote.BH);
        console.log(`   - Tipo XL:`, lote.XL);
        console.log(`   - Tipo CIL:`, lote.CIL);
        console.log(`   - Tipo PINTON:`, lote.PINTON);

        // Verificar si hay al menos un valor > 0 en este lote
        const valores = Object.values(lote).filter(val => typeof val === "number");
        const tieneSobrantes = valores.some(val => val > 0);
        
        console.log(`   🔍 ¿Tiene sobrantes?`, tieneSobrantes);
        console.log(`   🔍 Valores numéricos:`, valores);

        if (tieneSobrantes) {
          console.log(`   💾 Creando registro en HistorialSobrantes...`);
          
          const datosSobrante = {
            fecha: lote.fecha_produccion,
            orden: orden,
            tipo_a: lote.A || 0,
            tipo_b: lote.B || 0,
            tipo_c: lote.C || 0,
            tipo_af: lote.AF || 0,
            tipo_bh: lote.BH || 0,
            tipo_xl: lote.XL || 0,
            tipo_cil: lote.CIL || 0,
            tipo_p: lote.PINTON || 0,
            fecha_registro: new Date(),
            estado: 0,
          };
          
          console.log(`   📝 Datos a guardar:`, datosSobrante);

          const registroSobrante = await HistorialSobrantes.create(datosSobrante);

          console.log(`   ✅ Sobrantes guardados para lote ${lote.fecha_produccion}:`);
          console.log(`      - ID:`, registroSobrante.id);
          console.log(`      - Fecha lote:`, registroSobrante.fecha);
          console.log(`      - Fecha registro:`, registroSobrante.fecha_registro);

          sobrantesGuardados.push(registroSobrante);
        } else {
          console.log(`   ⏭️ Lote sin sobrantes, no se guarda`);
        }
      }

      console.log(`✅ Total de lotes con sobrantes guardados: ${sobrantesGuardados.length}`);
      
    } else {
      console.log("📊 No hay sobrantes por lote para guardar");
    }

    // Calcular totales para el mensaje
    console.log("\n📊 ===== Calculando totales =====");
    const totalSobrantes = sobrantesGuardados.reduce(
      (acc, item) => {
        return {
          A: acc.A + (item.tipo_a || 0),
          B: acc.B + (item.tipo_b || 0),
          C: acc.C + (item.tipo_c || 0),
          AF: acc.AF + (item.tipo_af || 0),
          BH: acc.BH + (item.tipo_bh || 0),
          XL: acc.XL + (item.tipo_xl || 0),
          CIL: acc.CIL + (item.tipo_cil || 0),
          PINTON: acc.PINTON + (item.tipo_p || 0),
        };
      },
      { A: 0, B: 0, C: 0, AF: 0, BH: 0, XL: 0, CIL: 0, PINTON: 0 },
    );

    console.log("📊 Totales calculados:", totalSobrantes);

    const resultado = {
      success: true,
      message:
        sobrantesGuardados.length > 0
          ? `Envío registrado con ${sobrantesGuardados.length} lote(s) con sobrantes`
          : "Envío registrado correctamente (sin sobrantes)",
      data: {
        envio: {
          id: registroEnvio.id,
          fecha: registroEnvio.fecha,
          orden: registroEnvio.orden,
          fecha_registro: registroEnvio.fecha_registro
        },
        sobrantes: sobrantesGuardados.map(s => ({
          id: s.id,
          fecha: s.fecha,
          fecha_registro: s.fecha_registro
        })),
        resumen: {
          enviados,
          total_sobrantes: totalSobrantes,
          lotes_con_sobrantes: sobrantesGuardados.length,
        },
      },
    };

    console.log("✅ ========== FIN REGISTRO ENVÍO EXITOSO ==========");
    console.log("✅ Resultado:", JSON.stringify(resultado, null, 2));
    
    return resultado;

  } catch (error) {
    console.error("\n❌ ========== ERROR EN SERVICE ==========");
    console.error("❌ Tipo de error:", error.name);
    console.error("❌ Mensaje:", error.message);
    console.error("❌ Stack:", error.stack);
    if (error.original) {
      console.error("❌ Error original de BD:", error.original);
    }
    if (error.errors) {
      console.error("❌ Errores de validación:", error.errors);
    }
    console.error("❌ ======================================");
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
  // Filtrar solo los elementos que tienen detalle
  const infoCajasConDetalle = infoCajas.filter(
    (fritura) => fritura.detalle && fritura.detalle.length > 0,
  );

  const saldo = infoCajasConDetalle.map((fritura) => {
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

    // Objeto para agrupar por fecha de producción
    const sumasPorFecha = {};
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
      const fechaProduccion = lote.fecha_produccion || "Sin fecha";
      const proveedor = lote.proveedor?.nombre ?? "Sin proveedor";
      const tipo = lote.tipo;
      const cajas = lote.cajas || 0;

      // Inicializar fecha si no existe
      if (!sumasPorFecha[fechaProduccion]) {
        sumasPorFecha[fechaProduccion] = {
          fecha_produccion: fechaProduccion,
          proveedores: {}, // Para mantener el detalle por proveedor si es necesario
          A: 0,
          B: 0,
          C: 0,
          AF: 0,
          BH: 0,
          XL: 0,
          CIL: 0,
          PINTON: 0,
          total_cajas: 0,
        };
      }

      // Inicializar proveedor dentro de la fecha si quieres mantener el detalle
      if (!sumasPorFecha[fechaProduccion].proveedores[proveedor]) {
        sumasPorFecha[fechaProduccion].proveedores[proveedor] = {
          nombre: proveedor,
          id_proveedor: lote.proveedor?.id,
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

      // Sumar por tipo para la fecha
      switch (tipo) {
        case "A":
          sumasPorFecha[fechaProduccion].A += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].A += cajas;
          totalesGenerales.A += cajas;
          break;
        case "B":
          sumasPorFecha[fechaProduccion].B += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].B += cajas;
          totalesGenerales.B += cajas;
          break;
        case "C":
          sumasPorFecha[fechaProduccion].C += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].C += cajas;
          totalesGenerales.C += cajas;
          break;
        case "AF":
          sumasPorFecha[fechaProduccion].AF += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].AF += cajas;
          totalesGenerales.AF += cajas;
          break;
        case "BH":
          sumasPorFecha[fechaProduccion].BH += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].BH += cajas;
          totalesGenerales.BH += cajas;
          break;
        case "XL":
          sumasPorFecha[fechaProduccion].XL += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].XL += cajas;
          totalesGenerales.XL += cajas;
          break;
        case "CIL":
        case "CILINDRO":
          sumasPorFecha[fechaProduccion].CIL += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].CIL += cajas;
          totalesGenerales.CIL += cajas;
          break;
        case "PINTON":
          sumasPorFecha[fechaProduccion].PINTON += cajas;
          sumasPorFecha[fechaProduccion].proveedores[proveedor].PINTON += cajas;
          totalesGenerales.PINTON += cajas;
          break;
        default:
          console.log(`Tipo no reconocido: ${tipo}`);
      }

      // Calcular total de cajas por fecha
      sumasPorFecha[fechaProduccion].total_cajas += cajas;
    });

    // Convertir el objeto de proveedores a array para cada fecha
    const data = Object.values(sumasPorFecha).map((fecha) => ({
      fecha_produccion: fecha.fecha_produccion,
      total_cajas: fecha.total_cajas,
      A: fecha.A,
      B: fecha.B,
      C: fecha.C,
      AF: fecha.AF,
      BH: fecha.BH,
      XL: fecha.XL,
      CIL: fecha.CIL,
      PINTON: fecha.PINTON,
      proveedores: Object.values(fecha.proveedores),
    }));

    // Ordenar por fecha (más reciente primero)
    data.sort(
      (a, b) => new Date(b.fecha_produccion) - new Date(a.fecha_produccion),
    );

    // Agregar cajas del contenedor anterior
    data.push({ cajasContenedorAnterior });

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
      message: "Detalle de cajas por fecha de producción",
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
