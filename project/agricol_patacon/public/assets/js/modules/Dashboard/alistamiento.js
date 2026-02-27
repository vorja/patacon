import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_ALISTAMIENTO = new ApiService(Url + "/data/alistamiento");
const API_PRODUCCION = new ApiService(Url + "/data/produccion");

const alerts = new AlertManager();

const elementsAlistamiento = {
    inputFechaInfo: document.querySelector("#fecha_info"),
    inputSearch: document.getElementById("inputSearch"),
    inputMaduroInfo: document.querySelector("#maduro_info"),
    inputTotalInfo: document.querySelector("#total_info"),
    inputRechazoInfo: document.querySelector("#rechazo_info"),
};

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Store event listeners separately
let tableEventListeners = [];

// Helper para manejar DataTables
const DataTableManager = {
    instances: {},

    initOrUpdate(tableId, config) {
        const selector = `#${tableId}`;
        const table = $(selector);

        // Guardar el thead original antes de destruir
        const thead = table.find("thead").clone();

        // Destruir si ya existe
        if ($.fn.DataTable.isDataTable(selector)) {
            try {
                table.DataTable().destroy();
                // Mantener solo el tbody vacío
                table.children("tbody").remove();
                table.append("<tbody></tbody>");
                // Restaurar el thead
                if (thead.length) {
                    table.prepend(thead);
                }
            } catch (error) {
                console.warn(`Error destruyendo tabla ${tableId}:`, error);
            }
        }

        // Crear nueva instancia con destroy:true
        config.destroy = true;
        config.retrieve = true;
        this.instances[tableId] = table.DataTable(config);
        return this.instances[tableId];
    },

    // Método para actualizar solo los datos sin recrear toda la tabla
    updateData(tableId, data) {
        const selector = `#${tableId}`;
        if ($.fn.DataTable.isDataTable(selector)) {
            const table = $(selector).DataTable();
            table.clear();
            table.rows.add(data);
            table.draw();
            return true;
        }
        return false;
    },

    destroy(tableId) {
        const selector = `#${tableId}`;
        if ($.fn.DataTable.isDataTable(selector)) {
            try {
                // Guardar el thead original
                const table = $(selector);
                const thead = table.find("thead").clone();

                $(selector).DataTable().destroy();

                // Restaurar estructura básica
                table.empty();
                if (thead.length) {
                    table.append(thead);
                }
                table.append("<tbody></tbody>");
            } catch (error) {
                console.warn(`Error destruyendo tabla ${tableId}:`, error);
            }
        }
        delete this.instances[tableId];
    },

    destroyAll() {
        // Para tablas críticas, mantener el thead
        const criticalTables = ["tablaAlistamiento", "tablaInfoPersonal"];

        criticalTables.forEach((tableId) => {
            const selector = `#${tableId}`;
            if ($.fn.DataTable.isDataTable(selector)) {
                try {
                    const table = $(selector);
                    const thead = table.find("thead").clone();

                    table.DataTable().destroy();

                    // Restaurar estructura con thead
                    table.empty();
                    if (thead.length) {
                        table.append(thead);
                    }
                    table.append("<tbody></tbody>");
                } catch (error) {
                    console.warn(`Error destruyendo tabla ${tableId}:`, error);
                }
            }
        });

        this.instances = {};
    },
};

async function init() {
    try {
        // Verificar dependencias
        if (typeof jQuery === "undefined") {
            throw new Error("jQuery no está cargado");
        }
        if (!$.fn.DataTable) {
            throw new Error("DataTables no está cargado");
        }

        // Inicializar estructura de tablas sin datos
        inicializarEstructuraTablas();
        setupEventListeners();
    } catch (error) {
        console.error("Error al inicializar:", error);
        Swal.fire({
            icon: "error",
            title: "Error de Inicialización",
            text: "No se pudo cargar la aplicación correctamente.",
        });
    }
}

function inicializarEstructuraTablas() {
    // Asegurar que las tablas críticas tengan su estructura HTML
    const tablasCriticas = {
        tablaAlistamiento: `
            <thead>
                <tr>
                    <th scope="col" class="I text-center">Fecha Produccion</th>
                    <th scope="col" class="I text-center">Maduro</th>
                    <th scope="col" class="I text-center">Rechazo</th>
                    <th scope="col" class="I text-center">Desinfectados</th>
                    <th scope="col" class="I text-center">Canastillas</th>
                    <th scope="col" class="M text-center">Accion</th>
                </tr>
            </thead>
            <tbody></tbody>
        `,
        tablaInfoPersonal: `
            <thead>
                <tr>
                    <th scope="col" class="I text-center"><i class="fa-solid fa-hashtag"></i> Pelador</th>
                    <th scope="col" class="I text-center"><i class="fa-solid fa-circle-user"></i> Promedio</th>
                    <th scope="col" class="I text-center"><i class="fa-solid fa-location-dot"></i> Total</th>
                </tr>
            </thead>
            <tbody></tbody>
        `,
    };

    Object.keys(tablasCriticas).forEach((tableId) => {
        const table = document.getElementById(tableId);
        if (table && !table.querySelector("thead")) {
            table.innerHTML = tablasCriticas[tableId];
        }
    });
}

function setupEventListeners() {
    // Input search
    const inputSearch = elementsAlistamiento.inputSearch;
    if (inputSearch) {
        // Remove existing listener first
        inputSearch.removeEventListener("input", buscarOrdenes);
        inputSearch.addEventListener("input", debounce(buscarOrdenes, 300));
    } else {
        console.warn("Input de búsqueda de contenedores no encontrado");
    }

    // Suggestions container
    const suggestionsContainer = document.getElementById("suggestions");
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener("click", handleSuggestionClick);
    }
}

// Simple debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSuggestionClick(e) {
    if (!e.target.classList.contains("suggestion-item")) return;

    const suggestionItem = e.target;
    const ordenId = suggestionItem.dataset.id;
    const ordenLote = suggestionItem.textContent;

    elementsAlistamiento.inputSearch.value = ordenLote;
    elementsAlistamiento.inputSearch.setAttribute("data-id", ordenId);
    await cargarAlistamientos(ordenId);
    // Limpiar sugerencias
    document.getElementById("suggestions").innerHTML = "";
}

function renderSuggestions(resultados, container, tipo) {
    const fragment = document.createDocumentFragment();
    const maxResults = 10;
    const limited = resultados.slice(0, maxResults);

    if (tipo === "C") {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Lote;
            div.dataset.id = orden.id;
            div.dataset.tipo = tipo;
            fragment.appendChild(div);
        });
    } else {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Lote;
            div.dataset.id = orden.id;
            div.dataset.tipo = tipo;
            fragment.appendChild(div);
        });
    }

    container.innerHTML = "";
    container.appendChild(fragment);

    // Mostrar cantidad de resultados adicionales
    if (resultados.length > maxResults) {
        const moreDiv = document.createElement("div");
        moreDiv.classList.add("suggestion-more");
        moreDiv.textContent = `+${resultados.length - maxResults} resultados más...`;
        container.appendChild(moreDiv);
    }
}

export function cleanup() {
    // Clear table event listeners
    clearTableEventListeners();

    // Clear input listeners
    const inputSearch = elementsAlistamiento.inputSearch;
    if (inputSearch) {
        inputSearch.removeEventListener("input", buscarOrdenes);
    }

    // Clear suggestions listener
    const suggestionsContainer = document.getElementById("suggestions");
    if (suggestionsContainer) {
        suggestionsContainer.removeEventListener(
            "click",
            handleSuggestionClick,
        );
    }

    // Limpiar DataTables pero mantener estructura
    DataTableManager.destroyAll();
}

function clearTableEventListeners() {
    // Remove all table event listeners
    tableEventListeners.forEach((listener) => {
        if (listener.table && listener.type && listener.handler) {
            listener.table.removeEventListener(listener.type, listener.handler);
        }
    });
    tableEventListeners = [];
}

export function reloadEventListeners() {
    cleanup();
    setupEventListeners();
}

async function cargarAlistamientos(idOrden) {
    try {
        const response = await API_ALISTAMIENTO.get(
            `/obtener-by-Order/${idOrden}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!response.success) {
            alerts.show(response);
            throw new Error("No hay Información disponible.");
        }

        const { alistamientos, promedioPelador, promedios } = response.data;

        asignarPromedio(promedios);
        cargarInfoPersonal(promedioPelador);

        // Asegurar que la tabla tenga su estructura
        const table = document.getElementById("tablaAlistamiento");
        if (!table.querySelector("thead")) {
            table.innerHTML = `
                <thead>
                    <tr>
                        <th scope="col" class="I text-center">Fecha Produccion</th>
                        <th scope="col" class="I text-center">Maduro</th>
                        <th scope="col" class="I text-center">Rechazo</th>
                        <th scope="col" class="I text-center">Desinfectados</th>
                        <th scope="col" class="I text-center">Canastillas</th>
                        <th scope="col" class="M text-center">Accion</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
        }

        // Clear previous event listeners
        clearTableEventListeners();

        // Intentar actualizar datos si la tabla ya existe
        const dataUpdated = DataTableManager.updateData(
            "tablaAlistamiento",
            alistamientos,
        );

        if (!dataUpdated) {
            // Si no se pudo actualizar, crear nueva instancia
            DataTableManager.initOrUpdate("tablaAlistamiento", {
                data: alistamientos,
                searching: true,
                serverSide: false,
                responsive: true,
                deferRender: true,
                dom: "Bfrtip",
                columns: [
                    { data: "Fecha" },
                    { data: "Maduro" },
                    { data: "Rechazo" },
                    { data: "Desinfectados" },
                    { data: "Total" },
                    {
                        data: null,
                        render: (data, type, row) => `
                            <div class="btn-group dropend">
                                <button type="button" class="btn btn-light btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
                                data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu shadow-sm border-0 rounded-3">
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}" data-fecha="${row.Fecha}">
                                            <i class="fas fa-circle-info text-info me-2"></i> Información
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center pdf-btn" data-id="${row.id}" data-fecha="${row.Fecha}">
                                            <i class="fas fa-file-export text-danger me-2"></i> Exportar
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        `,
                    },
                ],
                initComplete: function () {
                    const api = this.api();
                    const $header = $(api.table().header());
                    api.columns().every(function (colIdx) {
                        const column = this;
                        const $thFilter = $header
                            .find("tr:eq(1) th")
                            .eq(colIdx);

                        const $input = $thFilter.find("input");
                        if ($input.length) {
                            $input
                                .off("keyup change")
                                .on("keyup change", function () {
                                    const val = this.value;
                                    if (column.search() !== val) {
                                        column.search(val).draw();
                                    }
                                });
                        }

                        const $select = $thFilter.find("select");
                        if ($select.length) {
                            const uniques = column.data().unique().sort();
                            $select
                                .empty()
                                .append('<option value="">Todos</option>');
                            uniques.each(function (d) {
                                if (d !== null && d !== undefined && d !== "") {
                                    $select.append(
                                        `<option value="${d}">${d}</option>`,
                                    );
                                }
                            });

                            $select.off("change").on("change", function () {
                                const val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val(),
                                );
                                column
                                    .search(val ? `^${val}$` : "", true, false)
                                    .draw();
                            });
                        }
                    });
                },
                drawCallback: function () {
                    let api = this.api();
                    let numRegistros = api.rows({ filter: "applied" }).count();
                    let tableWrapper = $(api.table().container());
                    if (numRegistros <= 20) {
                        tableWrapper.find(".dataTables_paginate").hide();
                    } else {
                        tableWrapper.find(".dataTables_paginate").show();
                    }
                },
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                    emptyTable: "No hay datos disponibles en la tabla",
                },
            });
        }

        $("#carousel-item1").removeClass("active");
        $("#carousel-item2").addClass("active");

        // Set up new event listeners for the table
        setupTableListeners();
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1900,
        });
    }
}

function setupTableListeners() {
    const table = document.getElementById("tablaAlistamiento");
    if (!table) return;

    // Clear any existing listeners first
    clearTableEventListeners();

    // Add event listener for the entire table using event delegation
    const handleTableClick = async (e) => {
        // Check if the click is on an info button
        const infoBtn = e.target.closest(".info-btn");
        if (infoBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = infoBtn.dataset.id;
            console.log("Info button clicked for ID:", id);
            await infoAlistamiento(id);
            return;
        }

        // Check if the click is on a pdf button
        const pdfBtn = e.target.closest(".pdf-btn");
        if (pdfBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = pdfBtn.dataset.id;
            console.log("PDF button clicked for ID:", id);
            await generarPDF(id);
            return;
        }
    };

    // Add the event listener
    table.addEventListener("click", handleTableClick);

    // Store the listener for cleanup
    tableEventListeners.push({
        table: table,
        type: "click",
        handler: handleTableClick,
    });

    console.log("Table event listeners set up");
}

async function infoAlistamiento(id) {
    try {
        console.log("Opening info modal for ID:", id);
        limpiarTable();
        await cargarInfoProveedores(id);
        $("#ModalInfoAlistamiento").modal("show");
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1800,
        });
    }
}

async function cargarInfoProveedores(id) {
    try {
        console.log("Loading provider info for ID:", id);
        const res = await API_ALISTAMIENTO.get(`/obtener-detalle/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        const response = await API_ALISTAMIENTO.get(`/obtener-by-Id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return;
        }
        if (!response.success) {
            alerts.show(response);
            return;
        }
        const { resultado } = res.data;
        const { proveedores, registro } = response.data;

        elementsAlistamiento.inputFechaInfo.value = `${registro.fecha}`;
        elementsAlistamiento.inputMaduroInfo.value = `${registro.maduro} Kg`;
        elementsAlistamiento.inputRechazoInfo.value = `${registro.rechazo} Kg`;
        elementsAlistamiento.inputTotalInfo.value = registro.total;

        // Cerrar todos los collapses al cargar nuevos datos
        document.querySelectorAll(".collapse").forEach((collapse) => {
            $(collapse).collapse("hide");
        });

        // Para tablas en modales, podemos destruir y recrear completamente
        if ($.fn.DataTable.isDataTable("#tablaProveedores")) {
            $("#tablaProveedores").DataTable().destroy();
        }
        if ($.fn.DataTable.isDataTable("#tablaObservaciones")) {
            $("#tablaObservaciones").DataTable().destroy();
        }
        if ($.fn.DataTable.isDataTable("#tablaInfoAlistamiento")) {
            $("#tablaInfoAlistamiento").DataTable().destroy();
        }

        // Inicializar tablas del modal
        $("#tablaProveedores").DataTable({
            data: proveedores,
            searching: false,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "nombre" },
                { data: "cantidad" },
                { data: "rechazo" },
                { data: "maduro" },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 6) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            dom: "t",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        // Procesar las observaciones
        let observacionesData = [];

        if (
            registro.observaciones &&
            typeof registro.observaciones === "string"
        ) {
            observacionesData = registro.observaciones
                .split("\n")
                .filter((obs) => obs.trim() !== "")
                .map((obs) => ({ observaciones: obs.trim() }));
        } else if (Array.isArray(registro.observaciones)) {
            observacionesData = registro.observaciones.map((obs) => ({
                observaciones:
                    typeof obs === "string"
                        ? obs
                        : obs.texto || obs.observacion || JSON.stringify(obs),
            }));
        } else if (
            registro.observaciones &&
            typeof registro.observaciones === "object"
        ) {
            observacionesData = [
                { observaciones: JSON.stringify(registro.observaciones) },
            ];
        } else {
            observacionesData = [{ observaciones: "Sin observaciones" }];
        }

        $("#tablaObservaciones").DataTable({
            data: observacionesData,
            searching: false,
            paging: false,
            info: false,
            destroy: true,
            columns: [
                {
                    data: "observaciones",
                    render: function (data) {
                        return `<span style="white-space: pre-wrap;">${data}</span>`;
                    },
                },
            ],
            dom: "t",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        $("#tablaInfoAlistamiento").DataTable({
            data: resultado,
            searching: false,
            destroy: true,
            pageLength: 20,
            columns: [
                { data: "cortador" },
                { data: "cantidad" },
                { data: "totales" },
                { data: "rechazo" },
                { data: "maduro" },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros < 20) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });
    } catch (error) {
        console.error(error);
    }
}

async function cargarInfoPersonal(dataPeladores) {
    try {
        // Asegurar estructura de la tabla
        const table = document.getElementById("tablaInfoPersonal");
        if (!table.querySelector("thead")) {
            table.innerHTML = `
                <thead>
                    <tr>
                        <th scope="col" class="I text-center"><i class="fa-solid fa-hashtag"></i> Pelador</th>
                        <th scope="col" class="I text-center"><i class="fa-solid fa-circle-user"></i> Promedio</th>
                        <th scope="col" class="I text-center"><i class="fa-solid fa-location-dot"></i> Total</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
        }

        // Intentar actualizar datos si la tabla ya existe
        const dataUpdated = DataTableManager.updateData(
            "tablaInfoPersonal",
            dataPeladores,
        );

        if (!dataUpdated) {
            // Si no se pudo actualizar, crear nueva instancia
            DataTableManager.initOrUpdate("tablaInfoPersonal", {
                data: dataPeladores,
                searching: false,
                pageLength: 20,
                columns: [
                    { data: "pelador" },
                    { data: "promedio" },
                    { data: "total" },
                ],
                drawCallback: function () {
                    let api = this.api();
                    let numRegistros = api.rows({ filter: "applied" }).count();
                    let tableWrapper = $(api.table().container());
                    if (numRegistros < 20) {
                        tableWrapper.find(".dataTables_paginate").hide();
                    } else {
                        tableWrapper.find(".dataTables_paginate").show();
                    }
                },
                dom: "Bfrtip",
                responsive: true,
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                },
            });
        }
    } catch (error) {
        console.error(error);
    }
}

const limpiarTable = () => {
    elementsAlistamiento.inputFechaInfo.value = "";
    elementsAlistamiento.inputMaduroInfo.value = 0;
    elementsAlistamiento.inputRechazoInfo.value = 0;
    elementsAlistamiento.inputTotalInfo.value = 0;
};

const asignarPromedio = (data) => {
    const cardPromedio = {
        maduro: document.querySelector("#Maduros"),
        rechazo: document.querySelector("#Rechazo"),
        total: document.querySelector("#Canastillas"),
    };
    cardPromedio.maduro.textContent = `${parseFloat(data[0].maduro.toFixed(1)) ?? 0} Kg`;
    cardPromedio.rechazo.textContent = `${parseFloat(data[0].rechazo.toFixed(1)) ?? 0} Kg`;
    cardPromedio.total.textContent = `${parseFloat(data[0].total.toFixed(1)) ?? 0}`;
};

async function buscarOrdenes() {
    const suggestions = document.getElementById("suggestions");
    const query = elementsAlistamiento.inputSearch.value.toLowerCase().trim();

    if (query === "") {
        suggestions.innerHTML = "";
        return;
    }

    try {
        const response = await API_PRODUCCION.get("/obtener", {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { data } = response;
        const resultados = data.filter((orden) =>
            orden.Lote.toLowerCase().includes(query),
        );
        renderSuggestions(resultados, suggestions, "C");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

const generarPDF = async (id) => {
    console.log("=== GENERAR PDF INICIADO ===");
    console.log("ID recibido:", id);

    if (!id) {
        console.error("ID no proporcionado");
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se proporcionó un ID válido",
        });
        return false;
    }

    try {
        // Show loading indicator
        Swal.fire({
            title: "Generando PDF...",
            text: "Por favor espere",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        console.log("Haciendo petición a la API...");
        const res = await API_ALISTAMIENTO.get(`/obtener-info-id/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta de la API:", res);

        if (!res.success) {
            Swal.close();
            alerts.show(res);
            return;
        }

        const { data } = res;
        console.log("Datos para PDF recibidos:", data);

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (!csrfToken) {
            console.error("Token CSRF no encontrado");
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Token de seguridad no encontrado",
            });
            return;
        }

        console.log("Enviando datos al servidor para generar PDF...");
        const response = await fetch("/reporte-alistamiento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken.getAttribute("content"),
            },
            body: JSON.stringify(data),
        });

        console.log(
            "Respuesta del servidor:",
            response.status,
            response.statusText,
        );

        if (response.ok) {
            const blob = await response.blob();
            console.log("Blob recibido, tamaño:", blob.size);

            // Crear URL para el blob del PDF
            const pdfUrl = URL.createObjectURL(blob);

            // Abrir el PDF en una nueva pestaña
            const newWindow = window.open(pdfUrl, "_blank");

            // Si el navegador bloquea la ventana emergente, ofrecer alternativa
            if (
                !newWindow ||
                newWindow.closed ||
                typeof newWindow.closed === "undefined"
            ) {
                // Alternativa si el navegador bloquea la ventana emergente
                const a = document.createElement("a");
                a.href = pdfUrl;
                a.target = "_blank"; // Esto abrirá en una nueva pestaña
                a.rel = "noopener noreferrer"; // Buenas prácticas de seguridad
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            // IMPORTANTE: Liberar la URL del objeto después de un tiempo
            // para evitar pérdidas de memoria
            setTimeout(() => {
                URL.revokeObjectURL(pdfUrl);
            }, 1000);

            Swal.close();
            console.log("=== PDF ABIERTO EXITOSAMENTE ===");
        } else {
            const errorText = await response.text();
            console.error("Error del servidor:", errorText);

            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo generar el PDF. Código: " + response.status,
            });
        }
    } catch (error) {
        console.error("Error en generarPDF:", error);

        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al generar el PDF: " + error.message,
        });
    }
};

// Inicialización
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
