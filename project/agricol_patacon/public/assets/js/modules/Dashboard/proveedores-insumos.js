import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_PROVEEDOR = new ApiService(
    "http://localhost:3105/data/proveedorInsumos"
);
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsProveedoresInsumos = {
    btnAgregar: document.getElementById("btnAgregar"),
    formProveedor: document.getElementById("formProveedor"),
    identificacion: document.querySelector("#documento"),
    nombre: document.querySelector("#nombre"),
    telefono: document.querySelector("#telefono"),
};
const listenerIds = {
    btnAgregar: null,
    formProveedor: null,
    tablaProveedoresInsumos: null,
};

export async function init() {
    try {
        await cargarProveedores();
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
    if (elementsProveedoresInsumos.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsProveedoresInsumos.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsProveedoresInsumos.formProveedor) {
        listenerIds.formProveedor = eventManager.add(
            elementsProveedoresInsumos.formProveedor,
            "submit",
            formProveedor
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarProveedores() {
    try {
        const response = await API_PROVEEDOR.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { proveedores, conteo } = response.data;

        asignarConteo(conteo);

        $("#tablaProveedoresInsumos").DataTable({
            data: proveedores,
            searching: true,
            destroy: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "Nombre" },
                { data: "Identificacion" },
                { data: "Movil" },
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
        <i class="fas fa-circle-info text-info me-2"></i> Información
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
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 15) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        setupTableListeners("tablaProveedoresInsumos");
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
    }
}

export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    cleanupDataTables();
}

function cleanupDataTables() {
    ["#tablaProveedoresInsumos"].forEach((tableId) => {
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

async function abrirEditar(idPoveedor) {
    
    const response = await API_PROVEEDOR.get(`/obtener-id/${idPoveedor}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }

    const { data } = response;

    document.querySelector("#id_proveedor").value = data.id;
    elementsProveedoresInsumos.nombre.value = data.nombre;
    elementsProveedoresInsumos.identificacion.value = data.identificacion;
    elementsProveedoresInsumos.telefono.value = data.movil;

    $("#ModalProveedorInsumos").modal("show");
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
        await eliminar(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoProveedor(id);
    });
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalProveedorInsumos").modal("show");
}

function limpiarFormulario() {
    document.querySelector("#formProveedor").reset();
    document.querySelector("#id_proveedor").value = "";
}

function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizarCampos(dataProveedor) {
    for (let key in dataProveedor) {
        if (typeof dataProveedor[key] === "string") {
            dataProveedor[key] = escapeHtml(dataProveedor[key].trim());
        }
    }

    // Expresiones regulares
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const regexDocumento = /^\d{9,12}$/;
    const regexTelefono = /^\d{10,11}$/;

    if (!regexDocumento.test(dataProveedor.identificacion)) {
        throw new Error(
            "El documento debe tener entre 9 y 12 dígitos numéricos consecutivos."
        );
    }

    if (!regexTelefono.test(dataProveedor.movil)) {
        throw new Error(
            "El teléfono debe tener entre 10 y 11 dígitos numéricos."
        );
    }

    if (!regexNombre.test(dataProveedor.nombre)) {
        throw new Error("El nombre contiene caracteres no permitidos.");
    }

    return dataProveedor;
}

async function formProveedor(e) {
    e.preventDefault();

    const id = document.querySelector("#id_proveedor").value;
    const datosProveedores = {
        nombre: elementsProveedoresInsumos.nombre.value,
        identificacion: elementsProveedoresInsumos.identificacion.value,
        movil: elementsProveedoresInsumos.telefono.value,
    };

    try {
        const proveedores = sanitizarCampos(datosProveedores);
        const action = id
            ? actualizarProveedor(id, proveedores)
            : guardarProveedor(proveedores);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

async function actualizarProveedor(id, proveedor) {
    try {
        const response = await API_PROVEEDOR.put(`/editar/${id}`, proveedor, {
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
            $("#ModalProveedorInsumos").modal("hide");
            await cargarProveedores();
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

async function guardarProveedor(proveedor) {
    try {
        const response = await API_PROVEEDOR.post("/crear", proveedor, {
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
            $("#ModalProveedorInsumos").modal("hide");
            await cargarProveedores();
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

async function eliminar(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminará el registro!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgba(16, 142, 214, 1)",
        cancelButtonColor: "#e24e0aff",
        confirmButtonText: "Sí, Eliminar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await API_PROVEEDOR.delete(`/eliminar/${id}`, {
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
                await cargarProveedores();
            }
        }
    });
}

async function infoProveedor(id) {
    try {
        const response = await API_PROVEEDOR.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.success) {
            alerts.show(response);
        }

        const { data } = response;
        document.querySelector("#nombre_info").value = data.nombre;

        document.querySelector("#documento_info").value = data.identificacion;

        document.querySelector("#telefono_info").value = data.movil;

        $("#ModalInfoproveedores").modal("show");
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
    const cardProveedores = {
        Provedores: document.querySelector("#Proveedores"),
    };
    cardProveedores.Provedores.textContent = data;
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
