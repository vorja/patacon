import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

// Inicializar
const API_FRITURA = new ApiService(Url + "/data/fritura");
const API_PRODUCCION = new ApiService(Url + "/data/produccion");

const alerts = new AlertManager();

const elementFritura = {
    btnPDF: document.getElementById("btnPDF"),
    inputSearch: document.getElementById("inputSearch"),
};

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const listenerIds = {
    inputSearch: null,
    btnPDF: null,
    // Agregamos un objeto para los delegados globales
    tableDelegates: null,
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
    // Botón PDF principal (si existe)
    if (elementFritura.btnPDF) {
        listenerIds.btnPDF = eventManager.add(
            elementFritura.btnPDF,
            "click",
            generarPDF,
        );
    }

    // Input de búsqueda con debounce
    if (elementFritura.inputSearch) {
        listenerIds.inputSearch = eventManager.addDebounced(
            elementFritura.inputSearch,
            "input",
            buscarOrdenes,
            300,
        );
    } else {
        console.warn("Input de búsqueda de contenedores no encontrado");
    }

    // Configurar delegados globales UNA SOLA VEZ
    // Esto evitará que se acumulen con cada recarga de tabla
    if (!listenerIds.tableDelegates) {
        listenerIds.tableDelegates = {
            infoBtn: eventManager.delegate(
                document.body, // Usar body para capturar eventos de toda la página
                "click",
                ".info-btn",
                handleInfoButtonClick,
            ),
            pdfBtn: eventManager.delegate(
                document.body,
                "click",
                ".pdf-btn",
                handlePdfButtonClick,
            ),
            suggestions: eventManager.delegate(
                document.body,
                "click",
                ".suggestion-item",
                handleSuggestionClick,
            ),
        };
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

// Manejadores de eventos globales
async function handleInfoButtonClick(e) {
    const id = this.dataset.id;
    if (id) {
        await cargarDetalleFritura(id);
    }
}

async function handlePdfButtonClick(e) {
    const id = this.dataset.id;
    if (id) {
        await generarPDF(id);
    }
}

async function handleSuggestionClick(e) {
    const suggestionItem = e.target.closest(".suggestion-item");
    if (!suggestionItem) return;

    const ordenId = suggestionItem.dataset.id;
    const ordenLote = suggestionItem.textContent;

    elementFritura.inputSearch.value = ordenLote;
    elementFritura.inputSearch.setAttribute("data-id", ordenId);
    await cargarLostesFritura(ordenId);

    // Limpiar sugerencias
    const suggestionsContainer = document.getElementById("suggestions");
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = "";
    }
}

function renderSuggestions(resultados, container, tipo) {
    const fragment = document.createDocumentFragment();
    const maxResults = 10;
    const limited = resultados.slice(0, maxResults);

    limited.forEach((orden) => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = orden.Lote;
        div.dataset.id = orden.id;
        div.dataset.tipo = tipo;
        fragment.appendChild(div);
    });

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
    Object.keys(listenerIds).forEach((key) => {
        const id = listenerIds[key];

        if (id !== null && key !== "tableDelegates") {
            eventManager.remove(id);
            listenerIds[key] = null;
        }

        // Si es el objeto de delegados, remover cada listener interno
        if (key === "tableDelegates" && id) {
            Object.values(id).forEach((innerId) => {
                if (innerId !== null) {
                    eventManager.remove(innerId);
                }
            });
            listenerIds[key] = null;
        }
    });

    // Limpiar listeners de DataTables
    cleanupDataTables();
}

function cleanupDataTables() {
    [
        "#tablaInfoLotes",
        "#tablaInfoFritura",
        "#tableVariablesProceso",
        "#tableLotes",
        "#tableVariablesProveedor",
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

async function cargarLostesFritura(id_produccion) {
    try {
        const res = await API_FRITURA.get(
            `/obtener-lotes-Month/${id_produccion}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );
        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { conteoLotes, lotesFritura } = res.data;
        cargarInfoLotes(lotesFritura);
        asignarConteo(conteoLotes);
    } catch (error) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2500,
        });
    }
}

// Se encarga de Traer los detalles del lote de fritura
async function cargarDetalleFritura(id) {
    limpiarModal();
    try {
        const res = await API_FRITURA.get(`/obtener-lote-Id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }

        const { proceso, produccion, detalles, canastillas, proveedores } =
            res.data;
        asignarInfo(produccion);
        rendenderCardProveedores(proceso);

        $("#tablaInfoFritura").DataTable({
            data: canastillas,
            searching: false,
            destroy: true,
            orderCellsTop: true,
            pageLength: 10,
            columns: [
                { data: "lote_proveedor" },
                { data: "tipo" },
                { data: "peso" },
                { data: "canastas" },
            ],
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
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
            columnDefs: [],
        });

        $("#tableLotes").DataTable({
            data: detalles,
            searching: false,
            destroy: true,
            orderCellsTop: true,
            pageLength: 10,
            columns: [
                { data: "lote_produccion" },
                { data: "tipo" },
                { data: "canastas" },
            ],
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
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
            columnDefs: [],
        });

        $("#tableVariablesProveedor").DataTable({
            data: proveedores,
            searching: false,
            destroy: true,
            orderCellsTop: true,
            pageLength: 5,
            dom: "Bfrtip",
            responsive: true,
            columns: [
                { data: "lote_produccion" },
                { data: "lote_proveedor" },
                { data: "tipo" },
                { data: "canastillas_totales" },
                { data: "peso_neto" },
            ],
            columnDefs: [
                {
                    targets: 4,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1),
                            )} `,
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 5) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        $("#ModalInfofritura").modal("show");
    } catch (error) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2400,
        });
    }
}

// Tabla de Informacion de los lotes
const limpiarModal = () => {
    $("#tablaInfoFritura > tbody").empty();
    $("#tableVariablesProceso > tbody").empty();
    $("#fecha").text(``);
    $("#lote").text(``);
    $("#variedad").text(``);
    $("#aforo").text(``);
    $("#indicadorGas").text(``);
    $("#inventario").text(``);
    $("#horaInicio").text(``);
    $("#horaFin").text(``);
    $("#total").text(``);
    $("#bajadas").text(``);
    $("#observaciones").text(``);
};

// Asignar Información
const asignarInfo = (lote) => {
    $("#fecha").text(`${lote.fecha ?? 0}`);
    $("#variedad").text(`${lote.producto ?? 0}`);
    $("#aforo").text(`${lote.aforo ?? 0} Lt`);
    $("#indicadorGas").text(`${lote.gas ?? 0}`);
    $("#inventario").text(`${lote.inventario ?? 0}`);
    $("#horaInicio").text(`${lote.horaInicio ?? 0}`);
    $("#horaFin").text(`${lote.horaFin ?? 0}`);
    $("#total").text(`${lote.canastas ?? 0}`);
    $("#totalMateria").text(
        `${new Intl.NumberFormat("es-CL").format(lote.materia_kg) ?? 0}`,
    );
    $("#bajadas").text(`${lote.bajadas ?? 0}`);
    $("#rechazo").text(`${lote.rechazo ?? 0} kg`);
    $("#migas").text(`${lote.migas ?? 0} kg`);
    $("#observaciones").text(
        `${lote.observaciones || "No hay Observaciones."}`,
    );
};

const asignarConteo = (data) => {
    const cardFritura = {
        Lotes: document.querySelector("#Lotes"),
        Materia: document.querySelector("#Materia"),
        Defectos: document.querySelector("#Defectos"),
    };
    cardFritura.Lotes.textContent = parseFloat(data ?? 0);
};

async function cargarInfoLotes(dataLotes) {
    try {
        // Destruir DataTable anterior si existe
        if ($.fn.DataTable.isDataTable("#tablaInfoLotes")) {
            $("#tablaInfoLotes").DataTable().destroy();
        }

        $("#tablaInfoLotes").DataTable({
            data: dataLotes,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            pageLength: 10,
            columns: [
                { data: "fecha" },
                { data: "producto" },
                { data: "canastas" },
                { data: "rechazo" },
                { data: "migas" },
                {
                    data: null,
                    render: (data, type, row) => `
                        <div class="btn-group dropend">
                            <button type="button" class="btn btn-light btn-sm dropdown-toggle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; border-radius: 50%;" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu shadow-sm border-0 rounded-3">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}">
                                        <i class="fas fa-circle-info text-info me-2"></i> Información
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center pdf-btn" data-id="${row.id}">
                                        <i class="fa-solid fa-file-pdf text-danger me-2"></i> Exportar
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
                    const $thFilter = $header.find("tr:eq(1) th").eq(colIdx);

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
                var api = this.api();
                var numColumnas = api.columns().count();
                if (numColumnas >= 10) {
                    $(".dataTables_paginate").hide();
                } else {
                    $(".dataTables_paginate").show();
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

async function buscarOrdenes() {
    const suggestions = document.getElementById("suggestions");
    const query = elementFritura.inputSearch.value.toLowerCase().trim();

    if (query === "") {
        if (suggestions) suggestions.innerHTML = "";
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

        if (suggestions) {
            renderSuggestions(resultados, suggestions, "C");
        }
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

function rendenderCardProveedores(data) {
    const contenedor = document.querySelector("#contenedorProveedores");
    if (!contenedor) return;

    // Template por cada item usando map + join (más eficiente)
    contenedor.innerHTML = data
        .map(
            (item) => `
        <div class="col-6 mb-4">
            <div class="card shadow-sm border-0 rounded-3 overflow-hidden h-100">
                <!-- Header con ícono y texto mejor alineado -->
                <div class="card-header fw-bold text-white py-2 px-3 d-flex align-items-center" 
                     style="background-color:#ec6704;">
                    <i class="fa-solid fa-building me-2"></i>
                    <span>PROVEEDOR</span>
                </div>
                
                <div class="card-body p-3 d-flex flex-column">
                    <!-- Logo centrado con padding consistente -->
                    <div class="text-center mb-3">
                        <img src="/assets/images/logo-clean.png"
                             class="img-fluid rounded-3 p-2 bg-light border"
                             style="max-height:100px; width:auto; object-fit:contain;">
                    </div>
                    
                    <!-- Nombre del proveedor con mejor jerarquía visual -->
                    <div class="d-flex align-items-center mb-3 pb-2 border-bottom">
                        <div class="bg-light rounded-circle p-2 me-2">
                            <i class="fa-solid fa-user text-secondary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-secondary d-block">Proveedor</small>
                            <span class="fw-bold fs-5 text-dark lh-1">${item.proveedor}</span>
                        </div>
                    </div>
                    
                    <!-- Grid de métricas - todas con misma altura y alineación -->
                    <div class="row g-2 flex-grow-1">
                        <!-- Materia Prima -->
                        <div class="col-6">
                            <div class="p-2 border rounded-3 bg-light h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-seedling text-success me-1" style="width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Materia Prima</span>
                                </div>
                                <span class="fw-bold fs-5 text-dark">
                                    ${new Intl.NumberFormat("es-CL").format(item.materia_kg)}
                                    <small class="fw-normal text-secondary ms-1">kg</small>
                                </span>
                            </div>
                        </div>
                        
                        <!-- Canastas -->
                        <div class="col-6">
                            <div class="p-2 border rounded-3 bg-light h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-kaaba text-primary me-1" style="width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Canastas</span>
                                </div>
                                <span class="fw-bold fs-5 text-dark">${item.canastas}</span>
                            </div>
                        </div>
                        
                        <!-- Temperatura -->
                        <div class="col-6">
                            <div class="p-2 border rounded-3 bg-light h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-temperature-low text-danger me-1" style="width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Temperatura</span>
                                </div>
                                <span class="fw-bold fs-5 text-dark">
                                    ${item.temperatura}<small class="fw-normal text-secondary ms-1">°C</small>
                                </span>
                            </div>
                        </div>
                        
                        <!-- Tiempo -->
                        <div class="col-6">
                            <div class="p-2 border rounded-3 bg-light h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-hourglass-half text-warning me-1" style="width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Tiempo</span>
                                </div>
                                <span class="fw-bold fs-5 text-dark">
                                    ${item.tiempo}<small class="fw-normal text-secondary ms-1">min</small>
                                </span>
                            </div>
                        </div>
                        
                        <!-- Rechazo (destacado) -->
                        <div class="col-6">
                            <div class="p-2 border border-danger rounded-3 bg-danger bg-opacity-10 h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-ban text-danger me-1" style="width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Rechazo</span>
                                </div>
                                <span class="fw-bold fs-5 text-danger">
                                    ${new Intl.NumberFormat("es-CL").format(item.rechazo)}
                                    <small class="fw-normal text-danger ms-1">kg</small>
                                </span>
                            </div>
                        </div>
                        
                        <!-- Migas -->
                        <div class="col-6">
                            <div class="p-2 border rounded-3 bg-light h-100 d-flex flex-column">
                                <div class="d-flex align-items-center mb-1">
                                    <i class="fa-solid fa-cookie me-1" style="color:#8B4513; width:16px;"></i>
                                    <span class="small fw-semibold text-secondary">Migas</span>
                                </div>
                                <span class="fw-bold fs-5 text-dark">
                                    ${new Intl.NumberFormat("es-CL").format(item.migas)}
                                    <small class="fw-normal text-secondary ms-1">kg</small>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
        )
        .join("");
}

const generarPDF = async (id) => {
    console.log("Generando PDF para ID:", id);

    const res = await API_FRITURA.get(`/obtener-lote-Id/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });

    if (!res.success) {
        alerts.show(res);
        return false;
    }

    const { data } = res;
    const response = await fetch("/reporte-fritura", {
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
        window.open(url, "_blank");
    } else {
        console.error("Error al generar PDF");
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
