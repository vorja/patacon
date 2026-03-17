import moment from "moment";
import { col, Op, fn } from "sequelize";
import Responsable from "../models/responsable.mjs";
import RegistroAreaEmpaque from "../models/registroAreaEmpaque.mjs";
import DetalleCaja from "../models/detalleCajas.mjs";
import Bodega from "../models/bodega.mjs";
import proveedoresEmpaque from "../models/proveedoresEmpaque.mjs";
import sequelize from "../config/database.mjs";
import LotesFritura from "../models/lotesProduccion.mjs";
import DetalleEmpaque from "../models/detalleEmpaque.mjs";

export const create = async (data) => {
  console.log("🚀 INICIO - create empaque");
  
  // LOG DETALLADO DE LO QUE LLEGA
  console.log("📦 DATA COMPLETA RECIBIDA:");
  console.log("cajas:", JSON.stringify(data.cajas, null, 2));
  console.log("infoEmpaque:", JSON.stringify(data.infoEmpaque, null, 2));
  console.log("proveedores:", JSON.stringify(data.proveedores, null, 2));
  console.log("registroEmpaque:", JSON.stringify(data.registroEmpaque, null, 2));

  console.log(
    "📊 Resumen:",
    JSON.stringify(
      {
        tieneCajas: !!data.cajas,
        cantidadCajas: data.cajas?.length,
        tieneInfoEmpaque: !!data.infoEmpaque,
        cantidadInfoEmpaque: data.infoEmpaque?.length,
        tieneProveedores: !!data.proveedores,
        cantidadProveedores: data.proveedores?.length, // <-- AGREGAR ESTO
        proveedoresConDiferente: data.proveedores?.filter(p => p.diferente && p.diferente.trim() !== '').length,
        proveedoresSinDiferente: data.proveedores?.filter(p => !p.diferente || p.diferente.trim() === '').length,
        orden: data.orden,
      },
      null,
      2,
    ),
  );

  const transaction = await sequelize.transaction();
  console.log("🔰 Transacción iniciada");

  try {
    const { cajas, infoEmpaque, proveedores, ...registroEmpaque } = data;

    // Validar que el array cajas exista y tenga elementos
    if (!Array.isArray(cajas)) {
      console.error("❌ Validación fallida: array cajas vacío o inválido");
      await transaction.rollback();
      throw new Error("El array 'cajas' es requerido y no puede estar vacío.");
    }
    console.log(`✅ Validación exitosa: ${cajas.length} cajas a procesar`);

    // 1. Crear registro principal
    console.log("📝 Creando registro principal de empaque...");
    const registroAreaEmpaque = await RegistroAreaEmpaque.create(
      registroEmpaque,
      { transaction },
    );

    if (!registroAreaEmpaque?.id) {
      console.error("❌ Falló creación de registro principal");
      await transaction.rollback();
      throw new Error("No se pudo crear el registro principal.");
    }
    console.log(
      `✅ Registro principal creado con ID: ${registroAreaEmpaque.id}`,
    );

    // 2. Crear detalles de lotes
    console.log("📦 Creando detalles de lotes...");
    const resLotes = await createDetalleLotes(
      infoEmpaque,
      registroAreaEmpaque,
      registroEmpaque,
      transaction,
    );

    if (!resLotes) {
      console.error("❌ Falló creación de lotes");
      await transaction.rollback();
      throw new Error("No se pudo guardar los lotes de producción.");
    }
    console.log(`✅ Lotes creados exitosamente`);

    // 3. Crear detalles de proveedores
    console.log("🏭 Creando detalles de proveedores...");
    const resProveedores = await createDetalleProveedor(
      proveedores,
      registroAreaEmpaque.id,
      transaction,
    );

    if (!resProveedores) {
      console.error("❌ Falló creación de proveedores");
      await transaction.rollback();
      throw new Error("No se pudo guardar el detalle de los Proveedores.");
    }
    console.log(`✅ Proveedores creados exitosamente`);

    // Después de tener cajas y proveedores, crea un objeto de conteos por fecha
    console.log("🏢 Actualizando bodega...");

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

    // Inicializar objeto para conteos por fecha
    const conteosPorFecha = {};

    // 1. Procesar cajas normales (agrupar por fecha)
    console.log("📦 Procesando cajas normales por fecha...");
    cajas.forEach((caja) => {
      const fecha = caja.fecha_produccion;
      const tipoOriginal = caja.caja?.toUpperCase();
      const columna = tipoMap[tipoOriginal];
      const cantidad = caja.cantidad || 0;

      if (!fecha) {
        console.log(`  ⚠️ Caja sin fecha: ${tipoOriginal} x${cantidad}`);
        return;
      }

      if (!conteosPorFecha[fecha]) {
        conteosPorFecha[fecha] = {
          tipo_a: 0,
          tipo_b: 0,
          tipo_c: 0,
          tipo_af: 0,
          tipo_bh: 0,
          tipo_xl: 0,
          tipo_cil: 0,
          tipo_p: 0,
        };
      }

      if (columna && cantidad > 0) {
        conteosPorFecha[fecha][columna] =
          (conteosPorFecha[fecha][columna] || 0) + cantidad;
      }
    });

    console.log("📊 Conteo por fechas (cajas normales):", conteosPorFecha);

    // 2. Procesar referencias diferentes de proveedores (necesitan su propia fecha)
    console.log("🔄 Procesando referencias diferentes de proveedores...");

    proveedores.forEach((proveedor, index) => {
      // Verificar si tiene el campo diferente y no está vacío
      if (proveedor.diferente && proveedor.diferente.trim() !== "") {
        const [referencia, cantidad] = proveedor.diferente.split(",");
        const cantidadNumerica = parseInt(cantidad) || 0;

        const fechaProveedor = proveedor.fecha_produccion; 

        if (!fechaProveedor) {
          console.log(
            `  ⚠️ Proveedor #${index} con diferente pero sin fecha, no se puede asignar a bodega`,
          );
          return;
        }

        if (referencia && cantidadNumerica > 0) {
          const tipoRef = referencia.trim().toUpperCase();
          const columna = tipoMap[tipoRef];

          // Asegurar que existe el objeto para esta fecha
          if (!conteosPorFecha[fechaProveedor]) {
            conteosPorFecha[fechaProveedor] = {
              tipo_a: 0,
              tipo_b: 0,
              tipo_c: 0,
              tipo_af: 0,
              tipo_bh: 0,
              tipo_xl: 0,
              tipo_cil: 0,
              tipo_p: 0,
            };
          }

          if (columna) {
            conteosPorFecha[fechaProveedor][columna] =
              (conteosPorFecha[fechaProveedor][columna] || 0) +
              cantidadNumerica;
            console.log(
              `  ✅ Proveedor #${index}: Agregando ${cantidadNumerica} cajas de referencia ${tipoRef} a fecha ${fechaProveedor}`,
            );
          } else {
            console.log(
              `  ⚠️ Proveedor #${index}: Tipo de referencia ${tipoRef} no está mapeado`,
            );
          }
        }
      } else {
        console.log(`  ℹ️ Proveedor #${index}: Sin referencia diferente`);
      }
    });

    console.log("📊 Conteo final por fechas:", conteosPorFecha);

    // 3. Procesar cada fecha con sus propios conteos
    const fechas = Object.keys(conteosPorFecha);
    console.log(`📅 Procesando ${fechas.length} fechas para bodega`);

    for (const fecha of fechas) {
      console.log(`  🔍 Buscando/creando registro para fecha: ${fecha}`);

      const [bodegaRegistro, created] = await Bodega.findOrCreate({
        where: {
          fecha_produccion: fecha,
          orden: registroEmpaque.orden,
          estado: 1,
        },
        defaults: {
          fecha_produccion: fecha,
          orden: registroEmpaque.orden,
          tipo_a: 0,
          tipo_b: 0,
          tipo_c: 0,
          tipo_af: 0,
          tipo_bh: 0,
          tipo_xl: 0,
          tipo_cil: 0,
          tipo_p: 0,
          estado: 1,
        },
        transaction,
      });

      const conteosParaEstaFecha = conteosPorFecha[fecha];

      if (!created) {
        console.log(
          `  📝 Actualizando registro existente para fecha: ${fecha}`,
        );
        const updates = {};
        Object.keys(conteosParaEstaFecha).forEach((columna) => {
          if (conteosParaEstaFecha[columna] > 0) {
            updates[columna] = sequelize.literal(
              `${columna} + ${conteosParaEstaFecha[columna]}`,
            );
          }
        });

        if (Object.keys(updates).length > 0) {
          await bodegaRegistro.update(updates, { transaction });
        }
      } else {
        console.log(`  ✨ Creando nuevo registro para fecha: ${fecha}`);
        await bodegaRegistro.update(conteosParaEstaFecha, { transaction });
      }
    }
    console.log("✅ Bodega actualizada exitosamente");

    // 6. Verificar y actualizar estado de lotes de fritura
    console.log("🔄 Verificando lotes de fritura...");
    for (const item of infoEmpaque) {
      console.log(`  🔍 Verificando lote: ${item.lote_produccion}`);

      const registros = await DetalleEmpaque.findAll({
        attributes: [
          "lote_produccion",
          [fn("SUM", col("numero_canastas")), "total"],
        ],
        group: ["lote_produccion"],
        where: {
          lote_produccion: item.lote_produccion,
        },
        transaction,
        raw: true,
      });

      const detalle = await LotesFritura.findOne({
        attributes: ["canastas"],
        where: { lote_produccion: item.lote_produccion },
        transaction,
      });

      if (registros.length > 0) {
        const totalCanastas = Number(registros[0].total);
        const canastasLote = Number(detalle.canastas);
        console.log(
          `    📊 Canastas procesadas: ${totalCanastas}, Lote requiere: ${canastasLote}`,
        );

        if (totalCanastas === canastasLote) {
          console.log(`    ✅ Lote completado, actualizando estado a 0`);
          await LotesFritura.update(
            { estado: 0 },
            {
              where: { lote_produccion: item.lote_produccion },
              transaction,
            },
          );
        } else {
          console.log(
            `    ⏳ Lote pendiente, faltan ${canastasLote - totalCanastas} canastas`,
          );
        }
      }
    }

    // 7. Confirmar transacción
    console.log("💾 Confirmando transacción...");
    await transaction.commit();
    console.log(
      `✅✅✅ PROCESO COMPLETADO - Registro ID: ${registroAreaEmpaque.id}`,
    );

    return registroAreaEmpaque;
  } catch (error) {
    // Rollback automático si ocurre algún error
    console.error("❌❌❌ ERROR en create empaque:");
    console.error("  Mensaje:", error.message);
    console.error("  Stack:", error.stack);

    if (transaction && !transaction.finished) {
      console.log("↩️ Haciendo rollback de transacción");
      await transaction.rollback();
    }

    throw new Error(`Error al crear registro de empaque: ${error.message}`);
  }
};

// Funciones privadas con soporte para transacciones
const createDetalleCaja = async (cajas, id, transaction) => {
  const detallesInsertados = [];

  for (const detalle of cajas) {
    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    const detalleInsertado = await DetalleCaja.create(detalleConId, {
      transaction,
    });
    detallesInsertados.push(detalleInsertado);
  }

  if (!detallesInsertados || detallesInsertados.length == 0) {
    return false;
  }

  return true;
};

const createDetalleProveedor = async (proveedores, id, transaction) => {
  console.log("=== INICIO createDetalleProveedor ===");
  console.log("ID Empaque:", id);
  console.log("Proveedores recibidos:", JSON.stringify(proveedores, null, 2));

  for (let i = 0; i < proveedores.length; i++) {
    const detalle = proveedores[i];

    console.log(`\n--- Proveedor ${i} ---`);
    console.log("Objeto completo:", detalle);
    console.log(
      "Campo 'diferente' existe?:",
      Object.prototype.hasOwnProperty.call(detalle, "diferente"),
    );
    console.log("Valor de 'diferente':", detalle.diferente);
    console.log("Tipo de 'diferente':", typeof detalle.diferente);

    const detalleConId = {
      ...detalle,
      id_empaque: id,
    };

    console.log("Objeto a insertar:", {
      ...detalleConId,
      // Resaltamos el campo diferente
      diferente: detalleConId.diferente,
    });

    try {
      const resultado = await proveedoresEmpaque.create(detalleConId, {
        transaction,
      });
      console.log("✅ Insertado ID:", resultado.id);
      console.log("✅ Diferente guardado:", resultado.diferente);
    } catch (error) {
      console.error("❌ Error:", error.message);
      throw error;
    }
  }

  console.log("=== FIN createDetalleProveedor ===\n");
  return true;
};

const createDetalleLotes = async (infoEmpaque, registro, data, transaction) => {
  const lotesInsert = [];

  try {
    for (const detalle of infoEmpaque) {
      const detalleCompleto = {
        ...detalle,
        fecha_empaque: data.fecha_empaque,
        id_empaque: registro.id,
      };

      const detalleInsertado = await DetalleEmpaque.create(detalleCompleto, {
        transaction,
      });
      lotesInsert.push(detalleInsertado);
    }

    if (!lotesInsert || lotesInsert.length === 0) {
      console.log("No se insertaron registros");
      return false;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Las demás funciones (getAllMonth, getCajasEmpaque, etc.) permanecen igual
// ya que son solo consultas y no requieren transacciones

export const getAllMonth = async (fecha) => {
  if (!/^\d{4}-\d{2}$/.test(fecha)) {
    throw new Error('Formato de fecha inválido. Usa "YYYY-MM".');
  }
  const fechaInicio = moment(`${fecha}-01`)
    .startOf("month")
    .format("YYYY-MM-DD");
  const fechaFin = moment(fechaInicio).add(1, "month").format("YYYY-MM-DD");

  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        fecha_empaque: {
          [Op.gte]: fechaInicio,
          [Op.lt]: fechaFin,
        },
      },
    });

    const promedios = await RegistroAreaEmpaque.findAll({
      attributes: [
        [fn("AVG", col("rechazo_empaque")), "rechazo"],
        [fn("AVG", col("migas_empaque")), "migas"],
        [fn("COUNT", col("id")), "registros"],
      ],
      where: {
        fecha_empaque: {
          [Op.gte]: fechaInicio,
          [Op.lt]: fechaFin,
        },
      },
      raw: true,
    });

    const empaques = registrosEmpaque.map((op) => ({
      id: op.id,
      Empaque: op.fecha_empaque,
      LoteEmpaque: op.lote_empaque ?? "No tiene un Lote Asignado.",
      Canastas: op.numero_canastas,
      Cajas: op.total_cajas,
      Migas: op.migas_empaque,
      Rechazo: op.rechazo_empaque,
      Observaciones: op.observaciones,
      Responsable: op.responsable.nombre,
    }));

    if (registrosEmpaque.length == 0) {
      throw new Error("No hay Registros de Empaque.");
    }

    return {
      empaques,
      promedios,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCajasEmpaque = async (fecha) => {
  try {
    const registrosEmpaque = await DetalleEmpaque.findAll({
      attributes: ["fecha_produccion", "tipo", "lote_produccion"],
      where: {
        fecha_produccion: fecha,
      },
      group: ["lote_produccion", "tipo", "fecha_produccion"],
      raw: true,
    });

    if (registrosEmpaque.length === 0) {
      return {
        empaques: [],
        registroBodega: null,
      };
    }

    const registroBodega = await Bodega.findOne({
      where: {
        fecha_produccion: fecha,
      },
    });

    const empaques = registrosEmpaque.map((op) => ({
      Produccion: op.fecha_produccion,
      Tipo: op.tipo,
      LoteProduccion: op.lote_produccion,
    }));

    const resultado = {
      empaques,
      registroBodega: registroBodega || null,
    };

    return resultado;
  } catch (error) {
    console.error("Error en getCajasEmpaque:", error.message);
    return {
      empaques: [],
      registroBodega: null,
    };
  }
};

export const getEmpaqueByOrden = async (orden) => {
  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findAll({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        orden: orden,
      },
    });

    const empaques = registrosEmpaque.map((op) => ({
      id: op.id,
      Empaque: op.fecha_empaque,
      Produccion: op.fecha_produccion,
      LoteEmpaque: op.lote_empaque ?? "No tiene un Lote Asignado.",
      LoteProduccion: op.lote_produccion,
      Tipo: op.tipo_producto,
      Canastas: op.numero_canastas,
      Cajas: op.total_cajas,
      Migas: op.migas_empaque,
      Rechazo: op.rechazo_empaque,
      Observaciones: op.observaciones,
      Responsable: op.responsable.nombre,
    }));

    const detalleCajas = await Promise.all(
      empaques.map(async (empaque) => {
        const detalle = await DetalleCaja.findAll({
          attributes: ["caja", "cantidad"],
          where: { id_empaque: empaque.id },
        });
        return {
          ...empaque,
          detalle,
        };
      }),
    );

    return {
      empaques: detalleCajas,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getDetalleEmpaque = async (id) => {
  try {
    const registrosEmpaque = await RegistroAreaEmpaque.findOne({
      include: [
        {
          model: Responsable,
          as: "responsable",
          attributes: ["nombre"],
        },
      ],
      where: {
        id: id,
      },
    });

    if (!registrosEmpaque) {
      throw new Error("Registro no encontrado");
    }

    const proveedores = await proveedoresEmpaque.findAll({
      attributes: [
        "tipo",
        "fecha_produccion",
        "lote_proveedor",
        "diferente", // INCLUIR EL NUEVO CAMPO
        [fn("SUM", col("cajas")), "totalCajas"],
        [fn("SUM", col("canastas")), "numero_canastas"],
        [fn("SUM", col("rechazo")), "totalRechazo"],
        [fn("SUM", col("migas")), "totalMigas"],
      ],
      where: { id_empaque: id },
      group: ["lote_proveedor", "tipo", "fecha_produccion", "diferente"],
      raw: true,
    });

    const proveedoresList = proveedores.map((op) => ({
      fecha: op.fecha_produccion,
      proveedor: op.lote_proveedor,
      cajas: op.totalCajas,
      canastas: op.numero_canastas,
      tipo: op.tipo,
      rechazo: op.totalRechazo?.toFixed(1),
      migas: op.totalMigas?.toFixed(1),
      diferente: op.diferente || "", // INCLUIR EN LA RESPUESTA
    }));

    return {
      empaques: registrosEmpaque,
      proveedores: proveedoresList,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getEmpaqueById = async (id) =>
  await RegistroAreaEmpaque.findByPk(id);

export const update = async (id, data) => {
  const registro = await getEmpaqueById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update(data);
};

export const statusDelete = async (id) => {
  const registro = await getEmpaqueById(id);
  if (!registro) throw new Error("Registro no encontrado");
  return await registro.update({ estado: 0 });
};
