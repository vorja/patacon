import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

// Inicializar
const API_FRITURA = new ApiService("http://localhost:3105/data/fritura");
const API_PRODUCCION = new ApiService("http://localhost:3105/data/produccion");
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
    if (elementFritura.btnPDF) {
        listenerIds.btnPDF = eventManager.add(
            elementFritura.btnPDF,
            "click",
            generarPDF
        );
    }

    if (elementFritura.inputSearch) {
        listenerIds.inputSearch = eventManager.addDebounced(
            elementFritura.inputSearch,
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

    elementFritura.inputSearch.value = ordenLote;
    elementFritura.inputSearch.setAttribute("data-id", ordenId);
    await cargarLostesFritura(ordenId);
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
    ["#tablaInfoLotes", "#tablaInfoFritura"].forEach((tableId) => {
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
            }
        );
        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { conteoLotes, lostesFritura } = res.data;
        cargarInfoLotes(lostesFritura);
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

        /*    $("#tableVariablesProceso").DataTable({
            data: proceso,
            searching: false,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "proveedor" },
                { data: "tiempo" },
                { data: "temperatura" },
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
 */
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
                /* 
                { data: "proveedor" }, */
                { data: "lote_produccion" },
                { data: "lote_proveedor" },
                { data: "tipo" },
                { data: "canastillas_totales" },
                { data: "peso_neto" },
            ],
            columnDefs: [
                {
                    targets: 4, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )} `
                        );
                    },
                },
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
        `${new Intl.NumberFormat("es-CL").format(lote.materia_kg) ?? 0}`
    );
    $("#bajadas").text(`${lote.bajadas ?? 0}`);
    $("#rechazo").text(`${lote.rechazo ?? 0} kg`);
    $("#migas").text(`${lote.migas ?? 0} kg`);
    $("#observaciones").text(
        `${lote.observaciones || "No hay Observaciones."}`
    );
};

//
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
        $("#tablaInfoLotes").DataTable({
            data: dataLotes,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
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
      <a class="dropdown-item d-flex align-items-center pdf-btn" id="btnPDF" data-id="${row.id}">
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
                const $header = $(api.table().header()); // <thead>
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
                var api = this.api();
                var numColumnas = api.columns().count();
                if (numColumnas <= 20) {
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

        setupTableListeners("tablaInfoLotes");
    } catch (error) {
        console.error(error);
    }
}

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await cargarDetalleFritura(id);
    });

    eventManager.delegate(table, "click", ".pdf-btn", async function (e) {
        const id = this.dataset.id;
        await generarPDF(id);
    });
}

async function buscarOrdenes() {
    const suggestions = document.getElementById("suggestions");
    const query = elementFritura.inputSearch.value.toLowerCase().trim();

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

function rendenderCardProveedores(data) {
    const contendor = document.querySelector("#contenedorProveedores");
    if (!contendor) {
        return;
    }
    contendor.innerHTML = "";
    data.forEach((item) => {
        const col = `
        
        <div class="col">
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
        
        <!-- HEADER -->
        <div class="card-header fw-bold text-white py-2" style="background-color:#ec6704;">
            PROVEEDOR
        </div>

        <div class="card-body">

            <div class="row g-3 align-items-center">

                <!-- LOGO -->
                <div class="col-4 text-center">
                    <img src="/assets/images/logo-clean.png"
                         class="img-fluid img-thumbnail border-0"
                         style="max-height:120px; object-fit:contain;">
                </div>

                <!-- DATOS -->
                <div class="col-8">
                    
                    <!-- Nombre proveedor -->
                    <div class="d-flex align-items-center mb-3">
                        <i class="fa-solid fa-user text-secondary me-2" style="width:20px;"></i>
                        <span class="fw-bold fs-5 text-dark">${
                            item.proveedor
                        }</span>
                    </div>

                    <div class="row g-2">

                        <!-- Materia Prima -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-seedling text-success me-2"></i>
                                    <span class="fw-semibold">Materia</span>
                                </div>
                                <span class="badge bg-success-subtle text-dark mt-1">
                                    ${new Intl.NumberFormat("es-CL").format(
                                        item.materia_kg
                                    )} Kg
                                </span>
                            </div>
                        </div>

                        <!-- Canastas -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-kaaba text-primary me-2"></i>
                                    <span class="fw-semibold">Canastas</span>
                                </div>
                                <span class="badge bg-primary-subtle text-dark mt-1">
                                    ${item.canastas}
                                </span>
                            </div>
                        </div>

                        <!-- Temperatura -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-temperature-three-quarters text-danger me-2"></i>
                                    <span class="fw-semibold">Temp.</span>
                                </div>
                                <span class="badge bg-danger-subtle text-dark mt-1">
                                    ${item.temperatura}°C
                                </span>
                            </div>
                        </div>

                        <!-- Tiempo -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-clock text-warning me-2"></i>
                                    <span class="fw-semibold">Tiempo</span>
                                </div>
                                <span class="badge bg-warning-subtle text-dark mt-1">
                                    ${item.tiempo} min
                                </span>
                            </div>
                        </div>

                        <!-- Rechazo -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-ban text-danger me-2"></i>
                                    <span class="fw-semibold">Rechazo</span>
                                </div>
                                <span class="badge bg-danger text-white mt-1">
                                    ${new Intl.NumberFormat("es-CL").format(
                                        item.rechazo
                                    )} kg
                                </span>
                            </div>
                        </div>

                        <!-- Migas -->
                        <div class="col-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex align-items-center">
                                    <i class="fa-solid fa-cookie text-brown me-2"></i>
                                    <span class="fw-semibold">Migas</span>
                                </div>
                                <span class="badge bg-dark-subtle text-dark mt-1">
                                    ${new Intl.NumberFormat("es-CL").format(
                                        item.migas
                                    )} kg
                                </span>
                            </div>
                        </div>
                    </div>
                </div> 
            </div> 
        </div>
    </div>
</div>

        `;

        contendor.innerHTML += col;
    });
}

const generarPDF = async (id) => {
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
