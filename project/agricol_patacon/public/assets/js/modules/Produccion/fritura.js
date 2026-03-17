import {
    ApiService,
    AlertManager,
    Url,
    fechaHoy,
} from "../../helpers/ApiUseManager.js";

const apiFritura = new ApiService(Url + "/data/fritura");
const apiProveedores = new ApiService(Url + "/data/recepcion");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");
const apiReferencias = new ApiService(Url + "/data/referencias");

const alerts = new AlertManager();
const token = document.querySelector('meta[name="jwt"]').getAttribute("content");

// Variables Globales
const Global_data = {
    tipos: [],
    lotes: [],
    loteProveedores: [],
    producto: [],
};

let conteo = 0;
let tipos = {}; // Referencias Lista de Reerencias A, B, C, A, ETC..
let infoProveedores = [];

// Constantes para las claves de sessionStorage
const STORAGE_KEYS = {
    INFO_PROVEEDORES: "fritura_infoProveedores",
    GLOBAL_DATA: "fritura_globalData",
    TIPOS: "fritura_tipos",
    TABLES_DATA: "fritura_tablesData",
};

// Función para guardar en sessionStorage
function guardarEnSesion() {
    try {
        // Guardar infoProveedores
        sessionStorage.setItem(
            STORAGE_KEYS.INFO_PROVEEDORES,
            JSON.stringify(infoProveedores),
        );

        // Guardar Global_data
        sessionStorage.setItem(
            STORAGE_KEYS.GLOBAL_DATA,
            JSON.stringify(Global_data),
        );

        // Guardar tipos
        sessionStorage.setItem(STORAGE_KEYS.TIPOS, JSON.stringify(tipos));

        // Guardar datos de las tablas (filas agregadas)
        const tablesData = {};
        document.querySelectorAll('[id^="tablaInfo"]').forEach((table) => {
            const tableId = table.id;
            const rows = [];
            table.querySelectorAll("tbody tr").forEach((row) => {
                const rowData = {
                    lote: row.querySelector(".lote")?.value || "",
                    loteProveedor: row.querySelector(".lote")?.getAttribute("data-loteProveedor") || "",
                    tipo: row.querySelector(".tipo")?.value || "",
                    peso: row.querySelector(".peso")?.value || "",
                    canastillas: row.querySelector(".canastillas")?.value || "",
                    producto: row.querySelector(".lote")?.getAttribute("data-producto") || "",
                    id: row.querySelector(".lote")?.getAttribute("data-id") || "",
                    fecha: row.querySelector(".lote")?.getAttribute("data-fecha") || "",
                };
                rows.push(rowData);
            });
            if (rows.length > 0) {
                tablesData[tableId] = rows;
            }
        });
        sessionStorage.setItem(
            STORAGE_KEYS.TABLES_DATA,
            JSON.stringify(tablesData),
        );

        // Guardar valores de inputs de proceso (bajadas, migas, rechazo)
        const processData = {};
        document
            .querySelectorAll('[id^="contenedorVar"]')
            .forEach((container) => {
                const containerId = container.id;
                const inputs = {};
                container
                    .querySelectorAll('input[type="number"]')
                    .forEach((input) => {
                        if (input.id && input.value) {
                            inputs[input.id] = input.value;
                        }
                    });
                if (Object.keys(inputs).length > 0) {
                    processData[containerId] = inputs;
                }
            });
        sessionStorage.setItem(
            "fritura_processData",
            JSON.stringify(processData),
        );

        console.log("Datos guardados en sessionStorage");
    } catch (error) {
        console.error("Error guardando en sessionStorage:", error);
    }
}

// Función para cargar desde sessionStorage
function cargarDeSesion() {
    try {
        // Cargar infoProveedores
        const savedInfoProveedores = sessionStorage.getItem(
            STORAGE_KEYS.INFO_PROVEEDORES,
        );
        if (savedInfoProveedores) {
            infoProveedores = JSON.parse(savedInfoProveedores);
        }

        // Cargar Global_data
        const savedGlobalData = sessionStorage.getItem(
            STORAGE_KEYS.GLOBAL_DATA,
        );
        if (savedGlobalData) {
            Object.assign(Global_data, JSON.parse(savedGlobalData));
        }

        // Cargar tipos
        const savedTipos = sessionStorage.getItem(STORAGE_KEYS.TIPOS);
        if (savedTipos) {
            tipos = JSON.parse(savedTipos);
        }

        console.log("Datos cargados desde sessionStorage");
    } catch (error) {
        console.error("Error cargando desde sessionStorage:", error);
    }
}

// Función para restaurar las tablas desde sessionStorage
function restaurarTablas() {
    try {
        const tablesData = sessionStorage.getItem(STORAGE_KEYS.TABLES_DATA);
        if (!tablesData) return;

        const tables = JSON.parse(tablesData);

        Object.entries(tables).forEach(([tableId, rows]) => {
            const table = document.getElementById(tableId);
            if (!table) return;

            rows.forEach((rowData) => {
                const fila = `
                <tr>
                    <td>
                        ${rowData.loteProveedor}
                        <input type="hidden" min="0" name="lote_produccion[]" 
                            data-loteProveedor="${rowData.loteProveedor}" 
                            data-lote="${rowData.lote}" 
                            value="${rowData.lote}" 
                            data-producto="${rowData.producto}" 
                            data-id="${rowData.id}" 
                            data-fecha="${rowData.fecha}"
                            class="lote">
                    </td>
                    <td>
                        ${rowData.tipo}
                        <input type="hidden" name="tipo_fritura[]" 
                            value="${rowData.tipo}" 
                            data-id="${rowData.id}"
                            data-fecha="${rowData.fecha}"
                            class="tipo form-control">
                    </td>
                    <td>
                        ${rowData.peso}
                        <input type="hidden" min="0" step="0.1" name="peso_fritura[]" 
                            value="${rowData.peso}" 
                            data-id="${rowData.id}"
                            data-fecha="${rowData.fecha}"
                            class="peso numeric">
                    </td>
                    <td>
                        ${rowData.canastillas}
                        <input type="hidden" min="0" name="canastilla_fritura[]"
                            class="canastillas numeric" 
                            data-tipo="${rowData.tipo}" 
                            data-id="${rowData.id}"
                            data-fecha="${rowData.fecha}" 
                            value="${rowData.canastillas}">
                    </td>
                    <td style="text-align:center">
                        <button type="button" class="btn btn-danger btn-lg btn-Eliminar" 
                            id="btnEliminar${rowData.id}_${rowData.fecha.replace(/-/g, "_")}" 
                            data-id="${rowData.id}" 
                            data-fecha="${rowData.fecha}">
                            <i class="fa-solid fa-ban text-white fs-3"></i>
                        </button>
                    </td>
                </tr>
                `;

                table.insertAdjacentHTML("beforeend", fila);

                // Crear bloque de tipo si no existe
                const fechaSafe = rowData.fecha.replace(/-/g, "_");
                const containerVar = document.getElementById(
                    `contenedorVar${rowData.id}_${fechaSafe}`,
                );
                if (
                    containerVar &&
                    !document.getElementById(
                        `contenedor${rowData.tipo}_${fechaSafe}`,
                    )
                ) {
                    crearBloqueTipo(rowData.tipo, rowData.id, rowData.fecha);
                }
            });

            // Actualizar totales
            const match = tableId.match(/tablaInfo(\d+)_(.+)/);
            if (match) {
                const id = match[1];
                const fecha = match[2].replace(/_/g, "-");
                updateTotal(id, fecha);
            }
        });

        // Restaurar valores de proceso
        const processData = sessionStorage.getItem("fritura_processData");
        if (processData) {
            const inputs = JSON.parse(processData);
            Object.entries(inputs).forEach(([containerId, values]) => {
                Object.entries(values).forEach(([inputId, value]) => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = value;
                    }
                });
            });
        }

        console.log("Tablas restauradas desde sessionStorage");
    } catch (error) {
        console.error("Error restaurando tablas:", error);
    }
}

// Función para limpiar sessionStorage
// Función para limpiar sessionStorage
function limpiarSesion() {
    // Limpiar todas las claves específicas
    sessionStorage.removeItem(STORAGE_KEYS.INFO_PROVEEDORES);
    sessionStorage.removeItem(STORAGE_KEYS.GLOBAL_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.TIPOS);
    sessionStorage.removeItem(STORAGE_KEYS.TABLES_DATA);
    sessionStorage.removeItem("fritura_processData");
    
    // También limpiar cualquier otra clave que pueda haber quedado
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('fritura_')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    console.log("sessionStorage limpiado completamente");
}

const init = async () => {
    await encargo();
    await referencias();
    await empleado();
    await cargarProveedores();

    await obtenerRecepciones();

    // Cargar datos guardados
    cargarDeSesion();

    // Restaurar tablas después de que se hayan renderizado los proveedores
    setTimeout(() => {
        restaurarTablas();
    }, 500);
};

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches(".btn-Obtener")) {
            const id = e.target.dataset.id;
            const fecha = e.target.dataset.fecha;
            eventObtener(id, fecha);
        }
        if (e.target.matches(".btn-Eliminar")) {
            const id = e.target.dataset.id;
            const fecha = e.target.dataset.fecha;
            eventEliminar(e.target, id, fecha);
        }
        if (e.target.matches(".btn-Canastillas")) {
            const id = e.target.dataset.id;
            const fecha = e.target.dataset.fecha;
            eventAgregar(id, fecha);
        }
    });

    // Guardar en sesión antes de recargar la página
    window.addEventListener("beforeunload", function () {
        guardarEnSesion();
    });

    // Guardar cambios en inputs de proceso
    document.body.addEventListener("input", function (e) {
        if (
            e.target.matches(
                ".inputBajadas, .inputMigas, .inputRechazo, .numeric",
            )
        ) {
            guardarEnSesion();
        }
    });
});

const eventObtener = (id, fecha) => {
    if (!id || !fecha) return false;

    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Confirmar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerInfoProvedor(id, fecha);
        }
    });
};

const eventAgregar = (id, fecha) => {
    if (!id || !fecha) return;

    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se registrara la información, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Registrar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            agregarFila(id, fecha);
        }
    });
};

const eventEliminar = (btnEliminar, id, fecha) => {
    if (!id || !fecha) return;
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminara la casilla, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Eliminar casilla.",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarFila(btnEliminar, id, fecha);
            guardarEnSesion(); // Guardar después de eliminar
        }
    });
};

function validarCamposModal(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const valor = document.getElementById(id)?.value.trim();
        const input = document.getElementById(id);
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

function safeId(valor) {
    return String(valor)
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "_");
}

function generarLote(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const tipo = document.querySelector(`#referencias${id}_${fechaSafe}`,)?.value;
    const variedad = document.querySelector(`#variedad${id}_${fechaSafe}`,)?.value;

    if (!tipo || !variedad) {
        return false;
    }

    let lote = `${variedad}${tipo}${fechaHoy.replace(/-/g, "")}`;
    return lote;
}

function generarLoteProv(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const tipo = document.querySelector(`#referencias${id}_${fechaSafe}`,)?.value;
    const variedad = document.querySelector(`#variedad${id}_${fechaSafe}`,)?.value;
    const materiaProcesada = document.querySelector(`#materiaProcesada${id}_${fechaSafe}`,);

    if (!tipo || !variedad || !materiaProcesada) {
        return false;
    }

    const lote_recep = materiaProcesada.getAttribute("data-loteR");

    let lote = `${lote_recep}${variedad}${tipo}`;
    return lote;
}

function agregarFila(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");

    const lote = generarLote(id, fecha_procesamiento);
    const loteProveedor = generarLoteProv(id, fecha_procesamiento);
    const tipo = document.querySelector(`#referencias${id}_${fechaSafe}`,)?.value;
    const producto = document.querySelector(`#materiaProcesada${id}_${fechaSafe}`)?.getAttribute("data-producto");
    const canastillas = parseInt(document.querySelector(`#canastillas${id}_${fechaSafe}`)?.value,);
    const peso = parseFloat(document.querySelector(`#pesoKg${id}_${fechaSafe}`)?.value,);

    const campos = [
        `canastillas${id}_${fechaSafe}`,
        `pesoKg${id}_${fechaSafe}`,
        `referencias${id}_${fechaSafe}`,
    ];

    if (!validarCamposModal(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });
        return;
    }

    if (!canastillas || canastillas <= 0 || !peso || peso <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El Canastillas o Peso debe ser mayor a 0..",
        });
        return;
    }

    const fila = `
    <tr>
        <td>
            ${loteProveedor}
            <input type="hidden" min="0" name="lote_produccion[]" 
                data-loteProveedor="${loteProveedor}" 
                data-lote="${lote}" 
                value="${lote}" 
                data-producto="${producto}" 
                data-id="${id}" 
                data-fecha="${fecha_procesamiento}"
                class="lote">
        </td>
        <td>
            ${tipo}
            <input type="hidden" name="tipo_fritura[]" 
                value="${tipo}" 
                data-id="${id}"
                data-fecha="${fecha_procesamiento}"
                class="tipo form-control">
        </td>
        <td>
            ${peso}
            <input type="hidden" min="0" step="0.1" name="peso_fritura[]" 
                value="${peso}" 
                data-id="${id}"
                data-fecha="${fecha_procesamiento}"
                class="peso numeric">
        </td>
        <td>
            ${canastillas}
            <input type="hidden" min="0" name="canastilla_fritura[]"
                class="canastillas numeric" 
                data-tipo="${tipo}" 
                data-id="${id}"
                data-fecha="${fecha_procesamiento}" 
                value="${canastillas}">
        </td>
        <td style="text-align:center">
            <button type="button" class="btn btn-danger btn-lg btn-Eliminar" 
                id="btnEliminar${id}_${fechaSafe}" 
                data-id="${id}" 
                data-fecha="${fecha_procesamiento}">
                <i class="fa-solid fa-ban text-white fs-3"></i>
            </button>
        </td>
    </tr>
    `;

    document.getElementById(`tablaInfo${id}_${fechaSafe}`).insertAdjacentHTML("beforeend", fila);

    limpiarInputs(id, fecha_procesamiento);
    crearBloqueTipo(tipo, id, fecha_procesamiento);
    syncInputs(id, fecha_procesamiento);
    updateTotal(id, fecha_procesamiento);

    // Guardar en sesión después de agregar
    guardarEnSesion();
}

function crearBloqueTipo(tipo, id, fecha_procesamiento) {
    const tipoSafe = safeId(tipo);
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");

    const containerVar = document.getElementById(`contenedorVar${id}_${fechaSafe}`,);

    if (!containerVar) return;

    const container = containerVar.querySelector(`#contenedor${tipoSafe}_${fechaSafe}`,);

    if (container) {
        if (container.querySelectorAll(`#col_Total_${tipoSafe}_${fechaSafe}`))  return;
    }

    const divContenedor = document.createElement("div");
    divContenedor.className = "row d-flex justify-content-center mt-1";
    divContenedor.id = `contenedor${tipoSafe}_${fechaSafe}`;

    const div = document.createElement("div");
    div.className = "mb-3 col-6 col-md-3";
    div.id = `col_Total_${tipoSafe}_${fechaSafe}`;

    const h4 = document.createElement("h5");
    h4.className = "text-titles";
    h4.textContent = `Total - ${tipoSafe}.`;
    h4.setAttribute("data-tipo", `${tipoSafe}`);
    h4.setAttribute("data-fecha", `${fecha_procesamiento}`);

    const input = document.createElement("input");
    input.type = "number";
    input.className = "inputTotal form-control rounded-pill shadow-sm text-center text-dark fw-semibold numeric";
    input.placeholder = `Total: ${tipoSafe}`;
    input.id = `input_Total_${tipoSafe}_${fechaSafe}`;
    input.setAttribute("name", "cantidad[]");
    input.setAttribute("data-tipo", tipoSafe);
    input.setAttribute("data-fecha", fecha_procesamiento);
    input.setAttribute("readOnly", "true");
    input.setAttribute("min", "0");
    input.setAttribute("step", "0.1");

    div.appendChild(h4);
    div.appendChild(input);
    divContenedor.appendChild(div);

    // CREAMOS EL INPUT DE LAS Bajadas.
    const divBajada = document.createElement("div");
    divBajada.className = "mb-3 col-6 col-md-3";
    divBajada.id = `col_Bajada_${tipoSafe}_${fechaSafe}`;

    const h4Bajada = document.createElement("h5");
    h4Bajada.className = "text-titles";
    h4Bajada.textContent = `Bajadas - ${tipoSafe}.`;
    h4Bajada.setAttribute("data-tipo", `${tipoSafe}`);
    h4Bajada.setAttribute("data-fecha", `${fecha_procesamiento}`);

    const inputBajada = document.createElement("input");
    inputBajada.type = "number";
    inputBajada.className = "inputBajadas form-control rounded-pill shadow-sm text-center text-dark fw-semibold numeric";
    inputBajada.placeholder = `Bajadas: ${tipoSafe}`;
    inputBajada.id = `input_Bajadas_${tipoSafe}_${fechaSafe}`;
    inputBajada.setAttribute("name", "cantidad[]");
    inputBajada.setAttribute("data-tipo", `${tipoSafe}`);
    inputBajada.setAttribute("data-fecha", `${fecha_procesamiento}`);
    inputBajada.setAttribute("min", "0");
    inputBajada.setAttribute("step", "0.1");
    inputBajada.addEventListener("input", function () {
        updateTotal(id, fecha_procesamiento);
        guardarEnSesion();
    });

    divBajada.appendChild(h4Bajada);
    divBajada.appendChild(inputBajada);
    divContenedor.appendChild(divBajada);

    const inputPeso = document.createElement("input");
    inputPeso.type = "hidden";
    inputPeso.className = "inputKg form-control rounded-pill shadow-sm text-center text-dark fw-semibold numeric";
    inputPeso.id = `input_Kg_${tipoSafe}_${fechaSafe}`;
    inputPeso.setAttribute("name", "peso[]");
    inputPeso.setAttribute("data-tipo", `${tipoSafe}`);
    inputPeso.setAttribute("data-fecha", `${fecha_procesamiento}`);
    inputPeso.setAttribute("readOnly", "true");
    inputPeso.setAttribute("min", "0");

    // CREAMOS EL INPUT DE LAS Migas.
    const divMigas = document.createElement("div");
    divMigas.className = "mb-3 col-6 col-md-3";
    divMigas.id = `col_Migas_${tipoSafe}_${fechaSafe}`;

    const h4Migas = document.createElement("h5");
    h4Migas.className = "text-titles";
    h4Migas.textContent = `Migas - ${tipoSafe}.`;
    h4Migas.setAttribute("data-tipo", `${tipoSafe}`);
    h4Migas.setAttribute("data-fecha", `${fecha_procesamiento}`);

    const inputMigas = document.createElement("input");
    inputMigas.type = "number";
    inputMigas.placeholder = `Migas: ${tipoSafe}`;
    inputMigas.className = "inputMigas form-control rounded-pill shadow-sm text-center text-dark fw-semibold numeric";
    inputMigas.id = `input_Migas_${tipoSafe}_${fechaSafe}`;
    inputMigas.setAttribute("name", "mgias[]");
    inputMigas.setAttribute("data-tipo", `${tipoSafe}`);
    inputMigas.setAttribute("data-fecha", `${fecha_procesamiento}`);
    inputMigas.setAttribute("min", "0");
    inputMigas.addEventListener("input", guardarEnSesion);

    divMigas.appendChild(h4Migas);
    divMigas.appendChild(inputMigas);
    divMigas.appendChild(inputPeso);
    divContenedor.appendChild(divMigas);

    // CREAMOS EL INPUT DE LAS RECHAZO.
    const divRechazo = document.createElement("div");
    divRechazo.className = "mb-3 col-6 col-md-3";
    divRechazo.id = `col_Rechazo_${tipoSafe}_${fechaSafe}`;

    const h4Rechazo = document.createElement("h5");
    h4Rechazo.className = "text-titles";
    h4Rechazo.textContent = `Rechazo - ${tipoSafe}.`;
    h4Rechazo.setAttribute("data-tipo", `${tipoSafe}`);
    h4Rechazo.setAttribute("data-fecha", `${fecha_procesamiento}`);

    const inputRechazo = document.createElement("input");
    inputRechazo.type = "number";
    inputRechazo.className = "inputRechazo form-control rounded-pill shadow-sm text-center text-dark fw-semibold numeric";
    inputRechazo.placeholder = `Cantidad kg`;
    inputRechazo.id = `input_Rechazo_${tipoSafe}_${fechaSafe}`;
    inputRechazo.setAttribute("name", "rechazo[]");
    inputRechazo.setAttribute("data-tipo", `${tipoSafe}`);
    inputRechazo.setAttribute("data-fecha", `${fecha_procesamiento}`);
    inputRechazo.setAttribute("min", "0");
    inputRechazo.setAttribute("step", "0.1");
    inputRechazo.addEventListener("input", guardarEnSesion);

    divRechazo.appendChild(h4Rechazo);
    divRechazo.appendChild(inputRechazo);
    divContenedor.appendChild(divRechazo);

    containerVar.appendChild(divContenedor);
}

function syncInputs(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const tableRows = document.querySelectorAll(`#tablaInfo${id}_${fechaSafe} tbody tr`,);
    const tiposElegidos = [];

    if (tableRows.length > 0) {
        tableRows.forEach((row, index) => {
            const cells = row.cells;
            tiposElegidos[index] = cells[1].textContent.trim();
        });
    }

    const setElegidos = new Set(tiposElegidos);

    // Eliminar contenedores de tipos que ya no están en la tabla
    document.querySelectorAll(`#contenedorVar${id}_${fechaSafe} [id^="contenedor"]`)
        .forEach((container) => {
            const tipoEnContainer = container.id
                .replace(`contenedor`, "")
                .replace(`_${fechaSafe}`, "");
            if (!setElegidos.has(tipoEnContainer)) {
                container.remove();
            }
        });

    guardarEnSesion();
}

function validarProceso(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    let todosLlenos = true;

    const tableRows = document.querySelectorAll(`#tablaInfo${id}_${fechaSafe} tbody tr`,);

    const tiposElegidos = [];

    if (tableRows.length > 0) {
        tableRows.forEach((row) => {
            const cells = row.cells;
            tiposElegidos.push(cells[1].textContent.trim());
        });
    }

    const setElegidos = new Set(tiposElegidos);

    setElegidos.forEach((ref) => {
        const container = document.getElementById(`contenedor${ref}_${fechaSafe}`,);

        if (!container) return;

        const migas = container.querySelector(`#input_Migas_${ref}_${fechaSafe}`,);
        const rechazo = container.querySelector(`#input_Rechazo_${ref}_${fechaSafe}`,);
        const bajadas = container.querySelector(`#input_Bajadas_${ref}_${fechaSafe}`,);

        if (migas) {
            if (isNaN(parseFloat(migas.value))) {
                todosLlenos = false;
                migas.classList.add("is-invalid");
            } else {
                migas.classList.remove("is-invalid");
                migas.classList.add("is-valid");
            }
        }

        if (bajadas) {
            if (isNaN(parseFloat(bajadas.value))) {
                todosLlenos = false;
                bajadas.classList.add("is-invalid");
            } else {
                bajadas.classList.remove("is-invalid");
                bajadas.classList.add("is-valid");
            }
        }

        if (rechazo) {
            if (isNaN(parseFloat(rechazo.value))) {
                todosLlenos = false;
                rechazo.classList.add("is-invalid");
            } else {
                rechazo.classList.remove("is-invalid");
                rechazo.classList.add("is-valid");
            }
        }
    });

    return todosLlenos;
}

function variableProcesoProv(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    let migas = 0;
    let rechazo = 0;
    let bajadas = 0;

    const containerVar = document.getElementById(`contenedorVar${id}_${fechaSafe}`,);

    if (!containerVar) {
        return { migas, rechazo, bajadas };
    }

    const tableRows = document.querySelectorAll(`#tablaInfo${id}_${fechaSafe} tbody tr`,);

    const tiposElegidos = [];

    tableRows.forEach((row) => {
        const tipo = row.cells[1].textContent.trim();
        if (tipo) {
            tiposElegidos.push(tipo);
        }
    });

    const setElegidos = new Set(tiposElegidos);

    setElegidos.forEach((ref) => {
        const tipoSafe = safeId(ref);
        const container = containerVar.querySelector(`#contenedor${tipoSafe}_${fechaSafe}`,);

        if (container) {
            const inputMigas = container.querySelector(`#input_Migas_${tipoSafe}_${fechaSafe}`,);
            const inputRechazo = container.querySelector(`#input_Rechazo_${tipoSafe}_${fechaSafe}`,);
            const inputBajadas = container.querySelector(`#input_Bajadas_${tipoSafe}_${fechaSafe}`,);

            if (inputMigas) {
                migas += parseFloat(inputMigas.value) || 0;
            }
            if (inputRechazo) {
                rechazo += parseFloat(inputRechazo.value) || 0;
            }
            if (inputBajadas) {
                bajadas += parseFloat(inputBajadas.value) || 0;
            }
        }
    });

    return { migas, rechazo, bajadas };
}

function updateTotal(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const totalesPorTipo = {};
    const totalesPesoPorTipo = {};
    const valorRestarPorTipo = {};
    let totalCanastilllas = 0;
    let totalPeso = 0;

    if (!id) return false;

    const containerVar = document.getElementById(`contenedorVar${id}_${fechaSafe}`,);

    if (!containerVar) return false;

    document
        .querySelectorAll(`#tablaInfo${id}_${fechaSafe} tbody tr`)
        .forEach((fila) => {
            const tipo = fila.querySelector(".tipo")?.value;
            const valor = parseFloat(fila.querySelector(".canastillas")?.value) || 0;
            const valorPeso = parseFloat(fila.querySelector(".peso")?.value) || 0;

            if (tipo) {
                totalesPorTipo[tipo] = (totalesPorTipo[tipo] || 0) + valor;
                totalCanastilllas += valor;
                totalesPesoPorTipo[tipo] = (totalesPesoPorTipo[tipo] || 0) + valorPeso;
            }
        });

    // Actualizamos cada input de totales según su data-tipo
    for (const tipo in totalesPorTipo) {
        const container = containerVar.querySelector(`#contenedor${safeId(tipo)}_${fechaSafe}`,);

        if (!container) continue;

        const inputTotal = container.querySelector(`#input_Total_${safeId(tipo)}_${fechaSafe}`,);
        const inputBajadas = container.querySelector(`#input_Bajadas_${safeId(tipo)}_${fechaSafe}`,);

        if (inputTotal) {
            inputTotal.value = totalesPorTipo[tipo];

            const bajadasValue = parseFloat(inputBajadas?.value) || 0;
            const totalConBajadas = Math.max(0,totalesPorTipo[tipo] - bajadasValue,);

            inputTotal.value = totalConBajadas;

            valorRestarPorTipo[tipo] = totalConBajadas * 1.5;
        }
    }

    for (const tipo in totalesPesoPorTipo) {
        const container = containerVar.querySelector(`#contenedor${safeId(tipo)}_${fechaSafe}`,);

        if (!container) continue;

        const inputKg = container.querySelector(`#input_Kg_${safeId(tipo)}_${fechaSafe}`,);
        const inputBajadas = container.querySelector(`#input_Bajadas_${safeId(tipo)}_${fechaSafe}`,);

        if (inputKg) {
            const pesoOriginal = Number(totalesPesoPorTipo[tipo]);
            const factorRestar = valorRestarPorTipo[tipo] || 0;

            const bajadasValue = parseFloat(inputBajadas?.value) || 0;
            const pesoRestadoPorBajadas = bajadasValue * 1.5;

            const pesoFinal = pesoOriginal - factorRestar;
            inputKg.value = Math.max(0, pesoFinal).toFixed(1);

            totalPeso += parseFloat(inputKg.value);
        }
    }

    // Sumamos el total de canastillas
    const canastillasProd = document.querySelector(`#canastillasProd${id}_${fechaSafe}`,);
    const materiaProcesada = document.querySelector(`#materiaProcesada${id}_${fechaSafe}`,);

    if (canastillasProd) {
        canastillasProd.textContent = totalCanastilllas;
    }
    if (materiaProcesada) {
        materiaProcesada.textContent = `${totalPeso.toFixed(1)} Kg`;
    }

    updateProceso();
    guardarEnSesion();
}

function obtenerInfoProvedor(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");

    const camposObligatorios = [
        `tiempoInicio${id}_${fechaSafe}`,
        `tiempoFinal${id}_${fechaSafe}`,
        `tiempo${id}_${fechaSafe}`,
        `temperatura${id}_${fechaSafe}`,
    ];

    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "¡Error!",
            text: "Debe llenar toda la información del proveedor.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }

    if (!validarProceso(id, fecha_procesamiento)) {
        Swal.fire({
            title: "¡Error!",
            text: "Debe llenar la Información de Detalles de Fritura.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }

    const { migas, rechazo, bajadas } = variableProcesoProv(
        id,
        fecha_procesamiento,
    );

    const proveedorNombre = document.querySelector(`#proveedorNombre${id}_${fechaSafe}`,);
    const materiaProcesada = document.querySelector(`#materiaProcesada${id}_${fechaSafe}`,);
    const canastillasProd = document.querySelector(`#canastillasProd${id}_${fechaSafe}`,);
    const tiempoInicio = document.querySelector(`#tiempoInicio${id}_${fechaSafe}`,);
    const tiempoFinal = document.querySelector(`#tiempoFinal${id}_${fechaSafe}`,);
    const tiempo = document.querySelector(`#tiempo${id}_${fechaSafe}`);
    const temperatura = document.querySelector(`#temperatura${id}_${fechaSafe}`,);

    let dataProveedor = {
        proveedor: proveedorNombre?.textContent || "",
        info: {
            id_recepcion: materiaProcesada?.getAttribute("data-recepcion") || "",
            id_proveedor: id,
            fecha_procesamiento: fecha_procesamiento,
            canastas: parseInt(canastillasProd?.textContent.trim()) || 0,
            rechazo: parseFloat(rechazo) || 0,
            migas: parseFloat(migas) || 0,
            bajadas: parseFloat(bajadas) || 0,
            materia_kg: parseFloat(materiaProcesada?.textContent.trim()) || 0,
            inicio_fritura: tiempoInicio?.value || "",
            fin_fritura: tiempoFinal?.value || "",
            tiempo_fritura: tiempo?.value || "",
            temperatura_fritura: temperatura?.value || "",
        },
        detalle: [],
        variables: [],
    };

    const { detalles, variables } = obtenerDetaleProveeedor(
        id,
        fecha_procesamiento,
    );
    if (detalles) {
        dataProveedor.detalle = detalles;
        dataProveedor.variables = variables;
    }

    // Buscar si ya existe un registro para este id_recepcion y fecha
    const indiceExistente = infoProveedores.findIndex(
        (p) =>
            p.info.id_proveedor === id &&
            p.info.fecha_procesamiento === fecha_procesamiento,
    );

    if (indiceExistente !== -1) {
        infoProveedores[indiceExistente] = dataProveedor;
    } else {
        infoProveedores.push(dataProveedor);
    }

    // Guardar en sesión después de actualizar infoProveedores
    guardarEnSesion();

    let timerInterval;
    Swal.fire({
        title: "¡Procesando Información!",
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
            const modalId = `registroInfo${id}_${fechaSafe}`;
            $(`#${modalId}`).modal("hide");
        }
    });

    updateProceso();
    console.log(infoProveedores);
    return true;
}

function obtenerDetaleProveeedor(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const tiposElegidos = [];
    let lotes = [];
    let productoEligido = [];
    let lotesProveedor = [];
    let detalles = [];

    const filas = document.querySelectorAll(`#tablaInfo${id}_${fechaSafe} tbody tr`,);

    if (!filas || filas.length == 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No hay Información para registrar.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return { detalles: [], variables: [] };
    }

    filas.forEach((fila) => {
        const lote = fila.querySelector('input[name="lote_produccion[]"]');
        const loteProveedor = lote?.getAttribute("data-loteProveedor");
        const tipo = fila.querySelector('input[name="tipo_fritura[]"]');
        const peso = fila.querySelector('input[name="peso_fritura[]"]');
        const cantidad = fila.querySelector(
            'input[name="canastilla_fritura[]"]',
        );

        if (lote && cantidad && tipo && peso) {
            lotes.push(lote.value.trim());
            lotesProveedor.push(loteProveedor);
            tiposElegidos.push(tipo.value.trim());
            productoEligido.push(lote.getAttribute("data-producto"));

            detalles.push({
                lote_produccion: lote.value.trim(),
                lote_proveedor: loteProveedor,
                id_proveedor: id,
                fecha_procesamiento: fecha_procesamiento,
                tipo: tipo.value.trim(),
                peso: parseFloat(peso.value.trim()),
                canastas: parseFloat(cantidad.value.trim()),
            });
        }
    });

    const lotesEligidos = new Set(lotes);
    const lotesProveedorSet = new Set(lotesProveedor);
    const setElegidos = new Set(tiposElegidos);
    const producto = new Set(productoEligido);
    let lotesUnicos = Array.from(lotesEligidos);
    let lotesUnicosProveedor = Array.from(lotesProveedorSet);

    Global_data.lotes = Array.from(
        new Set([...Global_data.lotes.flat(), ...lotesUnicos]),
    );
    Global_data.loteProveedores = Array.from(
        new Set([
            ...Global_data.loteProveedores.flat(),
            ...lotesUnicosProveedor,
        ]),
    );
    Global_data.tipos = Array.from(
        new Set([...Global_data.tipos.flat(), ...Array.from(setElegidos)]),
    );
    Global_data.producto = Array.from(
        new Set([...Global_data.producto.flat(), ...Array.from(producto)]),
    );

    const containerVar = document.getElementById(
        `contenedorVar${id}_${fechaSafe}`,
    );
    if (!containerVar) return { detalles, variables: [] };

    const variables = [];
    let index = 0;

    setElegidos.forEach((tipo) => {
        const tipoSafe = safeId(tipo);
        const contenedor = containerVar.querySelector(`#contenedor${tipoSafe}_${fechaSafe}`,);

        if (!contenedor) return;

        const inputTotales = contenedor.querySelector(`#input_Total_${tipoSafe}_${fechaSafe}`,);
        const inputKg = contenedor.querySelector(`#input_Kg_${tipoSafe}_${fechaSafe}`,);
        const inputBajadas = contenedor.querySelector(`#input_Bajadas_${tipoSafe}_${fechaSafe}`,);
        const inputMigas = contenedor.querySelector(`#input_Migas_${tipoSafe}_${fechaSafe}`,);
        const inputRechazo = contenedor.querySelector(`#input_Rechazo_${tipoSafe}_${fechaSafe}`,);

        variables.push({
            lote_produccion: lotesUnicos[index] ?? "",
            lote_proveedor: lotesUnicosProveedor[index] ?? "",
            id_proveedor: id,
            fecha_procesamiento: fecha_procesamiento,
            tipo: tipo,
            canastas: inputTotales?.value.trim() || 0,
            cantidad_kg: parseFloat(inputKg?.value.trim() || 0).toFixed(1),
            bajadas: parseFloat(inputBajadas?.value.trim() || 0),
            migas: parseFloat(inputMigas?.value.trim() || 0),
            rechazo: parseFloat(inputRechazo?.value.trim() || 0),
        });
        index++;
    });

    return { detalles, variables };
}

function updateProceso() {
    let totalCanastas = 0;
    let totalKg = 0;
    let totalRechazo = 0;
    let totalMigas = 0;
    let totalBajadas = 0;

    let inputsTOTAL = document.querySelectorAll(".totalCanastas");
    let inputsMIGAS = document.querySelectorAll(".inputMigas");
    let inputsRECHAZO = document.querySelectorAll(".inputRechazo");
    let inputsBAJADAS = document.querySelectorAll(".inputBajadas");
    let inputsKG = document.querySelectorAll(".inputPatKg");

    inputsTOTAL.forEach((input) => {
        totalCanastas += parseInt(input.textContent.trim()) || 0;
    });

    inputsMIGAS.forEach((input) => {
        totalMigas += parseFloat(input.value.trim()) || 0;
    });

    inputsRECHAZO.forEach((input) => {
        totalRechazo += parseFloat(input.value.trim()) || 0;
    });

    inputsBAJADAS.forEach((input) => {
        totalBajadas += parseFloat(input.value.trim()) || 0;
    });

    inputsKG.forEach((input) => {
        totalKg += parseFloat(input.textContent.trim()) || 0;
    });

    const totalCanastillasInput = document.querySelector("#totalCanastillas");
    const totalMigasInput = document.querySelector("#totalMigas");
    const totalRechazoInput = document.querySelector("#totalRechazo");
    const totalBajadasInput = document.querySelector("#totalBajadas");
    const totalPataconInput = document.querySelector("#totalPatacon");

    if (totalCanastillasInput) totalCanastillasInput.value = totalCanastas || 0;
    if (totalMigasInput) totalMigasInput.value = totalMigas.toFixed(1) || 0;
    if (totalRechazoInput)
        totalRechazoInput.value = totalRechazo.toFixed(1) || 0;
    if (totalBajadasInput)
        totalBajadasInput.value = totalBajadas.toFixed(1) || 0;
    if (totalPataconInput) totalPataconInput.value = totalKg.toFixed(1) || 0;

    guardarEnSesion();
}

function limpiarInputs(id, fecha_procesamiento) {
    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const canastillasInput = document.querySelector(`input[id="canastillas${id}_${fechaSafe}"][data-id="${id}"]`,);
    const pesoKgInput = document.querySelector(`input[id="pesoKg${id}_${fechaSafe}"][data-id="${id}"]`,);

    if (canastillasInput) canastillasInput.value = "";
    if (pesoKgInput) pesoKgInput.value = "";
}

function eliminarFila(btn, id, fecha_procesamiento) {
    if (!btn) return;
    btn.closest("tr").remove();
    updateTotal(id, fecha_procesamiento);
    syncInputs(id, fecha_procesamiento);
    conteo--;
    guardarEnSesion(); // Guardar después de eliminar
}

function validarCamposForm(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const valor = document.getElementById(id)?.value.trim();
        const input = document.getElementById(id);
        if (!valor) {
            todosLlenos = false;
            if (input) input.classList.add("is-invalid");
        } else {
            if (input) {
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
            }
        }
    });
    return todosLlenos;
}


function obtenerLotes() {
    const lotesMap = new Map();

    document.querySelectorAll('[id^="tablaInfo"] tbody tr').forEach((fila) => {
        const loteInput = fila.querySelector(".lote");
        const tipoInput = fila.querySelector(".tipo");
        const canastillasInput = fila.querySelector(".canastillas");
        const pesoInput = fila.querySelector(".peso");

        if (loteInput && tipoInput && canastillasInput && pesoInput) {
            const lote = loteInput.value.trim();
            const tipo = tipoInput.value.trim();
            const canastillas = parseInt(canastillasInput.value.trim() || 0);
            const peso = parseFloat(pesoInput.value.trim() || 0);

            const key = `${lote}_${tipo}`;

            if (lotesMap.has(key)) {
                const existente = lotesMap.get(key);
                existente.canastas += canastillas;
                existente.cantidad_kg = (parseFloat(existente.cantidad_kg) + peso).toFixed(2);
            } else {
                lotesMap.set(key, {
                    lote_produccion: lote,
                    lote_proveedor: loteInput.getAttribute("data-loteProveedor") || "",
                    tipo: tipo,
                    canastas: canastillas,
                    cantidad_kg: peso.toFixed(2),
                });
            }
        }
    });

    const lotes = Array.from(lotesMap.values());
    console.log("lotes generados: ", lotes);
    return lotes;
}

async function enviarFormulario() {
    // Limpiar sesión ANTES de procesar el nuevo formulario
    limpiarSesion();

    const dataLotes = obtenerLotes();

    const camposObligatorios = [
        "aforo_aceite",
        "inventario_aceite",
        "lote_aceite",
        "nombreResponsable",
        "inicio_fritura",
        "fin_fritura",
        "gas_inicio",
        "gas_final",
        "totalCanastillas",
        "totalPatacon",
        "idEncargo",
    ];

    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "¡Error!",
            text: "Por favor, llene los campos Obligatorios antes de guardar el registro.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    if (!dataLotes || dataLotes.length == 0) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay Información de fritura para Guardar.",
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    const dataRecepciones = obtenerRecepciones();
    let fecha = fechaHoy;

    const idEncargo = document.getElementById("idEncargo");
    const loteAceite = document.getElementById("lote_aceite");
    const aforoAceite = document.getElementById("aforo_aceite");
    const inventarioAceite = document.getElementById("inventario_aceite");
    const inicioFritura = document.getElementById("inicio_fritura");
    const finFritura = document.getElementById("fin_fritura");
    const gasInicio = document.getElementById("gas_inicio");
    const gasFinal = document.getElementById("gas_final");
    const idResponsable = document.querySelector("#id_responsable");
    const totalCanastillas = document.getElementById("totalCanastillas");
    const totalRechazo = document.getElementById("totalRechazo");
    const totalBajadas = document.getElementById("totalBajadas");
    const totalPatacon = document.getElementById("totalPatacon");
    const totalMigas = document.getElementById("totalMigas");
    const observaciones = document.getElementById("Observaciones");

    const datos = {
        fecha: fecha,
        orden: idEncargo?.value || "",
        lote_aceite: loteAceite?.value || "",
        aforo_aceite: aforoAceite?.value || "",
        inventario_aceite: inventarioAceite?.value || "",
        inicio_fritura: inicioFritura?.value || "",
        fin_fritura: finFritura?.value || "",
        producto: Global_data.producto[0] || "",
        gas_inicio: parseInt(gasInicio?.value) || 0,
        gas_final: parseInt(gasFinal?.value) || 0,
        id_responsable: idResponsable?.value || "",
        canastillas: parseInt(totalCanastillas?.value) || 0,
        rechazo_fritura: parseFloat(totalRechazo?.value) || 0,
        bajadas_fritura: parseFloat(totalBajadas?.value) || 0,
        materia_fritura: parseFloat(totalPatacon?.value) || 0,
        migas_fritura: parseFloat(totalMigas?.value) || 0,
        observaciones: observaciones?.value || "No hay Observaciones",
        recepciones: dataRecepciones,
        infoProveedores,
        lotes: dataLotes,
    };

    console.log("los datos a enviar : ", datos);

    try {
        const respuesta = await apiFritura.post("/crear", datos, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        console.log("los datos recibidos : ", respuesta);

        if (respuesta.success) {
            // Limpiar sessionStorage después de enviar exitosamente
            limpiarSesion();

            // También limpiar las variables globales
            infoProveedores = [];
            Global_data.tipos = [];
            Global_data.lotes = [];
            Global_data.loteProveedores = [];
            Global_data.producto = [];
            tipos = {};

            alerts.show(respuesta);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            alerts.show(respuesta);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message,
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

function fillDatalist(datalist, data) {
    if (!datalist) return;
    datalist.innerHTML = "";
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nombre;
        option.dataset.id = item.id;
        datalist.appendChild(option);
    });
}

function handleInput(datalist, inputId, idFieldId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener("input", (e) => {
        const selectedOption = datalist.querySelector(
            `option[value="${e.target.value}"]`,
        );
        if (selectedOption) {
            const idField = document.getElementById(idFieldId);
            if (idField) {
                idField.value = selectedOption.dataset.id;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const btnGuardar = document.getElementById("btnGuardar");
    if (btnGuardar) {
        btnGuardar.addEventListener("click", function (e) {
            e.preventDefault();
            Swal.fire({
                title: "¿Estás seguro?",
                text: "¡Se enviara la información sin vuelta atrás!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#699c2fff",
                cancelButtonColor: "#f07b1cff",
                confirmButtonText: "Sí, Enviar información.",
                cancelButtonText: "Volver",
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarFormulario();
                }
            });
        });
    }
});

const encargo = async () => {
    try {
        const response = await apiEncargo.get("/leer", {
            headers: {
                Authorization: "Bearer " + token,
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
        const idEncargo = document.getElementById("idEncargo");
        if (idEncargo && configuracion && configuracion.length > 0) {
            idEncargo.value = configuracion[0].orden_actual;
        }
    } catch (error) {
        console.error("Error en encargo:", error);
    }
};

const empleado = async () => {
    try {
        const response = await apiEmpleados.get("/obtener-by-rol/Fritador", {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const fritadorList = document.getElementById("empleadolist");
        const { responsables } = response.data;
        if (fritadorList && responsables) {
            fillDatalist(fritadorList, responsables);
            handleInput(fritadorList, "nombreResponsable", "id_responsable");
        }
    } catch (error) {
        console.error("Error en empleado:", error);
    }
};

const rendereizarProveedores = (proveedores) => {
    const contenedor = document.querySelector("#contenedorProveedor");
    if (!contenedor) return false;

    // Limpiar contenedor antes de renderizar
    contenedor.innerHTML = "";

    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion";
    accordionContainer.id = "accordionProveedores";

    proveedores.forEach((item, index) => {
        const conteo = index + 1;
        const fechaSafe = item.fecha_procesamiento.replace(/-/g, "_");
        const modalId = `registroInfo${item.id_proveedor}_${fechaSafe}`;

        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";

        const accordionHeader = document.createElement("h2");
        accordionHeader.className = "accordion-header";
        accordionHeader.id = `heading${conteo}_${fechaSafe}`;

        const accordionButton = document.createElement("button");
        accordionButton.className = `accordion-button shadow-sm ${
            conteo === 1 ? "" : "collapsed"
        }`;
        accordionButton.type = "button";
        accordionButton.setAttribute("data-bs-toggle", "collapse");
        accordionButton.setAttribute(
            "data-bs-target",
            `#collapse${conteo}_${fechaSafe}`,
        );
        accordionButton.setAttribute(
            "aria-expanded",
            conteo === 1 ? "true" : "false",
        );
        accordionButton.setAttribute(
            "aria-controls",
            `collapse${conteo}_${fechaSafe}`,
        );
        accordionButton.innerHTML = `
            <div class="d-flex justify-content-between align-items-center w-100 pe-3">
                <span class="fw-semibold">
                    <span class="badge ms-2 rounded-pill" style="background-color: #6c780d;" 
                        data-loteR="${item.lote}" 
                        data-producto="${item.producto}">
                        ${conteo}
                    </span> 
                    ${item.proveedor} / ${item.fecha_procesamiento}
                </span>
                <span class="badge fs-6 ms-2 producto rounded-pill" style="background-color: #ec6704;">
                    ${item.producto}
                </span>
            </div>
        `;

        accordionHeader.appendChild(accordionButton);

        const accordionCollapse = document.createElement("div");
        accordionCollapse.id = `collapse${conteo}_${fechaSafe}`;
        accordionCollapse.className = `accordion-collapse collapse ${conteo === 1 ? "show" : ""}`;
        accordionCollapse.setAttribute(
            "aria-labelledby",
            `heading${conteo}_${fechaSafe}`,
        );
        accordionCollapse.setAttribute(
            "data-bs-parent",
            "#accordionProveedores",
        );

        const accordionBody = document.createElement("div");
        accordionBody.className = "accordion-body border-0";

        const row = document.createElement("div");
        row.className = "row g-3";

        const colBtn = document.createElement("div");
        colBtn.className = "col-12 col-md-6 col-lg-4";
        colBtn.innerHTML = `
            <label for="cantidad_${conteo}_kg" class="form-label fw-bold">Registrar Información</label>
            <button type="button" class="btn btn- w-100 shadow-sm fw-bold fs-5 text-white mt-4" 
                style="background-color: #6c780d;" 
                data-bs-toggle="modal" 
                data-recepcion="${item.id}" 
                data-loteR="${item.lote}" 
                data-bs-target="#${modalId}">
                <i class="fa-regular fa-clipboard fs-5"></i> Fritura
            </button>
        `;

        const colMateria = document.createElement("div");
        colMateria.className = "col-12 col-md-6 col-lg-4 text-center";
        colMateria.innerHTML = `
            <span class="badge fs-5 ms-2 fw-medium text-dark" style="background-color: #d2eaf1;">Materia Procesada</span>
            <p class="text-center mt-4 fw-bold fs-5 inputPatKg infoProveedor" 
                id="materiaProcesada${item.id_proveedor}_${fechaSafe}" 
                data-producto="${item.producto}" 
                data-id="${item.id_proveedor}" 
                data-recepcion="${item.id}" 
                data-loteR="${item.lote}" 
                data-fecha="${item.fecha_procesamiento}">
                0 Kg
            </p>
            <div class="border-bottom mb-3"></div>
        `;

        const colCanastillas = document.createElement("div");
        colCanastillas.className = "col-12 col-md-6 col-lg-4 text-center";
        colCanastillas.innerHTML = `
            <span class="badge fs-5 ms-2 fw-medium text-dark" style="background-color: #d2eaf1;">Canastillas</span>
            <p class="text-center mt-4 fw-bold fs-5 totalCanastas" 
                id="canastillasProd${item.id_proveedor}_${fechaSafe}" 
                data-id="${item.id_proveedor}" 
                data-recepcion="${item.id}" 
                data-loteR="${item.lote}" 
                data-fecha="${item.fecha_procesamiento}">
                0
            </p>
            <div class="border-bottom mb-3"></div>  
        `;

        const inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.value = item.id_proveedor;
        inputHidden.id = `id_proveedor_${conteo}_${fechaSafe}`;
        inputHidden.setAttribute("name", "id_proveedor[]");
        inputHidden.setAttribute("data-recepcion", `${item.id_proveedor}`);
        inputHidden.setAttribute("data-loteR", `${item.lote}`);
        inputHidden.setAttribute("data-fecha", `${item.fecha_procesamiento}`);

        createModal(
            item.proveedor,
            item.fecha_procesamiento,
            item.id_proveedor,
        );

        row.appendChild(colBtn);
        row.appendChild(colMateria);
        row.appendChild(colCanastillas);

        accordionBody.appendChild(row);
        accordionBody.appendChild(inputHidden);
        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);
        accordionContainer.appendChild(accordionItem);
    });

    contenedor.appendChild(accordionContainer);
};

// Variable global para guardar los arrays de ids
let idsRecepcionesGlobal = [];

async function cargarProveedores() {
    try {
        let ide = document.getElementById("idEncargo")?.value;
        if (!ide) return;

        const response = await apiProveedores.get(
            `/obtener-proveedor-recepcion-Day/${fechaHoy}/${ide}/Fritura`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!response.success) {
            alerts.show(response);
            setTimeout(() => {
                window.location.replace("/tablet/home");
            }, 3000);
            return;
        }

        const { proveedores } = response.data;
        
        // GUARDAR TODOS LOS IDs DE LOS ARRAYS "ids"
        idsRecepcionesGlobal = [];
        proveedores.forEach(proveedor => {
            if (proveedor.ids && Array.isArray(proveedor.ids)) {
                idsRecepcionesGlobal.push(...proveedor.ids);
            }
        });
        
        console.log("IDs de recepciones guardados:", idsRecepcionesGlobal);

        if (proveedores && proveedores.length > 0) {
            rendereizarProveedores(proveedores);
            referenciasList(tipos, proveedores);
        }
    } catch (error) {
        console.error("Error cargando proveedores:", error);
    }
}

function obtenerRecepciones() {
    // RETORNAR TODOS LOS IDs GUARDADOS
    return idsRecepcionesGlobal;
}

const referencias = async () => {
    try {
        const response = await apiReferencias.get("/obtener", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { referencias: referenciasData } = response.data;
        tipos = referenciasData || {};
        return tipos;
    } catch (error) {
        console.error("Error cargando referencias:", error);
        return false;
    }
};

const referenciasList = (referencias, proveedores) => {
    if (!referencias || !proveedores) return;

    proveedores.forEach((proveedor) => {
        const fechaSafe = proveedor.fecha_procesamiento.replace(/-/g, "_");
        const selectId = `referencias${proveedor.id_proveedor}_${fechaSafe}`;
        let selectReferencias = document.querySelector(`#${selectId}`);

        if (!selectReferencias) {
            selectReferencias = document.querySelector(`#referencias${proveedor.id_proveedor}`,);
        }

        if (selectReferencias) {
            selectReferencias.innerHTML =
                '<option value="">-- Seleccionar --</option>';

            Object.values(referencias).forEach((ref) => {
                const option = document.createElement("option");
                option.value = ref.Nombre || ref;
                option.dataset.id = ref.id || "";
                option.textContent = ref.Nombre || ref;
                selectReferencias.appendChild(option);
            });
        }
    });
};

const createModal = (proveedor, fecha_procesamiento, id) => {
    const contenedor = document.querySelector("#contenedorModals");
    if (!contenedor) {
        console.warn("No existe el contenedor");
        return false;
    }

    const fechaSafe = fecha_procesamiento.replace(/-/g, "_");
    const modalId = `registroInfo${id}_${fechaSafe}`;

    if (document.getElementById(modalId)) {
        return false;
    }

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = `
    <div class="modal fade" id="${modalId}" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 modal-dialog-scrollable shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #6c780d;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0" style="font-family: Arial, Helvetica, sans-serif">REGISTRO DE
                        INFORMACIÓN FRITURA -  <span class="badge text-white fs-5 p-2 fw-bold" style="background-color: #ec6704 ;">${proveedor.toUpperCase()} / ${fecha_procesamiento}</span>   </h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">

                <nav>
                    <div class="nav nav-tabs justify-content-end" id="myTab${id}_${fechaSafe}" role="tablist">
                        <button class="nav-link show active" id="tiempo-tab${id}_${fechaSafe}" data-bs-toggle="tab"
                                data-bs-target="#tiempo-tab-pane${id}_${fechaSafe}" type="button" role="tab" 
                                aria-controls="tiempo-tab-pane${id}_${fechaSafe}" aria-selected="true"> Tiempos
                        </button>
                        <button class="nav-link" id="fritura-tab${id}_${fechaSafe}" data-bs-toggle="tab"
                            data-bs-target="#fritura-tab-pane${id}_${fechaSafe}" type="button" role="tab"
                            aria-controls="fritura-tab-pane${id}_${fechaSafe}" aria-selected="false">Fritura
                        </button>
                        <button class="nav-link" id="variable-tab${id}_${fechaSafe}" data-bs-toggle="tab"
                            data-bs-target="#variable-tab-pane${id}_${fechaSafe}" type="button" role="tab"
                            aria-controls="variable-tab-pane${id}_${fechaSafe}" aria-selected="false">Proceso
                        </button>
                    </div>
                </nav>

                <div class="tab-content" id="myTabContent${id}_${fechaSafe}">
                    <div class="tab-pane fade" id="fritura-tab-pane${id}_${fechaSafe}" role="tabpanel" 
                        aria-labelledby="fritura-tab${id}_${fechaSafe}" tabindex="0">
                        <div class="row mt-1 d-flex justify-content-center p-2">
                            <div class="row text-center mt-1 p-2">
                                <div class="col">
                                    <h3 class="fw-semibold text-uppercase" style="color:#24243c;">
                                        <i class="fa-solid fa-fire me-2" style="color:#ec6704;"></i> INFORMACIÓN DE PROCESO FRITURA
                                    </h3>
                                    <div class="border-bottom mb-3"></div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-between p-3 mt-4">
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Variedad
                                    </h5>
                                    <select class="variedad form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                        id="variedad${id}_${fechaSafe}">
                                        <option value="">-- Seleccionar --</option>
                                        <option value="C">Comino</option>
                                        <option value="H">Harton</option>
                                        <option value="HW">Hawaiano</option>
                                    </select>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Tipo
                                    </h5>
                                    <select class="tipo form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                        id="referencias${id}_${fechaSafe}">
                                        <option value="">-- Seleccionar --</option>
                                    </select>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                        <i class="fa-solid fa-table-cells me-2" style="color:#ec6704;"></i>
                                        Canastillas
                                    </h5>
                                    <input type="number"
                                        class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric" 
                                        min="0"
                                        placeholder="# Canastillas" 
                                        id="canastillas${id}_${fechaSafe}" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-scale-unbalanced-flip me-2" style="color:#ec6704;"></i> Peso
                                    </h5>
                                    <input type="number"
                                        class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric" 
                                        min="0"
                                        placeholder="Peso Patacón Kg" 
                                        id="pesoKg${id}_${fechaSafe}" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <button type="button" 
                                        class="btn fs-6 shadow-lg fw-semibold text-white mt-5 p-2 btn-Canastillas"
                                        style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c;" 
                                        id="btnRegistrarFritura${id}_${fechaSafe}" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}">
                                        <i class="fa-solid fa-circle-check me-1"></i> REGISTRAR 
                                    </button>
                                </div>
                            </div>
                            <div class="row mt-1 p-1">
                                <div class="col-12">
                                    <div class="card-body">
                                        <div class="card-body table-responsive">
                                            <table class="table tabla-personalized p-3"
                                                id="tablaInfo${id}_${fechaSafe}">
                                                <thead>
                                                    <tr>
                                                        <th class="A text-center;">LOTE</th>
                                                        <th class="M text-center;">TIPO</th>
                                                        <th class="M text-center;">PESO</th>
                                                        <th class="M text-center;">CANASTILLAS</th>
                                                        <th style="text-align: center;">ACCION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade mb-3" id="variable-tab-pane${id}_${fechaSafe}" role="tabpanel" 
                        aria-labelledby="variable-tab${id}_${fechaSafe}" tabindex="0">
                        <div class="row mt-1 d-flex justify-content-center p-2">
                            <div class="row text-center mt-1 p-2">
                                <div class="col">
                                    <h3 class="fw-semibold text-uppercase" style="color:#24243c;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> INFORMACIÓN DETALLES DE PROCESO
                                    </h3>
                                    <div class="border-bottom mb-3"></div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-center mt-2 p-3" id="contenedorVar${id}_${fechaSafe}">
                            </div>
                            <input type="hidden"
                                class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" 
                                min="0"
                                placeholder="" 
                                id="rechazo${id}_${fechaSafe}" 
                                data-id="${id}" 
                                data-fecha="${fecha_procesamiento}" 
                                required>
                            <input type="hidden"
                                class="form-control rounded shadow-sm fs-5 text-center numeric" 
                                min="0"
                                placeholder="P" 
                                id="migas${id}_${fechaSafe}" 
                                data-id="${id}" 
                                data-fecha="${fecha_procesamiento}" 
                                required>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade active show" id="tiempo-tab-pane${id}_${fechaSafe}" role="tabpanel" 
                        aria-labelledby="tiempo-tab${id}_${fechaSafe}" tabindex="0">
                        <div class="row mt-1 justify-content-center">
                            <div class="row text-center mt-1 p-3">
                                <div class="col">
                                    <h3 class="fw-semibold text-uppercase" style="color:#24243c;">
                                        <i class="fa-solid fa-stopwatch me-2" style="color:#ec6704;"></i> INFORMACIÓN DE TIEMPO DE FRITURA
                                    </h3>
                                    <div class="border-bottom mb-3"></div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-between mt-1 p-3">
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-2 mb-3"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                        <i class="fa-solid fa-clock me-2" style="color:#ec6704;"></i>
                                        Inicio Fritura
                                    </h5>
                                    <input type="time"
                                        class="form-control form-contro-lg rounded shadow-sm fs-5 text-center" 
                                        placeholder="Tiempo Fritura" 
                                        id="tiempoInicio${id}_${fechaSafe}" 
                                        name="tiempoInicio[]" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-2 mb-3"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                        <i class="fa-solid fa-clock me-2" style="color:#ec6704;"></i> 
                                        Final Fritura
                                    </h5>
                                    <input type="time"
                                        class="form-control form-contro-lg rounded shadow-sm fs-5 text-center" 
                                        placeholder="Tiempo Fritura" 
                                        id="tiempoFinal${id}_${fechaSafe}" 
                                        name="tiempoFinal[]" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-between mt-4 p-3">
                                <div class="col-3">
                                    <h5 class="fw-semibold text-uppercase mt-2"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                        <i class="fa-solid fa-user me-2" style="color:#ec6704;"></i>
                                        Proveedor
                                    </h5>
                                    <p class="proveedor mt-2 text-justify p-2 fs-5 fw-semibold" 
                                        id="proveedorNombre${id}_${fechaSafe}" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}">
                                        ${proveedor.toUpperCase()}
                                    </p>
                                    <div class="border-bottom"></div>
                                </div>
                                <div class="col-3">
                                    <h5 class="fw-semibold text-uppercase mt-2"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                        <i class="fa-solid fa-clock-rotate-left me-2" style="color:#ec6704;"></i> 
                                        Tiempo FRITURA
                                    </h5>
                                    <input type="number" 
                                        class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" 
                                        min="0"
                                        step="0.1" 
                                        placeholder="Tiempo Friura" 
                                        id="tiempo${id}_${fechaSafe}" 
                                        name="tiempo[]" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col-3">
                                    <h5 class="fw-semibold text-uppercase mt-2"
                                        style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                        <i class="fa-solid fa-temperature-high me-2" style="color:#ec6704;"></i>
                                        Temperatura
                                    </h5>
                                    <input type="number"
                                        class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" 
                                        min="0"
                                        step="0.1" 
                                        placeholder="Temperatura °" 
                                        id="temperatura${id}_${fechaSafe}" 
                                        name="temperatura[]" 
                                        data-id="${id}" 
                                        data-fecha="${fecha_procesamiento}" 
                                        required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-lg p-3 px-4 fs-3 btn-danger text-white" 
                    data-bs-dismiss="modal" 
                    id="btnCloseModal${id}_${fechaSafe}" 
                    data-id="${id}" 
                    data-fecha="${fecha_procesamiento}">
                    <i class="fa-solid fa-xmark fs-4"></i>
                </button>
                <button type="button" 
                    class="btn btn-lg p-3 px-4 fs-3 text-white btn-Obtener" 
                    style="background-color: #6c780d;" 
                    id="btnObtenerCanastillas${id}_${fechaSafe}" 
                    data-id="${id}" 
                    data-fecha="${fecha_procesamiento}">
                    <i class="fa-solid fa-circle-check fs-4 btn-Obtener"></i>
                </button>
            </div>
        </div>
    </div>
    `;

    contenedor.appendChild(modalDiv.firstElementChild);
};

let x = Url.replace("http:", "");

const socket = new WebSocket("ws:" + x);

socket.onmessage = (event) => {
    try {
        const msg = JSON.parse(event.data);
        if (msg.type === "nuevoProveedor") {
            cargarProveedores();
        }
        if (msg.type === "cambioOrden") {
            console.log("Orden de encargo cambiada, actualizando...");
            encargo();
        }
    } catch (error) {
        console.error("Error en mensaje WebSocket:", error);
    }
};

socket.onerror = (error) => {
    console.error("Error en WebSocket:", error);
};

setTimeout(() => {
    init();
}, 1000);
