import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";
import eventManager from "../../helpers/EventsManager.js";

const API_CORTES = new ApiService(Url + "/data/corte");
const API_PRODUCCION = new ApiService(Url + "/data/produccion");

const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsCortes = {
    btnPDF: document.querySelector("#btnPDF"),
    inputFecha: document.querySelector("#fecha_info"),
    inputMaduroInfo: document.querySelector("#maduro_info"),
    inputTotalInfo: document.querySelector("#total_info"),
    inputRechazoInfo: document.querySelector("#rechazo_info"),
    inputSearch: document.querySelector("#inputSearch"),
};

const listenerIds = {
    inputSearch: null,
    btnPDF: null,
};
async function init() {
    try {
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
function setupEventListeners() {
    if (elementsCortes.inputSearch) {
        listenerIds.inputSearch = eventManager.addDebounced(
            elementsCortes.inputSearch,
            "input",
            buscarOrdenes,
            300
        );
    } else {
        console.warn("Input de búsqueda de contenedores no encontrado");
    }

    //
    const suggestionsContainer = document.getElementById("suggestions");
    if (suggestionsContainer) {
        eventManager.delegate(
            suggestionsContainer,
            "click",
            ".suggestion-item",
            handleSuggestionClick
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function handleSuggestionClick(e) {
    const suggestionItem = e.target;
    const ordenId = suggestionItem.dataset.id;
    const ordenLote = suggestionItem.textContent;

    elementsCortes.inputSearch.value = ordenLote;
    elementsCortes.inputSearch.setAttribute("data-id", ordenId);

    await cargarCortes(ordenId);
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
        moreDiv.textContent = `+${
            resultados.length - maxResults
        } resultados más...`;
        container.appendChild(moreDiv);
    }
}

async function cargarCortes(id) {
    try {
        const response = await API_CORTES.get(`/obtener-by-orden/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            throw new Error("No hay información disponible.");
        }

        const { cortes, promedios } = response.data;
        asignarPromedio(promedios);

        $("#carousel-item1").removeClass("active");
        $("#carousel-item2").addClass("active");

        // DESTRUIR TABLA DE FORMA SEGURA
        if ($.fn.DataTable.isDataTable("#tablaCortes")) {
            const table = $("#tablaCortes").DataTable();
            try {
                table.clear().destroy();
            } catch (error) {
                // Si falla, limpiar manualmente
                $("#tablaCortes").empty();
                $("#tablaCortes").removeAttr("data-page");
                $("#tablaCortes").removeAttr("data-filter");
                $("#tablaCortes").removeAttr("data-sort");
            }
        }

        // Limpiar el contenido de la tabla
        $("#tablaCortes tbody").empty();

        // Crear nueva tabla
        const dataTable = $(`#tablaCortes`).DataTable({
            data: cortes,
            searching: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            destroy: true,
            retrieve: false,
            autoWidth: false,
            columns: [
                { data: "Fecha" },
                { data: "Materia" },
                { data: "Rechazo" },
                { data: "Observaciones" },
                { data: "Responsable" },
                {
                    data: null,
                    render: (data, type, row) => `
                    <div class="btn-group dropend">
                        <button type="button" class="btn btn-light btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
                        data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
                            <li>
                                <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}" data-fecha="${row.Fecha}" data-rechazo="${row.Rechazo ? row.Rechazo : ""}">
                                    <i class="fas fa-circle-info text-info me-2"></i> Información
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item d-flex align-items-center pdf-btn" data-id="${row.id}">
                                    <i class="fas fa-file-export text-danger me-2"></i> Exportar
                                </a>
                            </li>
                        </ul>
                    </div>
                    `,
                    orderable: false,
                    searchable: false,
                },
            ],
            initComplete: function () {
                // Configurar listeners solo una vez
                const api = this.api();
                const $header = $(api.table().header());

                api.columns().every(function (colIdx) {
                    const column = this;
                    const $thFilter = $header.find("tr:eq(1) th").eq(colIdx);

                    const $input = $thFilter.find("input");
                    if ($input.length) {
                        // Usar namespace para los eventos
                        $input
                            .off("keyup.dt change.dt")
                            .on("keyup.dt change.dt", function () {
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

                        $select.off("change.dt").on("change.dt", function () {
                            const val = $.fn.dataTable.util.escapeRegex(
                                $(this).val(),
                            );
                            column
                                .search(val ? `^${val}$` : "", true, false)
                                .draw();
                        });
                    }
                });

                // Configurar listeners de botones
                setupTableListeners("tablaCortes");
            },
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 10) {
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

// Modificar setupTableListeners para evitar duplicación
const tableListeners = new Map();

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    // Remover listeners anteriores de esta tabla
    if (tableListeners.has(tableId)) {
        const listenerIds = tableListeners.get(tableId);
        listenerIds.forEach((id) => {
            if (id) eventManager.remove(id);
        });
        tableListeners.delete(tableId);
    }

    // Agregar nuevos listeners
    const listenerIds = [
        eventManager.delegate(table, "click", ".info-btn", async function (e) {
            const id = this.dataset.id;
            await infoCorte(id);
        }),
        eventManager.delegate(table, "click", ".pdf-btn", async function (e) {
            const id = this.dataset.id;
            await generarPDF(id);
        }),
    ];

    // Guardar IDs para limpiar después
    tableListeners.set(tableId, listenerIds);
}

// Modificar cargarInfoProveedores para manejar DataTables correctamente
async function cargarInfoProveedores(id) {
    try {
        limpiarTable();

        const response = await API_CORTES.get(`/obtener-detalle-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            throw new Error(
                "Error al Obtener la información del Registro de Corte.",
            );
        }

        const { detalles, cortesProveedor, registro } = response.data;

        elementsCortes.inputFecha.value = registro.fecha || "";
        elementsCortes.inputRechazoInfo.value = `${registro.rechazo || 0} Kg`;

        if (elementsCortes.btnPDF) {
            elementsCortes.btnPDF.setAttribute("data-id", `${id}`);
        }

        // TABLA 1: Información de corte
        if ($.fn.DataTable.isDataTable("#tablaInfoCorte")) {
            $("#tablaInfoCorte").DataTable().clear().destroy();
        }

        $("#tablaInfoCorte").DataTable({
            data: detalles,
            searching: false,
            destroy: true,
            retrieve: false,
            autoWidth: false,
            paging: detalles.length > 10,
            columns: [
                { data: "Proveedor" },
                { data: "Fecha" },
                { data: "Lote" },
                { data: "Materia" },
                { data: "Rechazo" },
                { data: "Rendimiento" },
            ],
            drawCallback: function () {
                var api = this.api();
                var numRows = api.rows({ page: "current" }).count();
                if (numRows <= 10) {
                    $(api.table().container())
                        .find(".dataTables_paginate")
                        .hide();
                } else {
                    $(api.table().container())
                        .find(".dataTables_paginate")
                        .show();
                }
            },
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        // TABLA 2: Cortes por proveedor
        if ($.fn.DataTable.isDataTable("#tablaCortesProveedor")) {
            $("#tablaCortesProveedor").DataTable().clear().destroy();
        }

        $("#tablaCortesProveedor").DataTable({
            data: cortesProveedor,
            searching: false,
            destroy: true,
            retrieve: false,
            autoWidth: false,
            paging: cortesProveedor.length > 1,
            columns: [
                { data: "Proveedor" },
                { data: "Lote" },
                { data: "Tipo" },
                { data: "Cantidad" },
            ],
            drawCallback: function () {
                var api = this.api();
                var numRows = api.rows({ page: "current" }).count();
                if (numRows <= 1) {
                    $(api.table().container())
                        .find(".dataTables_paginate")
                        .hide();
                } else {
                    $(api.table().container())
                        .find(".dataTables_paginate")
                        .show();
                }
            },
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        // Mostrar modal después de crear las tablas
        setTimeout(() => {
            $("#ModalInfoCorte").modal("show");
        }, 100);
    } catch (error) {
        console.error("Error en cargarInfoProveedores:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la información del corte.",
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

// Modificar limpiarTable
const limpiarTable = () => {
    // Limpiar tablas DataTables si existen
    const tables = ["#tablaInfoCorte", "#tablaCortesProveedor"];
    tables.forEach((tableId) => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            try {
                $(tableId).DataTable().clear().destroy();
            } catch (error) {
                console.warn(`Error al limpiar tabla ${tableId}:`, error);
            }
        }
        $(tableId + " tbody").empty();
    });

    // Limpiar inputs
    elementsCortes.inputFecha.value = "";
    elementsCortes.inputRechazoInfo.value = "";
};

// Modificar cleanupDataTables
function cleanupDataTables() {
    const tables = ["#tablaInfoCorte", "#tablaCortes", "#tablaCortesProveedor"];

    tables.forEach((tableId) => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            try {
                const table = $(tableId).DataTable();
                // Limpiar datos primero
                table.clear();
                // Destruir instancia
                table.destroy();
                // Limpiar HTML
                $(tableId).empty();
                // Remover clases de DataTables
                $(tableId).removeClass("dataTable");
            } catch (error) {
                console.warn(`Error al limpiar ${tableId}:`, error);
                // Limpieza forzada
                $(tableId).empty();
                $(tableId).removeAttr("style");
            }
        }
    });

    // Limpiar listeners de tablas
    tableListeners.clear();
}

// Modificar cleanup para incluir limpieza de tablas
export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    // Limpiar listeners de tablas
    tableListeners.forEach((listeners, tableId) => {
        listeners.forEach((id) => {
            if (id) eventManager.remove(id);
        });
    });
    tableListeners.clear();

    // Limpiar DataTables
    cleanupDataTables();
}

async function infoCorte(id) {
    try {
        limpiarTable();
        await cargarInfoProveedores(id);
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

export function reloadEventListeners() {
    cleanup();
    setupEventListeners();
}

const asignarPromedio = (data) => {
    const cardPromedio = {
        registros: document.querySelector("#Registros"),
        rechazo: document.querySelector("#Rechazo"),
    };
    cardPromedio.registros.textContent =
        parseFloat(data[0].registros.toFixed(0)) ?? 0;
    cardPromedio.rechazo.textContent = `${
        parseFloat(data[0].rechazo.toFixed(1)) ?? 0
    } Kg`;
};

async function buscarOrdenes() {
    const suggestions = document.getElementById("suggestions");
    const query = elementsCortes.inputSearch.value.toLowerCase().trim();

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
            orden.Lote.toLowerCase().includes(query)
        );
        renderSuggestions(resultados, suggestions, "C");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

const generarPDF = async (id) => {
    if (!id) {
        return false;
    }
    const res = await API_CORTES.get(`/obtener-detalle-id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });
    const dataCorte = res.data;
    const response = await fetch("/reporte-corte", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify(dataCorte),
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank"); // abre el PDF en nueva pestaña
    } else {
        console.error("Error al generar PDF");
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
