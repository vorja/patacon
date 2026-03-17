import { ApiService, AlertManager, Url } from "../../helpers/ApiUseManager.js";

const apiEmpaque = new ApiService(Url + "/data/empaque");
const apiLotes = new ApiService(Url + "/data/fritura");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");

const alerts = new AlertManager();

const Token_API = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

let lotes = [];
let infoEmpaque = [];
let detalle = [];
let cajas = [];

let pesoCaja_kg = 0;

let disponibilidadProveedores = new Map(); // key: lote_proveedor_tipo_loteProduccion, value: disponibles

// VARIABLES GLOBALES PARA EL SALDO TOTAL
let saldoGlobalTotal = 0;
let saldoGlobalUsado = 0;

const elements = {
    inputFecha: document.getElementById("fechaProduccion"),
    inputCanastas: document.getElementById("canastas"),
    selecLotes: document.getElementById("lotes"),
    selecProveedores: document.getElementById("proveedores"),
    inputTipo: document.getElementById("tipo"),
    inputCanastillas: document.getElementById("totalCanastas"),
    inputCajas: document.getElementById("totalCajas"),
    inputPesoPromedio: document.getElementById("promedioCajas"),
};

const init = async () => {
    try {
        await Promise.all([encargo(), empleados()]);
        setupEventListeners();
        setupDateDefaults();
    } catch (error) {
        console.error("Error inicializando aplicación:", error);
        alerts.show({
            success: false,
            message: "Error al inicializar la aplicación",
            type: "error",
        });
    }
};

const setupEventListeners = () => {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches(".btn-Obtener")) {
            eventObtener(e.target.dataset.id);
        }
        if (e.target.matches(".btn-Eliminar")) {
            eventEliminar(e.target);
        }
        if (e.target.matches(".btn-Registrar")) {
            eventAgregar(e.target.dataset.id);
        }
    });
};

const setupDateDefaults = () => {
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fechaProduccion").setAttribute("max", hoy);
    document.getElementById("fecha").setAttribute("max", hoy);
};

const eventAgregar = () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se registrará la información, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Registrar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            agregarFila();
        }
    });
};

const eventObtener = () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardará la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Confirmar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerInfoEmpaque();
        }
    });
};

const eventEliminar = (btn) => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminará la casilla, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Eliminar casilla.",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarFila(btn);
        }
    });
};

// Modificar el event listener de inputFecha
elements.inputFecha.addEventListener("change", async () => {
    const fecha = elements.inputFecha.value.trim();
    lotes = [];
    saldoGlobalTotal = 0; // Resetear el saldo global
    // NO reseteamos saldoGlobalUsado aquí, lo calcularemos después
    
    if (!fecha) return;

    try {
        const response = await apiLotes.get(`/obtener-lotes-Day/${fecha}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + Token_API,
            },
        });

        if (!response.success) {
            alerts.show(response);
            elements.selecLotes.innerHTML = "";
            elements.selecProveedores.innerHTML = "";
            limpiarInputs();
            return false;
        }
        const { lotesFritura } = response.data;

        elements.selecLotes.innerHTML = "";
        elements.selecProveedores.innerHTML = "";

        const optionDefault = document.createElement("option");
        optionDefault.textContent = "-- Seleccionar Lote --";
        optionDefault.value = "";
        elements.selecLotes.appendChild(optionDefault);

        // Agrupar lotes por lote_produccion + tipo
        const lotesUnicos = {};

        lotesFritura.forEach((item) => {
            const clave = `${item.lote_produccion}_${item.tipo}`;
            if (!lotesUnicos[clave]) {
                lotesUnicos[clave] = item;
                // SUMAR al saldo global TOTAL
                saldoGlobalTotal += item.saldo || 0;
            }
        });

        // Guardar el saldo global total en un atributo data
        elements.selecLotes.dataset.saldoGlobalTotal = saldoGlobalTotal;
        
        // CALCULAR cuánto del saldo global YA ESTÁ USADO en la tabla para ESTA fecha
        saldoGlobalUsado = calcularSaldoUsadoPorFecha(fecha);
        
        console.log(`Fecha seleccionada: ${fecha}`);
        console.log(`Saldo global total: ${saldoGlobalTotal}`);
        console.log(`Saldo ya usado en tabla para esta fecha: ${saldoGlobalUsado}`);
        console.log(`Saldo disponible: ${saldoGlobalTotal - saldoGlobalUsado}`);

        // Actualizar el placeholder del input canastas con el saldo global disponible
        const inputCanastas = document.querySelector("#canastas");
        const saldoDisponible = saldoGlobalTotal - saldoGlobalUsado;
        inputCanastas.dataset.saldoGlobalTotal = saldoGlobalTotal;
        inputCanastas.setAttribute("max", saldoDisponible);
        inputCanastas.setAttribute("placeholder", `Disponible: ${saldoDisponible} de ${saldoGlobalTotal}`);

        // Crear opciones mostrando lote_produccion + tipo
        Object.values(lotesUnicos).forEach((item) => {
            const option = document.createElement("option");
            option.value = item.tipo;
            option.dataset.lote_produccion = item.lote_produccion;
            option.dataset.tipo = item.tipo;
            option.dataset.saldo = item.saldo; // Guardar saldo individual para info
            option.textContent = `${item.lote_produccion} - ${item.tipo} (Saldo: ${item.saldo})`;
            elements.selecLotes.appendChild(option);
        });

        lotes = Object.values(lotesUnicos);
        
        // Mostrar el saldo global en algún lugar de la UI (opcional)
        mostrarSaldoGlobal();
        
    } catch (err) {
        Swal.fire({
            title: "¡Error!",
            text: err ? err : err.message,
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        console.error("Error cargando lotes:", err);
    }
});

// Función para calcular cuánto del saldo global ya está usado en la tabla para una fecha específica
function calcularSaldoUsadoPorFecha(fecha) {
    let totalUsado = 0;
    const filas = document.querySelectorAll("#tablaInfo tbody tr");

    filas.forEach((row) => {
        const fechaInput = row.querySelector('input[name="fecha_produccion[]"]');
        const canastasInput = row.querySelector('input[name="canastas[]"]');

        if (fechaInput && canastasInput) {
            // Si la fila tiene la misma fecha, sumar sus canastas
            if (fechaInput.value === fecha) {
                totalUsado += parseInt(canastasInput.value) || 0;
            }
        }
    });

    return totalUsado;
}

// Función para mostrar el saldo global (opcional)
function mostrarSaldoGlobal() {
    // Si tienes un elemento en tu HTML para mostrar el saldo global
    const saldoGlobalElement = document.getElementById("saldoGlobal");
    if (saldoGlobalElement) {
        saldoGlobalElement.textContent = `Saldo global disponible: ${saldoGlobalTotal - saldoGlobalUsado} de ${saldoGlobalTotal}`;
    }
}

// Modificar elements.selecLotes.addEventListener
elements.selecLotes.addEventListener("change", async (e) => {
    try {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const loteProduccion = selectedOption?.getAttribute(
            "data-lote_produccion",
        );
        const tipo = selectedOption?.value;
        const saldoLote = parseInt(selectedOption?.dataset.saldo || 0);

        console.log(
            `Seleccionado: Lote=${loteProduccion}, Tipo=${tipo}, Saldo=${saldoLote}`,
        );

        if (!loteProduccion || !tipo) {
            elements.selecProveedores.innerHTML = "";
            const optionDefault = document.createElement("option");
            optionDefault.textContent = "-- Seleccionar --";
            optionDefault.value = "";
            elements.selecProveedores.appendChild(optionDefault);
            return;
        }

        elements.selecProveedores.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.textContent = "-- Seleccionar Proveedor --";
        optionDefault.value = "";
        elements.selecProveedores.appendChild(optionDefault);

        // Buscar el lote específico
        const loteInfo = lotes.find(
            (item) =>
                item.lote_produccion === loteProduccion && item.tipo === tipo,
        );

        if (
            !loteInfo ||
            !loteInfo.proveedores ||
            loteInfo.proveedores.length === 0
        ) {
            console.warn(
                `No hay proveedores para el lote ${loteProduccion} tipo ${tipo}`,
            );

            Swal.fire({
                icon: "info",
                title: "Sin proveedores",
                text: `No hay proveedores disponibles para el lote ${loteProduccion} tipo ${tipo}`,
            });
            return;
        }

        const { proveedores } = loteInfo;

        // Cargar proveedores (solo para seleccionar)
        proveedores.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.lote_proveedor;
            option.dataset.lote_proveedor = item.lote_proveedor;
            option.dataset.lote_produccion = loteProduccion;
            option.dataset.id = item.id_proveedor;
            option.dataset.tipo = tipo;
            option.dataset.canastas_proveedor = item.canastas;

            // Clave única para este proveedor
            const key = `${item.lote_proveedor}_${tipo}_${loteProduccion}`;
            option.dataset.key = key;

            // Guardar en el mapa
            disponibilidadProveedores.set(key, item.canastas);

            // Crear opción
            if (item.canastas <= 0) {
                option.disabled = true;
                option.textContent = `${item.lote_proveedor} (Agotado)`;
            } else {
                option.textContent = `${item.lote_proveedor} (Stock: ${item.canastas})`;
            }

            elements.selecProveedores.appendChild(option);
        });

        // Actualizar el input de canastas con el saldo GLOBAL disponible
        const inputCanastas = document.querySelector("#canastas");
        const saldoGlobalDisponible = saldoGlobalTotal - saldoGlobalUsado;

        inputCanastas.setAttribute("max", saldoGlobalDisponible);
        inputCanastas.setAttribute(
            "placeholder",
            `Máximo global: ${saldoGlobalDisponible}`,
        );
        inputCanastas.dataset.loteProduccion = loteProduccion;
        inputCanastas.dataset.tipo = tipo;

        console.log(
            `Saldo global disponible: ${saldoGlobalDisponible} de ${saldoGlobalTotal}`,
        );
    } catch (err) {
        Swal.fire({
            title: "¡Error!",
            text: err ? err.message : "Error desconocido",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        console.error("Error cargando proveedores:", err);
    }
});

// Modificar elements.selecProveedores.addEventListener
elements.selecProveedores.addEventListener("change", function (e) {
    const valor = e.target.value;
    if (!valor) {
        limpiarInputs();
        return;
    }

    const selectedOption = e.target.options[e.target.selectedIndex];
    const loteProduccion = selectedOption.dataset.lote_produccion;
    const tipo = selectedOption.dataset.tipo;
    const loteProveedor = selectedOption.dataset.lote_proveedor;

    // Usar el saldo GLOBAL como límite
    const saldoGlobalDisponible = saldoGlobalTotal - saldoGlobalUsado;

    console.log(`Proveedor seleccionado: 
        Lote Producción: ${loteProduccion}, 
        Tipo: ${tipo}, 
        Lote Proveedor: ${loteProveedor}, 
        Saldo GLOBAL disponible: ${saldoGlobalDisponible} de ${saldoGlobalTotal}`);

    if (saldoGlobalDisponible <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "No hay canastillas disponibles en el saldo global.",
        });
        e.target.selectedIndex = 0;
        limpiarInputs();
        return;
    }

    const canastas = document.querySelector("#canastas");
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");

    canastas.setAttribute("max", `${saldoGlobalDisponible}`);
    canastas.setAttribute(
        "placeholder",
        `Máximo global: ${saldoGlobalDisponible}`,
    );
    canastas.setAttribute("data-lote_produccion", `${loteProduccion}`);
    canastas.setAttribute("data-tipo", `${tipo}`);
    canastas.setAttribute("data-lote_proveedor", `${loteProveedor}`);
    canastas.setAttribute("data-key", selectedOption.dataset.key);
    canastas.value = "";
    cajas.value = "";
    canastas.removeAttribute("readonly");
    migas.removeAttribute("readonly");
    cajas.removeAttribute("readonly");
    rechazo.removeAttribute("readonly");
});

// Después de elements.inputCanastas.addEventListener
elements.inputCanastas.addEventListener("input", (e) => {
    const valor = parseInt(e.target.value) || 0;
    if (!valor) {
        const migas = document.querySelector("#migas");
        const cajas = document.querySelector("#cajas");
        const rechazo = document.querySelector("#rechazo");
        const cajasDiferente = document.querySelector("#cajas_diferente");
        const referenciaDiferente = document.querySelector("#referencia_diferente");

        migas.setAttribute("readonly", "");
        cajas.setAttribute("readonly", "");
        rechazo.setAttribute("readonly", "");
        cajasDiferente.setAttribute("readonly", "");
        referenciaDiferente.setAttribute("disabled", "");
        
        migas.value = "";
        cajas.value = "";
        rechazo.value = "";
        cajasDiferente.value = "";
        referenciaDiferente.value = "";
        return;
    }

    const maxCanastas = parseInt(e.target.getAttribute("max"));
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");
    const cajasDiferente = document.querySelector("#cajas_diferente");
    const referenciaDiferente = document.querySelector("#referencia_diferente");

    if (valor > maxCanastas) {
        Swal.fire({
            title: "¡Atención!",
            html: `No puede exceder el saldo global disponible. | Disponible: <p class="badge text-danger fw-bold fs-5">${maxCanastas}</p> de ${saldoGlobalTotal} totales`,
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        migas.setAttribute("readonly", "");
        cajas.setAttribute("readonly", "");
        rechazo.setAttribute("readonly", "");
        cajasDiferente.setAttribute("readonly", "");
        referenciaDiferente.setAttribute("disabled", "");
        
        migas.value = "";
        cajas.value = "";
        rechazo.value = "";
        cajasDiferente.value = "";
        referenciaDiferente.value = "";
        e.target.value = "";
        return;
    }

    migas.removeAttribute("readonly");
    cajas.removeAttribute("readonly");
    rechazo.removeAttribute("readonly");
    cajasDiferente.removeAttribute("readonly");
    referenciaDiferente.removeAttribute("disabled");
});

// Habilitar/deshabilitar campo cajas_diferente basado en selección de referencia
document.getElementById("referencia_diferente").addEventListener("change", function(e) {
    const cajasDiferente = document.getElementById("cajas_diferente");
    if (e.target.value) {
        cajasDiferente.removeAttribute("readonly");
    } else {
        cajasDiferente.setAttribute("readonly", "");
        cajasDiferente.value = "";
    }
});

function agregarFila() {
    const loteProveedorSelect = document.querySelector(`#proveedores`);
    const selectedProv = loteProveedorSelect.querySelector("option:checked");

    if (!selectedProv || !selectedProv.value) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Por favor, seleccione un proveedor.",
        });
        return;
    }

    const id_proveedor = selectedProv?.getAttribute("data-id");
    const fechaProduccion = document.querySelector(`#fechaProduccion`).value;

    const select = document.getElementById("lotes");
    const selectedOption = select.querySelector("option:checked");
    const loteProduccion = selectedOption?.getAttribute("data-lote_produccion");
    const tipo = select.value;

    const campos = [`canastas`, `cajas`, `migas`, "rechazo"];

    if (!validarCamposForm(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, complete los campos requeridos.",
        });
        return;
    }

    const canastas = parseInt(document.querySelector(`#canastas`).value) || 0;
    const cajas = parseInt(document.querySelector(`#cajas`).value) || 0;
    const migas = parseFloat(document.querySelector(`#migas`).value || 0);
    const rechazo = parseFloat(document.querySelector(`#rechazo`).value || 0);

    // NUEVOS CAMPOS
    const referenciaDiferente =
        document.querySelector(`#referencia_diferente`).value || null;
    const cajasDiferente =
        parseInt(document.querySelector(`#cajas_diferente`).value) || 0;

    if (!canastas || canastas <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese datos válidos para canastas y cajas.",
        });
        return;
    }

    // Verificar contra el saldo GLOBAL
    const inputCanastas = document.querySelector("#canastas");

    // Calcular saldo disponible actualizado (considerando TODAS las filas de la fecha actual)
    const fechaActual = document.querySelector(`#fechaProduccion`).value;
    const saldoUsadoEnFecha = calcularSaldoUsadoPorFecha(fechaActual);
    const saldoDisponible = saldoGlobalTotal - saldoUsadoEnFecha;

    if (canastas > saldoDisponible) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: `Solo hay ${saldoDisponible} canastillas disponibles de ${saldoGlobalTotal} totales.`,
        });
        return;
    }

    // Si hay referencia diferente pero no hay cajas diferentes, mostrar advertencia
    if (referenciaDiferente && cajasDiferente <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ha seleccionado una referencia diferente pero no ha ingresado la cantidad de cajas.",
        });
        return;
    }

    // Actualizar saldo global usado (recalculado)
    saldoGlobalUsado = saldoUsadoEnFecha + canastas;

    // Actualizar el atributo max del input de canastas
    const nuevoSaldoDisponible = saldoGlobalTotal - saldoGlobalUsado;
    inputCanastas.setAttribute("max", nuevoSaldoDisponible);
    inputCanastas.setAttribute(
        "placeholder",
        `Disponible: ${nuevoSaldoDisponible} de ${saldoGlobalTotal}`,
    );

    console.log("Creando nueva fila");
    console.log(
        `Saldo global: Total=${saldoGlobalTotal}, Usado=${saldoGlobalUsado}, Restante=${nuevoSaldoDisponible}`,
    );

    // Actualizar UI del saldo global
    mostrarSaldoGlobal();

    const newRow = document.createElement("tr");

    // Celdas (incluyendo nuevas columnas)
    const tdFechaProduccion = document.createElement("td");
    tdFechaProduccion.textContent = fechaProduccion;

    const tdLoteProveedor = document.createElement("td");
    tdLoteProveedor.textContent = selectedProv.value;

    const tdTipo = document.createElement("td");
    tdTipo.textContent = tipo;

    const tdCanastas = document.createElement("td");
    tdCanastas.textContent = canastas;

    const tdCajas = document.createElement("td");
    tdCajas.textContent = cajas;

    // NUEVAS CELDAS
    const tdRefDiferente = document.createElement("td");
    tdRefDiferente.textContent = referenciaDiferente || "-";

    const tdCajasDiferente = document.createElement("td");
    tdCajasDiferente.textContent = cajasDiferente > 0 ? cajasDiferente : "-";

    const tdRechazo = document.createElement("td");
    tdRechazo.textContent = rechazo.toFixed(1);

    const tdMigas = document.createElement("td");
    tdMigas.textContent = migas.toFixed(1);

    const tdBtnBorrar = document.createElement("td");
    tdBtnBorrar.innerHTML = ` <button type="button" class="btn btn-danger btn-lg btn-Eliminar">
          <i class="fa-solid fa-ban text-white fs-3"></i>
        </button>`;

    // Inputs ocultos
    const inputFecha = document.createElement("input");
    inputFecha.type = "hidden";
    inputFecha.value = fechaProduccion;
    inputFecha.name = "fecha_produccion[]";
    tdFechaProduccion.appendChild(inputFecha);

    const inputLoteProduccion = document.createElement("input");
    inputLoteProduccion.type = "hidden";
    inputLoteProduccion.value = loteProduccion;
    inputLoteProduccion.name = "lote_produccion[]";
    inputLoteProduccion.dataset.lote_produccion = loteProduccion;
    inputLoteProduccion.dataset.tipo = tipo;
    tdLoteProveedor.appendChild(inputLoteProduccion);

    const inputLoteProveedor = document.createElement("input");
    inputLoteProveedor.type = "hidden";
    inputLoteProveedor.value = selectedProv.value;
    inputLoteProveedor.name = "lote_proveedor[]";
    inputLoteProveedor.dataset.id = id_proveedor;
    inputLoteProveedor.dataset.lote_proveedor = selectedProv.value;
    inputLoteProveedor.dataset.key = selectedProv.dataset.key;
    tdLoteProveedor.appendChild(inputLoteProveedor);

    const inputTipo = document.createElement("input");
    inputTipo.type = "hidden";
    inputTipo.value = tipo;
    inputTipo.name = "tipo[]";
    inputTipo.dataset.tipo = tipo;
    tdTipo.appendChild(inputTipo);

    const inputCanastasHidden = document.createElement("input");
    inputCanastasHidden.type = "hidden";
    inputCanastasHidden.value = canastas;
    inputCanastasHidden.name = "canastas[]";
    tdCanastas.appendChild(inputCanastasHidden);

    const inputCajasHidden = document.createElement("input");
    inputCajasHidden.type = "hidden";
    inputCajasHidden.value = cajas;
    inputCajasHidden.name = "cajas[]";
    tdCajas.appendChild(inputCajasHidden);

    // NUEVOS INPUTS HIDDEN
    if (referenciaDiferente) {
        const inputRefDiferente = document.createElement("input");
        inputRefDiferente.type = "hidden";
        inputRefDiferente.value = referenciaDiferente;
        inputRefDiferente.name = "referencia_diferente[]";
        tdRefDiferente.appendChild(inputRefDiferente);
    }

    if (cajasDiferente > 0) {
        const inputCajasDiferente = document.createElement("input");
        inputCajasDiferente.type = "hidden";
        inputCajasDiferente.value = cajasDiferente;
        inputCajasDiferente.name = "cajas_diferente[]";
        tdCajasDiferente.appendChild(inputCajasDiferente);
    }

    const inputRechazoHidden = document.createElement("input");
    inputRechazoHidden.type = "hidden";
    inputRechazoHidden.value = rechazo;
    inputRechazoHidden.name = "rechazo[]";
    tdRechazo.appendChild(inputRechazoHidden);

    const inputMigasHidden = document.createElement("input");
    inputMigasHidden.type = "hidden";
    inputMigasHidden.value = migas;
    inputMigasHidden.name = "migas[]";
    tdMigas.appendChild(inputMigasHidden);

    // Añadir celdas a la fila
    newRow.appendChild(tdFechaProduccion);
    newRow.appendChild(tdLoteProveedor);
    newRow.appendChild(tdTipo);
    newRow.appendChild(tdCanastas);
    newRow.appendChild(tdCajas);
    newRow.appendChild(tdRefDiferente); // Nueva columna
    newRow.appendChild(tdCajasDiferente); // Nueva columna
    newRow.appendChild(tdRechazo);
    newRow.appendChild(tdMigas);
    newRow.appendChild(tdBtnBorrar);

    document.querySelector("#tablaInfo tbody").appendChild(newRow);

    // Limpiar inputs y resetear selección
    inputCanastas.value = "";
    limpiarInputs();
    loteProveedorSelect.selectedIndex = 0;

    // Limpiar nuevos campos
    document.querySelector("#referencia_diferente").value = "";
    document.querySelector("#cajas_diferente").value = "";
    document.querySelector("#cajas_diferente").setAttribute("readonly", "");

    // Actualizar totales
    updateTotales();
}

// Modificar eliminarFila
function eliminarFila(btn) {
    if (!btn) return;

    const fila = btn.closest("tr");
    
    // Obtener la fecha de la fila que se va a eliminar
    const fechaInput = fila.querySelector('input[name="fecha_produccion[]"]');
    const fechaFila = fechaInput ? fechaInput.value : null;
    
    // Solo actualizar el saldo si la fecha de la fila es la fecha actual seleccionada
    const fechaActual = document.querySelector(`#fechaProduccion`).value;
    
    // Eliminar fila
    fila.remove();
    
    // Recalcular saldo usado para la fecha actual
    if (fechaActual) {
        saldoGlobalUsado = calcularSaldoUsadoPorFecha(fechaActual);
    }
    
    // Actualizar el input de canastas
    const inputCanastas = document.querySelector("#canastas");
    const nuevoSaldoDisponible = saldoGlobalTotal - saldoGlobalUsado;
    
    inputCanastas.setAttribute("max", nuevoSaldoDisponible);
    inputCanastas.setAttribute("placeholder", `Disponible: ${nuevoSaldoDisponible} de ${saldoGlobalTotal}`);
    
    // Actualizar UI
    mostrarSaldoGlobal();
    
    updateTotales();

    console.log(`Fila eliminada. Saldo global: Total=${saldoGlobalTotal}, Usado=${saldoGlobalUsado}, Restante=${nuevoSaldoDisponible}`);
}

function limpiarInputs() {
    const inputs = ["canastas", "cajas", "migas", "rechazo", "cajas_diferente"];
    const selects = ["referencia_diferente"];

    inputs.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = "";
            input.setAttribute("readonly", true);
            input.classList.remove("is-valid", "is-invalid");
        }
    });

    selects.forEach((id) => {
        const select = document.getElementById(id);
        if (select) {
            select.value = "";
            select.setAttribute("disabled", "");
        }
    });

    const inptCanastas = document.querySelector(`#canastas`);
    const fechaActual = document.querySelector(`#fechaProduccion`).value;

    if (fechaActual && saldoGlobalTotal > 0) {
        const saldoUsadoEnFecha = calcularSaldoUsadoPorFecha(fechaActual);
        const saldoDisponible = saldoGlobalTotal - saldoUsadoEnFecha;

        inptCanastas.setAttribute("max", saldoDisponible);
        inptCanastas.setAttribute(
            "placeholder",
            `Disponible: ${saldoDisponible} de ${saldoGlobalTotal}`,
        );
        inptCanastas.dataset.saldoDisponible = saldoDisponible;
    } else {
        inptCanastas.setAttribute("max", "0");
        inptCanastas.setAttribute("placeholder", "Seleccione fecha primero");
    }
}

function updateTotales() {
    let totalCanastas = 0;
    let totalCajas = 0;
    let totalRechazo = 0;
    let totalMigas = 0;

    const filas = document.querySelectorAll("#tablaInfo tbody tr");

    filas.forEach((fila) => {
        const canastasInput = fila.querySelector('input[name="canastas[]"]');
        const cajasInput = fila.querySelector('input[name="cajas[]"]');
        const cajasDiferenteInput = fila.querySelector(
            'input[name="cajas_diferente[]"]',
        ); // <-- Input de cajas diferentes
        const rechazoInput = fila.querySelector('input[name="rechazo[]"]');
        const migasInput = fila.querySelector('input[name="migas[]"]');

        if (canastasInput && cajasInput && rechazoInput && migasInput) {
            totalCanastas += parseInt(canastasInput.value) || 0;
            totalCajas += parseInt(cajasInput.value) || 0; // Cajas normales

            // SUMAR CAJAS DIFERENTES SI EXISTEN
            if (cajasDiferenteInput) {
                totalCajas += parseInt(cajasDiferenteInput.value) || 0;
            }

            totalRechazo += parseFloat(rechazoInput.value) || 0;
            totalMigas += parseFloat(migasInput.value) || 0;
        }
    });

    document.getElementById("totalCanastas").value = totalCanastas;
    document.getElementById("totalCajas").value = totalCajas; // Ahora incluye normales + diferentes
    document.getElementById("totalRechazo").value = totalRechazo.toFixed(1);
    document.getElementById("totalMigas").value = totalMigas.toFixed(1);

    console.log(
        `TOTALES: ${totalCanastas} canastas, ${totalCajas} cajas (incluye diferentes)`,
    );
}

// Generar lote de empaque automáticamente al seleccionar fecha
document.getElementById("fecha").addEventListener("change", function(e) {
    const fecha = e.target.value;
    if (fecha) {
        // Convertir fecha de YYYY-MM-DD a DDMMYY
        const partes = fecha.split('-');
        const año = partes[0].slice(-2); // Últimos 2 dígitos del año
        const mes = partes[1];
        const dia = partes[2];
        
        // Formato: DDMMYY
        const fechaFormateada = dia + mes + año;
        
        // Generar lote: LE + fechaFormateada
        const loteEmpaque = "LE" + fechaFormateada;
        
        // Asignar al campo lote_empaque
        document.getElementById("lote_empaque").value = loteEmpaque;
        
        console.log(`Lote de empaque generado: ${loteEmpaque}`);
    } else {
        // Si se borra la fecha, limpiar el campo lote
        document.getElementById("lote_empaque").value = "";
    }
});

function obtenerInfoEmpaque() {
    infoEmpaque = [];
    detalle = [];
    cajas = [];

    const filas = document.querySelectorAll(`#tablaInfo tbody tr`);

    if (!filas || filas.length === 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No hay Información para registrar.",
            icon: "error",
        });
        return false;
    }

    const lotesMap = new Map();
    const cajasMap = new Map();
    const detalleArray = [];

    filas.forEach((fila, index) => {
        const inputs = {
            fecha: fila.querySelector('input[name="fecha_produccion[]"]'),
            lote: fila.querySelector('input[name="lote_produccion[]"]'),
            loteProveedor: fila.querySelector('input[name="lote_proveedor[]"]'),
            tipo: fila.querySelector('input[name="tipo[]"]'),
            canastas: fila.querySelector('input[name="canastas[]"]'),
            cajas: fila.querySelector('input[name="cajas[]"]'),
            rechazo: fila.querySelector('input[name="rechazo[]"]'),
            migas: fila.querySelector('input[name="migas[]"]'),
        };

        var referenciaDiferenteFila = fila.querySelector(
                'input[name="referencia_diferente[]"]',
            );
        var cajasDiferenteFila = fila.querySelector(
                'input[name="cajas_diferente[]"]',
            );

        console.log(inputs)

        const todosPresentes = Object.values(inputs).every(
            (input) => input !== null || input === undefined, // Los nuevos campos pueden ser null
        );
        if (!todosPresentes) {
            console.warn(`Fila ${index} no tiene todos los inputs necesarios`);
            return;
        }

        
        const referenciaDiferente = referenciaDiferenteFila
            ? referenciaDiferenteFila.value.trim()
            : null;
        const cajasDiferente = cajasDiferenteFila
            ? parseInt(cajasDiferenteFila.value.trim())
            : 0;

        let diferente = "";
        if (referenciaDiferente && cajasDiferente) {
            diferente = `${referenciaDiferente},${cajasDiferente}`;
        }

        const detalleItem = {
            fecha_produccion: inputs.fecha.value.trim(),
            lote_produccion: inputs.lote.value.trim(),
            id_proveedor: parseInt(inputs.loteProveedor.dataset.id) || 0,
            lote_proveedor: inputs.loteProveedor.value.trim(),
            tipo: inputs.tipo.value.trim(),
            cajas: parseInt(inputs.cajas.value.trim()) || 0,
            canastas: parseInt(inputs.canastas.value.trim()) || 0,
            rechazo: parseFloat(inputs.rechazo.value.trim()) || 0,
            migas: parseFloat(inputs.migas.value.trim()) || 0,

            diferente: diferente,
        };

        detalleArray.push(detalleItem);

        const loteKey = `${detalleItem.lote_produccion}_${detalleItem.tipo}`;

        if (!lotesMap.has(loteKey)) {
            lotesMap.set(loteKey, {
                fecha_produccion: detalleItem.fecha_produccion,
                lote_produccion: detalleItem.lote_produccion,
                tipo: detalleItem.tipo,
                numero_canastas: 0,
                migas_empaque: 0,
                total_cajas: 0,
                total_rechazo: 0,
            });
        }

        const loteActual = lotesMap.get(loteKey);
        loteActual.numero_canastas += detalleItem.canastas;
        loteActual.migas_empaque += detalleItem.migas;
        loteActual.total_cajas += detalleItem.cajas;
        loteActual.total_rechazo += detalleItem.rechazo;

        // Para el resumen de cajas, consideramos tanto cajas normales como diferentes
        const cajaKey = detalleItem.tipo;
        if (!cajasMap.has(cajaKey)) {
            cajasMap.set(cajaKey, {
                caja: detalleItem.tipo,
                cantidad: 0,
            });
        }

        const cajaActual = cajasMap.get(cajaKey);
        cajaActual.cantidad += detalleItem.cajas;

        // Si hay cajas diferentes, también las agregamos al resumen
        if (
            detalleItem.referencia_diferente &&
            detalleItem.cajas_diferente > 0
        ) {
            const cajaDiffKey = detalleItem.referencia_diferente;
            if (!cajasMap.has(cajaDiffKey)) {
                cajasMap.set(cajaDiffKey, {
                    caja: detalleItem.referencia_diferente,
                    cantidad: 0,
                });
            }
            const cajaDiffActual = cajasMap.get(cajaDiffKey);
            cajaDiffActual.cantidad += detalleItem.cajas_diferente;
        }
    });

    if (detalleArray.length === 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No se encontraron datos válidos en la tabla.",
            icon: "error",
        });
        return false;
    }

    infoEmpaque = Array.from(lotesMap.values());
    cajas = Array.from(cajasMap.values());
    detalle = detalleArray;

    console.log("=== RESUMEN DE DATOS EMPAQUE ===");
    console.log("Lotes agrupados (resumen):", infoEmpaque);
    console.log("Cajas empacadas (por tipo):", cajas);
    console.log("Detalle completo (CADA FILA INDIVIDUAL):", detalle);
    console.log(`Total de filas: ${detalle.length}`);

    let timerInterval;
    Swal.fire({
        title: "¡Procesando Información!",
        html: "Terminando en <b></b> milliseconds.",
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            $("#ModalEmpaque").modal("hide");
        }
    });

    return true;
}

function validarCamposForm(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const input = document.getElementById(id);
        const valor = input?.value.trim();
        if (!valor) {
            todosLlenos = false;
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }
    });

    return todosLlenos;
}

function fillDatalist(datalist, data) {
    datalist.innerHTML = "";
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nombre;
        option.dataset.id = item.id;
        datalist.appendChild(option);
    });
}

function handleInput(datalist, inputId, idFieldId) {
    document.getElementById(inputId).addEventListener("input", (e) => {
        const selectedOption = datalist.querySelector(
            `option[value="${e.target.value}"]`,
        );
        if (selectedOption) {
            document.getElementById(idFieldId).value =
                selectedOption.dataset.id;
        }
    });
}

async function enviarFormulario() {
    const camposObligatorios = [
        "fecha",
        "lote_empaque",
        "responsablenombre",
        "responsableid",
        "totalCanastas",
        "totalCajas",
        "totalRechazo",
        "totalMigas",
        "idEncargo",
        "promedioCajas",
    ];

    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "¡Error!",
            text: "Por favor, complete la información de los campos Obligatorios antes de guardar el registro.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    if (
        infoEmpaque.length === 0 ||
        detalle.length === 0
    ) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay Información de Empaque para guardar.",
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    const promedio_peso =
        parseFloat(document.querySelector("#promedioCajas").value) || 0;

    infoEmpaque.forEach((item, index) => {
        const kg = item.total_cajas * promedio_peso;
        infoEmpaque[index].peso_kg = parseFloat(kg.toFixed(2));
    });

    const empaquetado = {
        fecha_empaque: document.querySelector("#fecha").value,
        lote_empaque: document
            .querySelector("#lote_empaque")
            .value.trim()
            .toUpperCase(),
        id_responsable: document.querySelector("#responsableid").value,
        numero_canastas:
            parseInt(document.querySelector("#totalCanastas").value.trim()) ||
            0,
        total_cajas:
            parseInt(document.querySelector("#totalCajas").value.trim()) || 0,
        migas_empaque:
            parseFloat(document.querySelector("#totalMigas").value.trim()) || 0,
        rechazo_empaque:
            parseFloat(document.querySelector("#totalRechazo").value.trim()) ||
            0,
        promedio_peso: promedio_peso,
        peso_kg: updatePeso(),
        orden: document.querySelector("#idEncargo").value,
        observaciones:
            document.querySelector("#Observaciones").value ||
            "No hay observaciones.",
        cajas: cajas,
        infoEmpaque: infoEmpaque,
        proveedores: detalle,
    };

    console.log("=== DATOS A ENVIAR ===");
    console.log("Datos de empaque completos:", empaquetado);

    try {
        const respuesta = await apiEmpaque.post("/crear", empaquetado, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + Token_API,
            },
        });

        if (!respuesta.success) {
            alerts.show(respuesta);
        } else {
            alerts.show(respuesta);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message || "Error desconocido al enviar formulario",
            icon: "error",
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, 3000);
    }
}

function updatePeso() {
    let totalCajas = parseInt(elements.inputCajas.value.trim()) || 0;
    let pesoPromedio = parseFloat(elements.inputPesoPromedio.value.trim()) || 0;

    if (!pesoPromedio || !totalCajas || pesoPromedio <= 0 || totalCajas <= 0)
        return 0;

    pesoCaja_kg = totalCajas * pesoPromedio;
    return parseFloat(pesoCaja_kg.toFixed(2));
}

document.getElementById("btnGuardar").addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviará la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Enviar información.",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            enviarFormulario();
        }
    });
});

const empleados = async () => {
    try {
        const response = await apiEmpleados.get("/obtener-by-rol/Empacador", {
            headers: {
                Authorization: "Bearer " + Token_API,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { responsables } = response.data;
        const empleadolist = document.getElementById("empeladolist");

        fillDatalist(empleadolist, responsables);
        handleInput(empleadolist, "responsablenombre", "responsableid");
    } catch (error) {
        console.error("Error cargando empleados:", error);
    }
};

const encargo = async () => {
    try {
        const response = await apiEncargo.get("/leer", {
            headers: {
                Authorization: "Bearer " + Token_API,
            },
        });

        if (!response.success) {
            alerts.show(response);
            setTimeout(() => {
                window.location.replace("/tablet/home");
            }, 3000);
            return;
        }

        const { configuracion } = response.data;
        if (configuracion && configuracion.length > 0) {
            document.getElementById("idEncargo").value =
                configuracion[0].orden_actual;
        }
    } catch (error) {
        console.error("Error cargando encargo:", error);
    }
};

const setupWebSocket = () => {
    try {
        let x = Url.replace("http:", "");

        const socket = new WebSocket("ws:" + x);

        socket.onopen = () => {
            console.log("WebSocket conectado");
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "cambioOrden") {
                    console.log("Orden de encargo cambiada, actualizando...");
                    encargo();
                }
            } catch (error) {
                console.error("Error procesando mensaje WebSocket:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        socket.onclose = () => {
            console.log(
                "WebSocket desconectado, intentando reconectar en 5s...",
            );
            setTimeout(setupWebSocket, 5000);
        };
    } catch (error) {
        console.error("Error configurando WebSocket:", error);
    }
};

// Inicializar
init();
setupWebSocket();
