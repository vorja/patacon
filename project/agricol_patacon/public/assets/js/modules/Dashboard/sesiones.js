import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";
import eventManager from "../../helpers/EventsManager.js";
const API_HISTORIAL = new ApiService("http://localhost:3105/data/historial");

const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

async function init() {
    try {
        await cargarSesiones();
    } catch (error) {
        console.error("Error al inicializar:", error);
        Swal.fire({
            icon: "error",
            title: "Error de Inicialización",
            text: "No se pudo cargar la aplicación correctamente.",
        });
    }
}

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".finalizar-btn", async function (e) {
        const id = this.dataset.usuario;
        await finalizar(id);
    });
}

async function cargarSesiones() {
    try {
        const response = await API_HISTORIAL.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { sesiones, activos } = response.data;
        asignarConteo(activos);
        $("#tablaSesiones").DataTable({
            data: sesiones,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            destroy: true,
            pageLength: 15,
            dom: "Bfrtip",
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 15) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            columns: [
                {
                    data: "Actividad",
                    defaultContent: "",
                    render: function (data, type, row) {
                        if (type !== "display") return data;

                        const val = (data ?? "").toString().trim();
                        // Normaliza para comparar sin tildes y sin sensibilidad a mayúsculas
                        const norm = val
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                            .toLowerCase();

                        const enLinea =
                            norm === "conectado" ||
                            norm === "online" ||
                            val === true;

                        return enLinea
                            ? '<span class="badge bg-success rounded-pill fw-bold ">Conectado</span>'
                            : '<span class="badge bg-danger rounded-pill fw-bold">Desconectado</span>';
                    },
                },
                { data: "Usuario" },
                { data: "Navegador" },
                { data: "Ip" },
                { data: "SO" },
                { data: "Conexion" },
                { data: "Desconexion" },
                { data: "Creado" },
                { data: "Expirado" },
                {
                    data: null,
                    render: (data, type, row) => `

                     <div class="btn-group dropend">
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions" >
    <li>
      <a class="dropdown-item d-flex align-items-center finalizar-btn" data-id="${row.id}" data-usuario="${row.id_usuario}">
        Cerrar Sesión <i class="fas fa-door-closed text-danger"></i> 
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
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });

        setupTableListeners("tablaSesiones");
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

async function finalizar(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Desea Finalizar la sesion del usuario!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgba(44, 108, 228, 1)",
        cancelButtonColor: "#dd0808ff",
        confirmButtonText: "Sí, Finalizar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await API_HISTORIAL.delete(`/finalizar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            if (!response.success) {
                alerts.show(response);
                return false;
            } else {
                alerts.show(response);
                await cargarSesiones();
            }
        }
    });
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
    ["#tablaSesiones"].forEach((tableId) => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
            $(tableId).empty();
        }
    });
}

export function reloadEventListeners() {
    cleanup();
}
const asignarConteo = (data) => {
    const cardSesiones = {
        Usuario: document.querySelector("#Usuarios"),
    };
    cardSesiones.Usuario.textContent = data || 0;
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
