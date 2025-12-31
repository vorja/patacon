import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_INV_MATERIA = new ApiService("http://localhost:3105/data/materia");
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

async function init() {
    try {
        await cargarMateria();
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

const asignarPromedio = (data) => {
    const cardPromedio = {
        maduro: document.querySelector("#totalMateria"),
    };
    cardPromedio.maduro.textContent = `${parseFloat(data.toFixed(1)) ?? 0} Kg`;
};

async function cargarMateria() {
    let retorno = false;
    try {
        const response = await API_INV_MATERIA.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            retorno = false;
            alerts.show(response);
            throw new Error("No hay información disponible.");
        }

        const { materia, maduro, totalMaduro } = response.data;

        asignarPromedio(totalMaduro);
        $(`#tablaMateria`).DataTable({
            data: materia,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "fecha_recepcion" },
                { data: "producto" },
                { data: "lote_proveedor" },
                { data: "materia_recp" },
                { data: "materia_proceso" },
                { data: "restante" },
                {
                    data: null,
                    render: (data, type, row) => `
 <div class="btn-group dropend">
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
  <li>
      <a class="dropdown-item d-flex align-items-center info-btn" data-lote="${row.lote_proveedor}" >
        <i class="fas fa-circle-info text-info me-2"></i> Información
        </a>
      </li>
  </ul>
</div>
                `,
                },
            ],
            columnDefs: [
                {
                    targets: 3, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )} `
                        );
                    },
                },
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
                {
                    targets: 5, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )} `
                        );
                    },
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

        $(`#tablaMaduro`).DataTable({
            data: maduro,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "fecha" },
                { data: "producto" },
                { data: "lote_proveedor" },
                { data: "cantidad" },
                {
                    data: null,
                    render: (data, type, row) => `
 <div class="btn-group dropend">
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
  <li>
      <a class="dropdown-item d-flex align-items-center info-btn" data-lote="${row.lote_proveedor}">
        <i class="fas fa-circle-info text-info me-2"></i> Información
        </a>
      </li>
  </ul>
</div>
                `,
                },
            ],
            columnDefs: [
                {
                    targets: 3, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )} `
                        );
                    },
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
        /* 
        setupTableListeners("tablaCanastillas"); */
    } catch (error) {
        console.error(error);
    }

    return retorno;
}

/* function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        const lote = this.dataset.lote;
        const tipo = this.dataset.tipo;
        await info(lote, id, tipo);
    });


} */

// Limpiadores
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
    ["#tablaMateria", "tablaMaduro"].forEach((tableId) => {
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
