import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js"; // Manejador de Alertas del servidor
import { AlertSystem } from "../../helpers/AlertasManger.js"; // Manjador de Alertas del cliente

import notificationManager from "../../helpers/NotificacionesManger.js";
import eventManager from "../../helpers/EventsManager.js";

const API_ROLES = new ApiService(Url + "/data/rol");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsRoles = {
    btnAgregar: document.getElementById("btnAgregar"),
    formRol: document.getElementById("formRol"),
};

const listenerIds = {
    btnAgregar: null,
    formRol: null,
    tablaRoles: null,
};

export async function init() {
    try {
        await cargarRoles();
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
    if (elementsRoles.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsRoles.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsRoles.formRol) {
        listenerIds.formRol = eventManager.add(
            elementsRoles.formRol,
            "submit",
            formRol
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalRoles").modal("show");
}

async function cargarRoles() {
    try {
        const response = await API_ROLES.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { roles, conteoRoles } = response.data;
        asignarConteo(conteoRoles);

        $("#tablaRoles").DataTable({
            data: roles,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            columns: [
                { data: "Nombre" },
                { data: "Descripcion" },
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
      <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}">
        <i class="fas fa-circle-info text-info me-2"></i> Info
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center edit-btn" data-id="${row.id}">
        <i class="fas fa-edit text-warning me-2"></i> Editar
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center delete-btn" data-id="${row.id}">
        <i class="fas fa-trash-alt text-danger me-2"></i> Eliminar
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
                if (numColumnas <= 10) {
                    $(".dataTables_paginate").hide();
                } else {
                    $(".dataTables_paginate").show();
                }
            },
            dom: "Bfrtip",
       
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        setupTableListeners("tablaRoles");
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

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".edit-btn", async function (e) {
        const id = this.dataset.id;
        await abrirEditar(id);
    });

    eventManager.delegate(table, "click", ".delete-btn", async function (e) {
        const id = this.dataset.id;
        await eliminarRol(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoRol(id);
    });
}

function limpiarFormulario() {
    document.getElementById("formRol").reset();
    document.getElementById("id_rol").value = "";
}
function sanitizarCampos(nombre, descripcion) {
    nombre = nombre.trim();
    descripcion = descripcion.trim();
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ]+$/;
    const regexDescripcion = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;

    if (!regexNombre.test(nombre)) {
        throw new Error(
            "El Nombre del Rol solo puede contener letras, sin espacios."
        );
    }
    if (!regexDescripcion.test(descripcion)) {
        throw new Error(
            "La Descripción solo puede contener letras, y espacios."
        );
    }
    return { nombre, descripcion };
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
    ["#tablaRoles"].forEach((tableId) => {
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

async function guardarRol(rol) {
    try {
        const response = await API_ROLES.post("/crear", rol, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
        } else {
            alerts.show(response);
            $("#ModalRoles").modal("hide");
            await cargarRoles();
        }
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

async function formRol(e) {
    e.preventDefault();
    const id = document.getElementById("id_rol").value;
    let nombre = document.getElementById("nombre").value;
    let descripcion = document.getElementById("descripcion").value;
    try {
        const rol = sanitizarCampos(nombre, descripcion);
        const action = id ? actualizarRol(id, rol) : guardarRol(rol);
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
async function actualizarRol(id, rol) {
    try {
        const response = await API_ROLES.put(`/editar/${id}`, rol, {
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
            $("#ModalRoles").modal("hide");
            await cargarRoles();
        }
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
async function abrirEditar(idRol) {
    const response = await API_ROLES.get(`/obtener-id/${idRol}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { data } = response;

    document.getElementById("id_rol").value = data.id;
    document.getElementById("nombre").value = data.nombre;
    document.getElementById("descripcion").value = data.descripcion;
    $("#ModalRoles").modal("show");
}
async function eliminarRol(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminará el registro!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#545554ff",
        confirmButtonText: "Sí, Eliminar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await API_ROLES.delete(`/eliminar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.success) {
                alerts.show(response);
            } else {
                alerts.show(response);
                await cargarRoles();
            }
        }
    });
}
async function infoRol(id) {
    try {
        const response = await API_ROLES.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { data } = response;

        document.querySelector("#nombre_info").value = data.nombre;

        document.querySelector("#descripcion_info").value = data.descripcion;

        $("#ModalInfoRoles").modal("show");
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
const asignarConteo = (data) => {
    const cardRoles = {
        Rol: document.querySelector("#Roles"),
    };
    cardRoles.Rol.textContent = data;
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
