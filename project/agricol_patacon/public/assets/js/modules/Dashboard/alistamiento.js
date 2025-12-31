import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_ALISTAMIENTO = new ApiService(
    "http://localhost:3105/data/alistamiento"
);
const API_PRODUCCION = new ApiService("http://localhost:3105/data/produccion");
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

const listenerIds = {
    inputSearch: null,
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
    if (elementsAlistamiento.inputSearch) {
        listenerIds.inputSearch = eventManager.addDebounced(
            elementsAlistamiento.inputSearch,
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
        moreDiv.textContent = `+${
            resultados.length - maxResults
        } resultados más...`;
        container.appendChild(moreDiv);
    }
}

export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    // Limpiar listeners de DataTables
    cleanupDataTables();
}

function cleanupDataTables() {
    [
        "#tablaInfoAlistamiento",
        "#tablaProveedores",
        "tablaAlistamiento",
    ].forEach((tableId) => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
            $(tableId).empty();
        }
    });
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
            }
        );

        if (!response.success) {
            alerts.show(response);
            throw new Error("No hay Información disponible.");
        }

        const { alistamientos, promedioPelador, promedios } = response.data;

        asignarPromedio(promedios);
        cargarInfoPersonal(promedioPelador);

        $(`#tablaAlistamiento`).DataTable({
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
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
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
                // Recorremos columnas y conectamos la 2da fila (filtros)
                api.columns().every(function (colIdx) {
                    const column = this;
                    const $thFilter = $header.find("tr:eq(1) th").eq(colIdx);

                    // INPUT -> búsqueda libre (contains)
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

                    // SELECT -> opciones únicas + match exacto
                    const $select = $thFilter.find("select");
                    if ($select.length) {
                        // llenar opciones únicas ordenadas
                        const uniques = column.data().unique().sort();
                        // limpiar por si reinicializas
                        $select
                            .empty()
                            .append('<option value="">Todos</option>');
                        uniques.each(function (d) {
                            if (d !== null && d !== undefined && d !== "") {
                                $select.append(
                                    `<option value="${d}">${d}</option>`
                                );
                            }
                        });

                        $select.off("change").on("change", function () {
                            const val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
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

        $("#carousel-item1").removeClass("active");
        $("#carousel-item2").addClass("active");
        setupTableListeners("tablaAlistamiento");
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
function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoAlistamiento(id);
    });

    eventManager.delegate(table, "click", ".pdf-btn", async function (e) {
        const id = this.dataset.id;
        await generarPDF(id);
    });
}
async function infoAlistamiento(id) {
    try {
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
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
            columnDefs: [],
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
            columnDefs: [],
        });
    } catch (error) {
        console.error(error);
    }
}

async function cargarInfoPersonal(dataPeladores) {
    try {
        $("#tablaInfoPersonal").DataTable({
            data: dataPeladores,
            searching: false,
            destroy: true,
            pageLength: 14,
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
            columnDefs: [],
        });
    } catch (error) {
        console.error(error);
    }
}

const limpiarTable = () => {
    $("#tablaProveedores > tbody").empty();
    $("#tablaInfoAlistamiento > tbody").empty();
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
    cardPromedio.maduro.textContent = `${
        parseFloat(data[0].maduro.toFixed(1)) ?? 0
    } Kg`;
    cardPromedio.rechazo.textContent = `${
        parseFloat(data[0].rechazo.toFixed(1)) ?? 0
    } Kg`;
    cardPromedio.total.textContent = `${
        parseFloat(data[0].total.toFixed(1)) ?? 0
    }`;
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
            orden.Lote.toLowerCase().includes(query)
        );
        renderSuggestions(resultados, suggestions, "C");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

const generarPDF = async (id) => {
    if (!id) return false;
    const res = await API_ALISTAMIENTO.get(`/obtener-info-id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });
    const { data } = res;
    const response = await fetch("/reporte-alistamiento", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify(data),
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
