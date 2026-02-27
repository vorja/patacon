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

elements.inputFecha.addEventListener("change", async () => {
    const fecha = elements.inputFecha.value.trim();
    lotes = [];
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

        // Agrupar lotes por lote_produccion + tipo para evitar duplicados
        const lotesUnicos = {};

        lotesFritura.forEach((item) => {
            const clave = `${item.lote_produccion}_${item.tipo}`;
            if (!lotesUnicos[clave]) {
                lotesUnicos[clave] = item;
            }
        });

        // Crear opciones mostrando lote_produccion + tipo
        Object.values(lotesUnicos).forEach((item) => {
            const option = document.createElement("option");
            option.value = item.tipo;
            option.dataset.lote_produccion = item.lote_produccion;
            option.dataset.tipo = item.tipo;
            option.textContent = `${item.lote_produccion} - ${item.tipo}`;
            elements.selecLotes.appendChild(option);
        });

        lotes = Object.values(lotesUnicos);
        console.log("Lotes únicos cargados:", lotes);
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

elements.selecLotes.addEventListener("change", async (e) => {
    try {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const loteProduccion = selectedOption?.getAttribute(
            "data-lote_produccion",
        );
        const tipo = selectedOption?.value;

        console.log(`Seleccionado: Lote=${loteProduccion}, Tipo=${tipo}`);

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

        // Buscar el lote específico por lote_produccion Y tipo
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

        // Cargar proveedores con su disponibilidad actual
        proveedores.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.lote_proveedor;
            option.dataset.lote_proveedor = item.lote_proveedor;
            option.dataset.lote_produccion = loteProduccion;
            option.dataset.id = item.id_proveedor;
            option.dataset.tipo = tipo;

            // Clave única para este proveedor en este lote y tipo
            const key = `${item.lote_proveedor}_${tipo}_${loteProduccion}`;

            // Calcular canastas ya usadas en la tabla
            const canastasUsadas = calcularCanastasUsadas(
                item.lote_proveedor,
                tipo,
                loteProduccion,
            );
            const canastasOriginales = parseInt(item.canastas) || 0;

            // Obtener disponibilidad del mapa o calcularla
            let canastasDisponibles;

            if (disponibilidadProveedores.has(key)) {
                canastasDisponibles = disponibilidadProveedores.get(key);
            } else {
                canastasDisponibles = canastasOriginales - canastasUsadas;
                disponibilidadProveedores.set(key, canastasDisponibles);
            }

            option.dataset.canastas = canastasDisponibles;
            option.dataset.canastas_originales = canastasOriginales;
            option.dataset.key = key;

            if (canastasDisponibles <= 0) {
                option.disabled = true;
                option.textContent = `${item.lote_proveedor} (Agotado)`;
            } else {
                option.textContent = `${item.lote_proveedor} (Disponibles: ${canastasDisponibles})`;
            }

            elements.selecProveedores.appendChild(option);
        });

        console.log(
            "Estado actual de disponibilidad:",
            Object.fromEntries(disponibilidadProveedores),
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

function calcularCanastasUsadas(loteProveedor, tipo, loteProduccion) {
    let totalUsadas = 0;
    const filas = document.querySelectorAll("#tablaInfo tbody tr");

    filas.forEach((row) => {
        const loteProvInput = row.querySelector(
            'input[name="lote_proveedor[]"]',
        );
        const tipoInput = row.querySelector('input[name="tipo[]"]');
        const loteProdInput = row.querySelector(
            'input[name="lote_produccion[]"]',
        );

        if (loteProvInput && tipoInput && loteProdInput) {
            if (
                loteProvInput.value === loteProveedor &&
                tipoInput.value === tipo &&
                loteProdInput.value === loteProduccion
            ) {
                const canastasInput = row.querySelector(
                    'input[name="canastas[]"]',
                );
                if (canastasInput) {
                    totalUsadas += parseInt(canastasInput.value) || 0;
                }
            }
        }
    });

    return totalUsadas;
}

elements.selecProveedores.addEventListener("change", function (e) {
    const valor = e.target.value;
    if (!valor) {
        limpiarInputs();
        return;
    }

    const selectedOption = e.target.options[e.target.selectedIndex];
    const loteProduccion = selectedOption.dataset.lote_produccion;
    const tipo = selectedOption.dataset.tipo;
    const maxCanastas = parseInt(selectedOption.dataset.canastas || 0);
    const loteProveedor = selectedOption.dataset.lote_proveedor;

    console.log(`Proveedor seleccionado: 
        Lote Producción: ${loteProduccion}, 
        Tipo: ${tipo}, 
        Lote Proveedor: ${loteProveedor}, 
        Canastas disponibles: ${maxCanastas}`);

    if (maxCanastas <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Este proveedor no tiene canastillas disponibles",
        });
        e.target.selectedIndex = 0;
        limpiarInputs();
        return;
    }

    const canastas = document.querySelector("#canastas");
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");

    canastas.setAttribute("max", `${maxCanastas}`);
    canastas.setAttribute("placeholder", `Máximo: ${maxCanastas}`);
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

elements.inputCanastas.addEventListener("input", (e) => {
    const valor = parseInt(e.target.value) || 0;
    if (!valor) {
        const migas = document.querySelector("#migas");
        const cajas = document.querySelector("#cajas");
        const rechazo = document.querySelector("#rechazo");

        migas.setAttribute("readonly", "");
        cajas.setAttribute("readonly", "");
        rechazo.setAttribute("readonly", "");
        migas.value = "";
        cajas.value = "";
        rechazo.value = "";
        return;
    }

    const maxCanastas = parseInt(e.target.getAttribute("max"));
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");

    if (valor > maxCanastas) {
        Swal.fire({
            title: "¡Atención!",
            html: `No puede exceder el total de canastillas disponibles. | Máximo: <p class="badge text-danger fw-bold fs-5">${maxCanastas}</p>`,
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        migas.setAttribute("readonly", "");
        cajas.setAttribute("readonly", "");
        rechazo.setAttribute("readonly", "");
        migas.value = "";
        cajas.value = "";
        rechazo.value = "";
        e.target.value = "";
        return;
    }

    migas.removeAttribute("readonly");
    cajas.removeAttribute("readonly");
    rechazo.removeAttribute("readonly");
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

    if (!canastas || canastas <= 0 || !cajas || cajas <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese datos válidos para canastas y cajas.",
        });
        return;
    }

    // Obtener disponibilidad actual
    const disponibilidadActual = parseInt(selectedProv?.dataset.canastas || 0);
    const key = selectedProv.dataset.key;
    
    // Verificar disponibilidad
    if (canastas > disponibilidadActual) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: `Solo tiene ${disponibilidadActual} canastillas disponibles en este momento.`,
        });
        return;
    }
    
    // Calcular nueva disponibilidad
    const nuevaDisponibilidad = disponibilidadActual - canastas;
    
    // Actualizar el mapa GLOBAL y el dataset
    disponibilidadProveedores.set(key, nuevaDisponibilidad);
    selectedProv.dataset.canastas = nuevaDisponibilidad.toString();
    
    // Actualizar el texto de la opción
    if (nuevaDisponibilidad <= 0) {
        selectedProv.disabled = true;
        selectedProv.textContent = `${selectedProv.dataset.lote_proveedor} (Agotado)`;
    } else {
        selectedProv.textContent = `${selectedProv.dataset.lote_proveedor} (Disponibles: ${nuevaDisponibilidad})`;
    }

    // Actualizar el atributo max del input de canastas
    const inputCanastas = document.querySelector("#canastas");
    inputCanastas.setAttribute("max", nuevaDisponibilidad);
    inputCanastas.setAttribute("placeholder", `Máximo: ${nuevaDisponibilidad}`);

    console.log("Creando nueva fila para proveedor:", selectedProv.value);
    
    const newRow = document.createElement("tr");

    // Celdas
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
    inputLoteProveedor.dataset.key = key;
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
    newRow.appendChild(tdRechazo);
    newRow.appendChild(tdMigas);
    newRow.appendChild(tdBtnBorrar);

    document.querySelector("#tablaInfo tbody").appendChild(newRow);

    // Asegurar que el input de canastas muestre el límite correcto
    inputCanastas.value = "";
    inputCanastas.setAttribute("max", nuevaDisponibilidad);
    inputCanastas.setAttribute("placeholder", `Máximo: ${nuevaDisponibilidad}`);
    
    // Actualizar totales
    updateTotales();
    limpiarInputs();

    // Resetear selección de proveedor
    loteProveedorSelect.selectedIndex = 0;

    console.log(`Registro creado: Lote=${loteProduccion}, Tipo=${tipo}, Lote Proveedor=${selectedProv.value}, Canastas=${canastas}`);
    console.log(`Disponibilidad restante: ${nuevaDisponibilidad}`);
    console.log("Estado del mapa:", Object.fromEntries(disponibilidadProveedores));
}

function eliminarFila(btn) {
    if (!btn) return;

    const fila = btn.closest("tr");
    const loteProveedor = fila.cells[1].textContent;
    const tipo = fila.cells[2].textContent;
    const canastasEliminadas = parseInt(fila.cells[3].textContent) || 0;
    
    // Obtener el lote_produccion de la fila
    const loteProdInput = fila.querySelector('input[name="lote_produccion[]"]');
    const loteProduccion = loteProdInput ? loteProdInput.value : null;
    
    // Obtener la key del input oculto
    const loteProvInput = fila.querySelector('input[name="lote_proveedor[]"]');
    const key = loteProvInput ? loteProvInput.dataset.key : null;

    // Restaurar disponibilidad en el select
    const selectProveedores = document.querySelector("#proveedores");
    const option = Array.from(selectProveedores.options).find(
        (opt) => opt.value === loteProveedor && 
                opt.dataset.tipo === tipo && 
                opt.dataset.lote_produccion === loteProduccion
    );

    if (option) {
        const disponibilidadActual = parseInt(option.dataset.canastas) || 0;
        const nuevaDisponibilidad = disponibilidadActual + canastasEliminadas;
        
        // Actualizar dataset y texto
        option.dataset.canastas = nuevaDisponibilidad;
        option.disabled = false;
        option.textContent = `${option.dataset.lote_proveedor} (Disponibles: ${nuevaDisponibilidad})`;
        
        // Actualizar mapa global
        if (key) {
            disponibilidadProveedores.set(key, nuevaDisponibilidad);
        }

        console.log(`Fila eliminada. Lote Proveedor: ${loteProveedor}, Tipo: ${tipo}, Canastas restauradas: ${canastasEliminadas}`);
        console.log(`Nueva disponibilidad: ${nuevaDisponibilidad}`);
    }

    // Eliminar fila
    fila.remove();
    updateTotales();
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
        const rechazoInput = fila.querySelector('input[name="rechazo[]"]');
        const migasInput = fila.querySelector('input[name="migas[]"]');

        if (canastasInput && cajasInput && rechazoInput && migasInput) {
            totalCanastas += parseInt(canastasInput.value) || 0;
            totalCajas += parseInt(cajasInput.value) || 0;
            totalRechazo += parseFloat(rechazoInput.value) || 0;
            totalMigas += parseFloat(migasInput.value) || 0;
        }
    });

    document.getElementById("totalCanastas").value = totalCanastas;
    document.getElementById("totalCajas").value = totalCajas;
    document.getElementById("totalRechazo").value = totalRechazo.toFixed(1);
    document.getElementById("totalMigas").value = totalMigas.toFixed(1);

    console.log(`TOTALES: ${totalCanastas} canastas, ${totalCajas} cajas`);
}

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

        const todosPresentes = Object.values(inputs).every(
            (input) => input !== null,
        );
        if (!todosPresentes) {
            console.warn(`Fila ${index} no tiene todos los inputs necesarios`);
            return;
        }

        // --- CORRECCIÓN: Guardar CADA FILA como un detalle individual ---
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
        };

        detalleArray.push(detalleItem);

        // Agrupar por lote_produccion + tipo para infoEmpaque (resumen)
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

        // Agrupar cajas por tipo
        const cajaKey = detalleItem.tipo;
        if (!cajasMap.has(cajaKey)) {
            cajasMap.set(cajaKey, {
                caja: detalleItem.tipo,
                cantidad: 0,
            });
        }

        const cajaActual = cajasMap.get(cajaKey);
        cajaActual.cantidad += detalleItem.cajas;
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
    detalle = detalleArray; // --- CORRECCIÓN: Guardar TODOS los detalles individuales ---

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

// --- MEJORA: Función limpiarInputs actualizada ---
function limpiarInputs() {
    const inputs = ["canastas", "cajas", "migas", "rechazo"];

    inputs.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = "";
            input.setAttribute("readonly", true);
            input.classList.remove("is-valid", "is-invalid");
        }
    });

    const inptCanastas = document.querySelector(`#canastas`);
    if (document.querySelector(`#proveedores`).selectedIndex > 0) {
        const selectedProv = document.querySelector(
            `#proveedores option:checked`,
        );
        const maxCanastas = parseInt(selectedProv?.dataset.canastas || 0);
        inptCanastas.setAttribute("max", maxCanastas);
        inptCanastas.setAttribute("placeholder", `Máximo: ${maxCanastas}`);
    } else {
        inptCanastas.setAttribute("max", "0");
        inptCanastas.setAttribute(
            "placeholder",
            "Seleccione proveedor primero",
        );
    }
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
        cajas.length === 0 ||
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
