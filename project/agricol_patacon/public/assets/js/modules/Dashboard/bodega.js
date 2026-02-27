import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";
import eventManager from "../../helpers/EventsManager.js";

const API_BODEGA = new ApiService(Url + "/data/bodega");
const API_PRODUCCION = new ApiService(Url + "/config/encargo");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Variable global para almacenar el ID de la orden
let ordenGlobal = null;

// Función para establecer la orden (obtener el ID)
async function establecerOrden() {
    try {
        const response = await API_PRODUCCION.get("/obtener", {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { data } = response;
        console.log(data);
        // Guardamos el ID en ordenGlobal
        ordenGlobal = data.ordenProduccion.id;

        console.log("ID de orden establecido:", ordenGlobal);

        if (!ordenGlobal) {
            console.error("No se pudo obtener el ID de la orden");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error al establecer orden:", error);
        alerts.show({
            success: false,
            message: "Error al obtener el ID de la orden",
        });
        return false;
    }
}


async function init() {
    try {
        // Primero establecer el ID de la orden
        const ordenEstablecida = await establecerOrden();

        if (!ordenEstablecida) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el ID de la orden. La aplicación no puede continuar.",
            });
            return;
        }

        // Mostrar el ID en consola para verificación
        console.log("Inicializando aplicación con orden ID:", ordenGlobal);

        // Luego cargar el resto de la aplicación
        await cargar();
        await cargarCajas();
        await cargarCajasLotes();
    } catch (error) {
        console.error("Error al inicializar:", error);
        Swal.fire({
            icon: "error",
            title: "Error de Inicialización",
            text: "No se pudo cargar la aplicación correctamente.",
        });
    }
}

const listenerIds = {
    tablaInfo: null,
    tableInventario: null,
    tablaInfoProveedores: null,
};

async function cargar() {
    let retorno = false;
    try {
        const response = await API_BODEGA.get(`/obtener/${ordenGlobal}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            retorno = false;
            alerts.show(response);
            throw new Error("No hay información disponible.");
        }

        const { saldo_canastillas } = response.data;

        $(`#tablaCanastillas`).DataTable({
            data: saldo_canastillas,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "fecha_produccion" },
                { data: "lote_produccion" },
                { data: "total_producido" },
                { data: "total_empaquetado" },
                {
                    data: "saldo",
                    render: function (data, type, row) {
                        if (type !== "display") return data;
                        const val = parseInt(data ?? 0, 10);
                        if (val >= 1) {
                            return `<span class="badge bg-danger rounded-pill fw-bold">${val}</span>`;
                        }
                        return `<span class="badge bg-success rounded-pill fw-bold">${val}</span>`;
                    },
                },
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
                                    <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id_fritura}" data-lote="${row.lote_produccion}" data-tipo="${row.tipo ? row.tipo : ""}">
                                        <i class="fas fa-circle-info text-info me-2"></i> Información
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

        setupTableListeners("tablaCanastillas");
    } catch (error) {
        console.error(error);
    }

    return retorno;
}

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        const lote = this.dataset.lote;
        const tipo = this.dataset.tipo;
        await info(lote, id, tipo);
    });
}

async function info(lote, id, tipo) {
    limpiarTable();
    try {
        const response = await API_BODEGA.get(
            `/obtener-lotes-id/${lote}/${id}/${tipo}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!response.success) {
            alerts.show(response);
        }

        const { lotes, saldo } = response.data;

        $("#tablaInfoProveedores").DataTable({
            data: saldo,
            searching: false,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "lote_produccion" },
                { data: "lote_proveedor" },
                { data: "tipo" },
                { data: "canastas" },
                { data: "empaques" },
                {
                    data: "saldo",
                    render: function (data, type, row) {
                        if (type !== "display") return data;
                        const val = parseInt(data ?? 0, 10);
                        if (val >= 1) {
                            return `<span class="badge bg-danger rounded-pill fw-bold">${val}</span>`;
                        }
                        return `<span class="badge bg-success rounded-pill fw-bold">${val}</span>`;
                    },
                },
            ],
            columnDefs: [
                {
                    targets: 2,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`,
                        );
                    },
                },
                {
                    targets: 3,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="badge rounded-pill fw-bold" style="background-color:#ec6704">${cellData}</span>`,
                        );
                    },
                },
                {
                    targets: 4,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="badge bg-dark rounded-pill fw-bold">${cellData}</span>`,
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
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        $("#tablaInfo").DataTable({
            data: lotes,
            searching: false,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "empaque" },
                { data: "lote_empaque" },
                { data: "produccion" },
                { data: "tipo" },
                { data: "canastas" },
            ],
            columnDefs: [
                {
                    targets: 3,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`,
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
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        $("#ModalInfo").modal("show");
    } catch (error) {
        console.error(error);
    }
}

async function detalleCajas(produccion) {
    try {
        const response = await API_BODEGA.get(`/info-cajas/${produccion}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
        }

        const { detalle } = response.data;

        $("#tablaInfoCajas").DataTable({
            data: detalle,
            searching: false,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "produccion" },
                { data: "tipo" },
                { data: "lote_produccion" },
                { data: "lote_recepcion" },
                { data: "proveedor" },
                { data: "cajas" },
            ],
            columnDefs: [
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`,
                        );
                    },
                },
            ],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
                var intVal = function (i) {
                    return typeof i === "string"
                        ? parseFloat(i) || 0
                        : typeof i === "number"
                          ? i
                          : 0;
                };

                var totalesPorTipo = {};

                api.rows().every(function () {
                    var d = this.data();
                    var tipo = d.tipo;
                    var cajas = intVal(d.cajas);
                    totalesPorTipo[tipo] = (totalesPorTipo[tipo] || 0) + cajas;
                });

                var texto = Object.keys(totalesPorTipo)
                    .map(
                        (tipo) =>
                            `<span class="badge bg-light text-dark fw-semibold fs-6">${tipo}: ${totalesPorTipo[tipo]}</span>`,
                    )
                    .join(" ");

                $(api.column(5).footer()).html(texto);
            },
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
        });

        $("#ModalInfoCajas").modal("show");
    } catch (error) {
        console.error(error);
    }
}

// Limpiadores
export function cleanup() {
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    cleanupDataTables();
}

function cleanupDataTables() {
    [
        "#tablaCanastillas",
        "tablaInfoCajas",
        "tablaInfoProveedores",
        "tablaInfo",
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

const limpiarTable = () => {
    $("#tablaInfo > tbody").empty();
};

// Informacion de los CARDS.
async function cargarCajas() {
    let retorno = false;
    try {
        // Verificar que tenemos el ID antes de usarlo
        if (!ordenGlobal) {
            console.error("No hay ID de orden disponible");
            return false;
        }

        console.log("Cargando cajas para orden ID:", ordenGlobal);

        const response = await API_BODEGA.get(`/obtener-cajas/${ordenGlobal}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            retorno = false;
            alerts.show(response);
            return false;
        }

        const { cajas } = response.data;

        const cardCajas = {
            A: document.querySelector("#A"),
            B: document.querySelector("#B"),
            C: document.querySelector("#C"),
            AF: document.querySelector("#AF"),
            BH: document.querySelector("#BH"),
            XL: document.querySelector("#XL"),
            CIL: document.querySelector("#Cilindro"),
            P: document.querySelector("#Pinton"),
        };

        const datos = cajas[0];

        Object.keys(datos).forEach((key) => {
            const elemento = cardCajas[key];
            if (elemento) {
                elemento.textContent = datos[key];
            }
        });
    } catch (error) {
        console.error("Error en cargarCajas:", error);
    }

    return retorno;
}

async function cargarCajasLotes() {
    let retorno = false;
    try {
        // Verificar que tenemos el ID antes de usarlo
        if (!ordenGlobal) {
            console.error("No hay ID de orden disponible");
            return false;
        }

        console.log("Cargando cajas lotes para orden ID:", ordenGlobal);

        const response = await API_BODEGA.get(
            `/obtener-cajas-lotes/${ordenGlobal}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!response.success) {
            retorno = false;
            alerts.show(response);
            return false;
        }

        const { infoCajas } = response.data;

        $(`#tableInventario`).DataTable({
            data: infoCajas,
            searching: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "fecha_produccion" },
                { data: "A" },
                { data: "B" },
                { data: "C" },
                { data: "AF" },
                { data: "BH" },
                { data: "XL" },
                { data: "CIL" },
                { data: "CP" },
                {
                    data: null,
                    render: (data, type, row) => `
                        <div class="btn-group dropup">
                            <button type="button" class="btn btn-light btn-sm dropdown-toggle d-flex align-items-center justify-content-center"   
                                data-bs-toggle="dropdown" aria-expanded="false" 
                                style="background-color: #f7f7f7ff; width: 42px; height: 42px; border-radius: 50%;">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu shadow-sm border-0 rounded-3">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center info-btn" data-lote="${row.fecha_produccion}">
                                        <i class="fas fa-circle-info text-info me-2"></i> información
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `,
                },
            ],
            columnDefs: [
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-G">${cellData}</span>`);
                    },
                },
                {
                    targets: 2,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-G">${cellData}</span>`);
                    },
                },
                {
                    targets: 3,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-G">${cellData}</span>`);
                    },
                },
                {
                    targets: 4,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
                },
                {
                    targets: 5,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
                },
                {
                    targets: 6,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
                },
                {
                    targets: 7,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
                },
                {
                    targets: 8,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
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

        $(`#tableInventario tbody`).on("click", ".info-btn", function () {
            detalleCajas(this.dataset.lote);
        });
    } catch (error) {
        console.error("Error en cargarCajasLotes:", error);
    }

    return retorno;
}

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
