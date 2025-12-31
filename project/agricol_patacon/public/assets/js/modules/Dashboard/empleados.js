import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_EMPLEADOS = new ApiService("http://localhost:3105/data/empleados");
const API_ROLES = new ApiService("http://localhost:3105/data/rol");
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsEmpleados = {
    btnAgregar: document.getElementById("btnAgregar"),
    formEmpleado: document.getElementById("formEmpleado"),
    nombre: document.querySelector("#nombre"),
    identificacion: document.querySelector("#documento"),
    correo: document.querySelector("#correo"),
    telefono: document.querySelector("#telefono"),
    id_rol: document.querySelector("#id_rol"),
    rol: document.querySelector(".roles"),
};

const listenerIds = {
    btnAgregar: null,
    formEmpleado: null,
    tablaEmpleados: null,
};

async function init() {
    try {
        await cargarEmpleados();
        await llenarRoles();
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
    if (elementsEmpleados.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsEmpleados.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsEmpleados.formEmpleado) {
        listenerIds.formEmpleado = eventManager.add(
            elementsEmpleados.formEmpleado,
            "submit",
            formEmpleado
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarEmpleados() {
    try {
        const response = await API_EMPLEADOS.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.success) {
            alerts.show(response);
            return false;
        }
        const { responsables, conteo } = response.data;
        asignarConteo(conteo);

        $("#tablaEmpleados").DataTable({
            data: responsables,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "Rol" },
                { data: "Nombre" },
                { data: "Correo" },
                { data: "Identificacion" },
                { data: "Telefono" },
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

        setupTableListeners("tablaEmpleados");
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            timer: 2000,
            showConfirmButton: false,
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
        await eliminar(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoEmpleado(id);
    });
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalEmpleados").modal("show");
}

async function abrirEditar(idEmpleado) {
    const response = await API_EMPLEADOS.get(`/obtener-id/${idEmpleado}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
    }

    const { responsable } = response.data;
    document.querySelector("#id_empleado").value = responsable.id;
    elementsEmpleados.nombre.value = responsable.nombre;
    elementsEmpleados.identificacion.value = responsable.identificacion;
    elementsEmpleados.correo.value = responsable.correo;
    elementsEmpleados.telefono.value = responsable.telefono;
    elementsEmpleados.id_rol.value = responsable.Rol.id;
    $("#ModalEmpleados").modal("show");
}
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
    ["#tablaEmpleados"].forEach((tableId) => {
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
function limpiarFormulario() {
    document.querySelector("#formEmpleado").reset();
    document.querySelector("#id_empleado").value = "";
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

function sanitizarCampos(dataEmpleado, method) {
    // Limpieza previa.
    const dataFiltrado =
        method === "PUT"
            ? (({ password, ...rest }) => rest)(dataEmpleado)
            : dataEmpleado;

    for (let key in dataFiltrado) {
        if (typeof dataFiltrado[key] === "string") {
            dataFiltrado[key] = escapeHtml(dataFiltrado[key].trim());
        }
    }
    dataFiltrado.id_rol = dataFiltrado.id_rol?.toString().trim();

    // Expresiones regulares
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const regexRol = /^\d+$/;

    const regexDocumento = /^\d{9,12}$/;
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexTelefono = /^\d{10,11}$/;

    if (!dataFiltrado.id_rol || !regexRol.test(dataFiltrado.id_rol)) {
        throw new Error("Debe asignar un rol válido al nuevo usuario.");
    }

    if ((method = !"PUT")) {
        if (!regexPassword.test(dataFiltrado.password)) {
            throw new Error(
                "La contraseña debe tener al menos 1 letra minúscula, 1 letra mayúscula, 1 número y mínimo 8 caracteres."
            );
        }
    }

    if (!regexDocumento.test(dataFiltrado.identificacion)) {
        throw new Error(
            "El documento debe tener entre 10 y 11 dígitos numéricos consecutivos."
        );
    }

    if (!regexCorreo.test(dataFiltrado.correo)) {
        throw new Error(
            `El correo electrónico no es válido: ${dataFiltrado.correo}`
        );
    }

    if (!regexTelefono.test(dataFiltrado.telefono)) {
        throw new Error(
            "El teléfono debe tener entre 10 y 11 dígitos numéricos."
        );
    }

    if (!regexNombre.test(dataFiltrado.nombre)) {
        throw new Error("El nombre contiene caracteres no permitidos.");
    }

    return dataFiltrado;
}

async function formEmpleado(e) {
    e.preventDefault();
    const id = document.querySelector("#id_empleado").value;

    const datosEmpleados = {
        identificacion: elementsEmpleados.identificacion.value,
        nombre: elementsEmpleados.nombre.value,
        correo: elementsEmpleados.correo.value,
        telefono: elementsEmpleados.telefono.value,
        id_rol: parseInt(elementsEmpleados.rol.value),
    };

    try {
        const method = id ? "PUT" : "POST";
        const empleado = sanitizarCampos(datosEmpleados, method);
        const action = id
            ? actualizarEmpleado(id, empleado)
            : guardarEmpleado(empleado);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1800,
        });
    }
}

async function actualizarEmpleado(id, empleado) {
    try {
        const response = await API_EMPLEADOS.put(`/editar/${id}`, empleado, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });
        if (response.success) {
            alerts.show(response);
            $("#ModalEmpleados").modal("hide");
            await cargarEmpleados();
        } else {
            alerts.show(response);
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1800,
        });
    }
}

async function guardarEmpleado(empleado) {
    try {
        const response = await API_EMPLEADOS.post("/crear", empleado, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (response.success) {
            alerts.show(response);
            $("#ModalEmpleados").modal("hide");
            await cargarEmpleados();
        } else {
            alerts.show(response);
            return false;
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1800,
        });
    }
}

async function eliminar(id) {
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
            const response = await API_EMPLEADOS.delete(`/eliminar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            if (response.success) {
                alerts.show(response);
                return false;
            } else {
                alerts.show(response);
                await cargarEmpleados();
            }
        }
    });
}

async function infoEmpleado(id) {
    try {
        const response = await API_EMPLEADOS.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { responsable } = response.data;

        document.querySelector("#nombre_info").value = responsable.nombre;

        document.querySelector("#documento_info").value =
            responsable.identificacion;

        document.querySelector("#correo_info").value = responsable.correo;

        document.querySelector("#telefono_info").value = responsable.telefono;

        document.querySelector("#id_rol_info").value = responsable.Rol.nombre;

        $("#ModalInfoEmpleados").modal("show");
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
    const cardUsuarios = {
        Desgajador: document.querySelector("#Desgajador"),
        Cortador: document.querySelector("#Cortador"),
        Pelador: document.querySelector("#Pelador"),
        Fritador: document.querySelector("#Fritador"),
        Empacador: document.querySelector("#Empacador"),
        Termometrista: document.querySelector("#Termometrista"),
    };
    // Hacemos destructuración del objeto data
    data.forEach(({ nombre, cantidad }) => {
        const elemento = cardUsuarios[nombre];
        if (elemento) {
            elemento.textContent = parseInt(cantidad) ?? 0;
        }
    });
};

async function llenarRoles() {
    const response = await API_ROLES.get(`/obtener`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { roles } = response.data;
    const optionDefault = document.createElement("option");
    optionDefault.textContent = "-- Seleccionar --";
    optionDefault.value = "";
    let selectRol = document.querySelector("#id_rol");
    selectRol.appendChild(optionDefault);
    roles.forEach((rol, index) => {
        const option = document.createElement("option");
        option.value = rol.id;
        option.textContent = `${index + 1} - ${rol.Nombre}`;
        selectRol.appendChild(option);
    });
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

$(".roles").select2({
    theme: "bootstrap-5",
    width: "100%",
    placeholder: "Selecciona un rol",
    dropdownParent: $("#ModalEmpleados"),
    /*       allowClear: true, */
});
