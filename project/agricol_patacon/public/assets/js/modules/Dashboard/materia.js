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

        // Limpiar DataTables existentes
        cleanupDataTables();

        // Crear DataTable para materia prima
        const tablaMateriaDT = $(`#tablaMateria`).DataTable({
            data: materia,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "lfrtip",
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "Todos"],
            ],
            pageLength: 10,
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
  <button type="button" class="btn btn-light btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
    <li>
      <a class="dropdown-item d-flex align-items-center info-btn" href="#" data-lote="${row.lote_proveedor}" data-id="${row.id}" data-tipo="materia">
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
                                cellData.toFixed(1),
                            )} Kg`,
                        );
                    },
                },
                {
                    targets: 4, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1),
                            )} Kg`,
                        );
                    },
                },
                {
                    targets: 5, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1),
                            )} Kg`,
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
                let pageLength = api.page.len(); // Obtiene el pageLength actual
                let tableWrapper = $(api.table().container());

                // Solo ocultar si los registros son MENOS o IGUALES que el pageLength
                if (numRegistros <= pageLength) {
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

        // Crear DataTable para plátano maduro
        const tablaMaduroDT = $(`#tablaMaduro`).DataTable({
            data: maduro,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "lfrtip",
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "Todos"],
            ],
            pageLength: 10,
            columns: [
                { data: "fecha" },
                { data: "producto" },
                { data: "lote_proveedor" },
                { data: "cantidad" },
                {
                    data: null,
                    render: (data, type, row) => `
 <div class="btn-group dropend">
  <button type="button" dysplay="block" class="btn btn-light btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
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
                                cellData.toFixed(1),
                            )} Kg`,
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
                let pageLength = api.page.len(); // Obtiene el pageLength actual
                let tableWrapper = $(api.table().container());
                
                // Solo ocultar si los registros son MENOS o IGUALES que el pageLength
                if (numRegistros <= pageLength) {
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

        retorno = true;
    } catch (error) {
        console.error("Error al cargar materia prima:", error);
        alerts.show({
            success: false,
            message: "Error al cargar los datos: " + error.message,
        });
    }

    return retorno;
}

// Función para mostrar información detallada
async function info(lote, id, tipo) {
    try {
        cleanupInfoTables();
        // Mostrar carga
        Swal.fire({
            title: "Cargando información...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        let endpoint;
        if (tipo === "materia") {
            endpoint = `/detalle/materia/${id}`;
        } else if (tipo === "maduro") {
            endpoint = `/detalle/maduro/${id}`;
        } else {
            throw new Error("Tipo no válido");
        }

        const response = await API_INV_MATERIA.get(endpoint, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            Swal.close();
            alerts.show(response);
            return;
        }

        const data = response.data;

        // Actualizar título del modal
        const modalTitle = document.getElementById("modalInfoRecepcionLabel");
        if (tipo === "materia") {
            modalTitle.textContent = `INFORMACIÓN DE MATERIA PRIMA - Lote: ${lote}`;
        } else {
            modalTitle.textContent = `INFORMACIÓN DE PLÁTANO MADURO - Lote: ${lote}`;
        }

        // Mostrar información principal
        const infoPrincipal = document.getElementById("infoPrincipal");
        if (tipo === "materia") {
            infoPrincipal.innerHTML = `
                <div class="col-md-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Fecha Recepción</h6>
                                    <p class="fw-bold">${data.registro.fecha_recepcion}</p>
                                </div>
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Producto</h6>
                                    <p class="fw-bold">${data.registro.producto}</p>
                                </div>
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Lote Proveedor</h6>
                                    <p class="fw-bold">${data.registro.lote_proveedor}</p>
                                </div>
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Materia Restante</h6>
                                    <p class="fw-bold">${data.registro.restante.toFixed(1)} Kg</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Materia Recepcionada</h6>
                                    <p class="fw-bold">${data.registro.materia_recp} Kg</p>
                                </div>
                                <div class="col-md-3">
                                    <h6 class="text-muted mb-1">Materia Procesada</h6>
                                    <p class="fw-bold">${data.registro.materia_proceso} Kg</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-muted mb-1">Proveedor</h6>
                                    <p class="fw-bold">${data.registro.proveedor}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Llenar información de recepción OP
        const infoRecepcionDiv = document.getElementById("infoRecepcionOp");
        if (data.recepcion_op) {
            infoRecepcionDiv.innerHTML = `
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <h6 class="text-muted mb-1">Fecha Recepción OP</h6>
                                <p class="fw-bold">${data.recepcion_op.fecha}</p>
                            </div>
                            <div class="col-md-4">
                                <h6 class="text-muted mb-1">Fecha Procedimiento</h6>
                                <p class="fw-bold">${data.recepcion_op.fecha_procedimiento}</p>
                            </div>
                            <div class="col-md-4">
                                <h6 class="text-muted mb-1">Variedad</h6>
                                <p class="fw-bold">${data.recepcion_op.variedad}</p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-3">
                                <h6 class="text-muted mb-1">Total Canastillas</h6>
                                <p class="fw-bold">${data.recepcion_op.total_canastillas}</p>
                            </div>
                            <div class="col-md-3">
                                <h6 class="text-muted mb-1">Sub Total</h6>
                                <p class="fw-bold">${data.recepcion_op.sub_total}</p>
                            </div>
                            <div class="col-md-3">
                                <h6 class="text-muted mb-1">Peso Total</h6>
                                <p class="fw-bold">${data.recepcion_op.peso_total} Kg</p>
                            </div>
                            <div class="col-md-3">
                                <h6 class="text-muted mb-1">Estado</h6>
                                <p class="fw-bold">${data.recepcion_op.estado === 1 ? "Activo" : "Inactivo"}</p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <h6 class="text-muted mb-1">Orden de Producción</h6>
                                <p class="fw-bold">${data.recepcion_op.orden || "N/A"}</p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted mb-1">Observaciones</h6>
                                <p class="fw-bold">${data.recepcion_op.observaciones || "Sin observaciones"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            infoRecepcionDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay información de recepción OP disponible para este lote.
                </div>
            `;
        }

        // Llenar tabla de detalle recepción
        const tbodyDetalle = document.getElementById("tbodyDetalleRecepcion");
        tbodyDetalle.innerHTML = "";

        let totalCanastillas = 0;
        let totalPeso = 0;

        if (data.detalle_recepcion_op && data.detalle_recepcion_op.length > 0) {
            // Calcular totales mientras se recorren los detalles
            data.detalle_recepcion_op.forEach((detalle, index) => {
                totalCanastillas += parseInt(detalle.canastilla) || 0;
                totalPeso += parseFloat(detalle.peso) || 0;

                const row = document.createElement("tr");
                row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="text-center">${detalle.canastilla}</td>
            <td class="text-center">${detalle.peso} Kg</td>
        `;
                tbodyDetalle.appendChild(row);
            });

            // Agregar fila de totales
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";
            totalRow.style.backgroundColor = "#f8f9fa";
            totalRow.innerHTML = `
        <td class="text-center"><strong>TOTAL</strong></td>
        <td class="text-center"><strong>${totalCanastillas}</strong></td>
        <td class="text-center"><strong>${totalPeso.toFixed(2)} Kg</strong></td>
    `;
            tbodyDetalle.appendChild(totalRow);
        } else {
            tbodyDetalle.innerHTML = `
        <tr>
            <td colspan="3" class="text-center text-muted">
                No hay detalles de recepción disponibles
            </td>
        </tr>
    `;
        }

        // Llenar tabla de plátano maduro relacionado
        const tbodyMaduro = document.getElementById("tbodyMaduroRelacionado");
        tbodyMaduro.innerHTML = "";

        if (data.maduro_relacionado && data.maduro_relacionado.length > 0) {
            data.maduro_relacionado.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="text-center">${item.fecha || "N/A"}</td>
                    <td class="text-center">${item.producto || "N/A"}</td>
                    <td class="text-center">${item.lote_proveedor || "N/A"}</td>
                    <td class="text-center">${item.cantidad ? item.cantidad.toFixed(1) + " Kg" : "N/A"}</td>
                    <td class="text-center">${item.observaciones || "Sin observaciones"}</td>
                `;
                tbodyMaduro.appendChild(row);
            });
        } else {
            tbodyMaduro.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        No hay plátano maduro relacionado disponible
                    </td>
                </tr>
            `;
        }

        // Cerrar SweetAlert antes de mostrar el modal
        Swal.close();

        // Obtener la instancia del modal
        const modalElement = document.getElementById("ModalInfo");

        // Agregar event listener para cuando se cierra el modal
        const handleModalClose = () => {
            // Remover el backdrop si existe
            const backdrop = document.querySelector(".modal-backdrop");
            if (backdrop) {
                backdrop.remove();
            }

            // Remover las clases de modal-open del body
            document.body.classList.remove("modal-open");
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";

            // Limpiar contenido
            cleanupInfoTables();

            // Remover este event listener para evitar acumulación
            modalElement.removeEventListener(
                "hidden.bs.modal",
                handleModalClose,
            );
        };

        // Añadir event listener para el cierre del modal
        modalElement.addEventListener("hidden.bs.modal", handleModalClose);

        // Mostrar el modal usando Bootstrap
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error("Error al cargar información detallada:", error);
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la información: " + error.message,
        });
    }
}

// Función para limpiar tablas del modal
function cleanupInfoTables() {
    // Solo limpiar si las tablas existen
    const tables = ["#tablaDetalleRecepcion", "#tablaMaduroRelacionado"];
    tables.forEach((tableId) => {
        const table = $(tableId);
        if (table.length > 0) {
            try {
                // Verificar si es una DataTable
                if ($.fn.DataTable && $.fn.DataTable.isDataTable(tableId)) {
                    $(tableId).DataTable().destroy();
                }
                // Limpiar contenido
                table.find("tbody").empty();
            } catch (error) {
                console.warn(`Error al limpiar tabla ${tableId}:`, error);
            }
        }
    });
}

// Función para limpiar DataTables principales
function cleanupDataTables() {
    const mainTables = ["#tablaMateria", "#tablaMaduro"];
    mainTables.forEach((tableId) => {
        const table = $(tableId);
        if (table.length > 0) {
            try {
                if ($.fn.DataTable && $.fn.DataTable.isDataTable(tableId)) {
                    $(tableId).DataTable().destroy();
                }
            } catch (error) {
                console.warn(`Error al limpiar DataTable ${tableId}:`, error);
            }
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Usar event delegation para los botones de información
    listenerIds.tablaMateria = eventManager.delegate(
        document.body,
        "click",
        "#tablaMateria .info-btn",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            const lote = this.dataset.lote;
            const id = this.dataset.id;
            const tipo = this.dataset.tipo;
            info(lote, id, tipo);
        },
    );

    listenerIds.tablaMaduro = eventManager.delegate(
        document.body,
        "click",
        "#tablaMaduro .info-btn",
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            const lote = this.dataset.lote;
            const id = this.dataset.id;
            const tipo = this.dataset.tipo;
            info(lote, id, tipo);
        },
    );
}

// Función de limpieza global
export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    // Limpiar DataTables principales
    cleanupDataTables();

    // Limpiar el modal si está abierto
    const modalElement = document.getElementById("ModalInfo");
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }

        // Remover el backdrop si existe
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.remove();
        }

        // Restaurar el estado del body
        document.body.classList.remove("modal-open");
        document.body.style.paddingRight = "";
        document.body.style.overflow = "";
    }
}

export function reloadEventListeners() {
    cleanup();
    setupEventListeners();
}

// Función para manejar el cierre del modal de manera segura
function safeModalClose() {
    const modalElement = document.getElementById("ModalInfo");
    if (modalElement) {
        // Ocultar el modal
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }

        // Limpiar manualmente lo que Bootstrap no limpia
        setTimeout(() => {
            const backdrop = document.querySelector(".modal-backdrop");
            if (backdrop) {
                backdrop.remove();
            }

            document.body.classList.remove("modal-open");
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";

            // Forzar un reflow para asegurar que los estilos se apliquen
            document.body.style.display = "none";
            document.body.offsetHeight; // trigger reflow
            document.body.style.display = "";
        }, 150);
    }
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
