import eventManager from "../../helpers/EventsManager.js";
import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_USUARIOS = new ApiService("http://localhost:3105/data/usuarios");
const API_ROLES = new ApiService("http://localhost:3105/data/rol");

const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsUsuarios = {
    btnAgregar: document.getElementById("btnAgregar"),
    formUsuario: document.getElementById("formUsuario"),
    nombre: document.querySelector("#nombre"),
    password: document.querySelector("#password"),
    id_rol: document.querySelector("#id_rol"),
    rol: document.querySelector(".roles"),
};
const listenerIds = {
    btnAgregar: null,
    formUsuario: null,
    tablaUsuarios: null,
};

async function init() {
    try {
        await cargarUsuarios();
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
    if (elementsUsuarios.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsUsuarios.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsUsuarios.formUsuario) {
        listenerIds.formUsuario = eventManager.add(
            elementsUsuarios.formUsuario,
            "submit",
            formUsuario
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarUsuarios() {
    try {
        const response = await API_USUARIOS.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
        }
        const { usuarios, conteo } = response.data;
        asignarConteo(conteo);

        $("#tablaUsuarios").DataTable({
            data: usuarios,
            searching: true,
            destroy: true,
            serverSide: false,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            responsive: true,
            columns: [
                { data: "Rol" },
                { data: "Nombre" },
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

        setupTableListeners("tablaUsuarios");
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
}

async function abrirEditar(idEmpleado) {
    const response = await API_USUARIOS.get(`/obtener-id/${idEmpleado}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response.message);
        return;
    }

    const { usuario } = response.data;
    document.querySelector("#id_usuario").value = usuario.id;
    elementsUsuarios.nombre.value = usuario.user_name;
    elementsUsuarios.id_rol.value = usuario.Rol.id;
    elementsUsuarios.password.setAttribute("disabled", "");
    $("#ModalUsuarios").modal("show");
}

function limpiarFormulario() {
    document.querySelector("#formUsuario").reset();
    document.querySelector("#id_usuario").value = "";
    elementsUsuarios.password.removeAttribute("disabled");
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalUsuarios").modal("show");
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
    ["#tablaUsuarios"].forEach((tableId) => {
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

function sanitizarCampos(dataEmpleado, method) {
    // Limpieza previa

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
    const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@_\-*!\.]{8,}$/;

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

    if (!regexNombre.test(dataFiltrado.nombre)) {
        throw new Error("El nombre contiene caracteres no permitidos.");
    }

    return dataFiltrado;
}

async function formUsuario(e) {
    e.preventDefault();
    const id = document.querySelector("#id_usuario").value;
    const datosEmpleados = {
        nombre: elements.nombre.value,
        password: elements.password.value,
        id_rol: parseInt(elements.rol.value),
    };

    try {
        const method = id ? "PUT" : "POST";
        const usuarios = sanitizarCampos(datosEmpleados, method);
        const action = id
            ? actualizarUsuario(id, usuarios)
            : guardarUsuario(usuarios);
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

async function actualizarUsuario(id, rol) {
    try {
        const response = await API_USUARIOS.put(`/editar/${id}`, rol, {
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
            await cargarUsuarios();
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

async function guardarUsuario(usuario) {
    try {
        const response = await API_USUARIOS.post("/crear", usuario, {
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
            await cargarUsuarios();
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
            const response = await API_USUARIOS.delete(`/eliminar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            if (!response.success) {
                alerts.show(response);
            } else {
                alerts.show(response);
                cargarUsuarios();
            }
        }
    });
}

const asignarConteo = (data) => {
    const cardUsuarios = {
        Gerencia: document.querySelector("#Gerencia"),
        Productor: document.querySelector("#Productor"),
        RRHH: document.querySelector("#RRHH"),
        Recepcion: document.querySelector("#Recepcion"),
        Corte: document.querySelector("#Corte"),
        Alistamiento: document.querySelector("#Alistamiento"),
        Fritura: document.querySelector("#Fritura"),
        Empaque: document.querySelector("#Empaque"),
        Cuartos: document.querySelector("#Cuartos"),
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
    const res = await API_ROLES.get(`/obtener-roles`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!res.success) {
        alerts.show(res);
    }
    const { roles } = res.data;
    let selectRol = document.querySelector("#id_rol");
    roles.forEach((rol, index) => {
        const option = document.createElement("option");
        option.value = rol.id;
        option.textContent = `${index + 1}- ${rol.Nombre}`;
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
    dropdownParent: $("#ModalUsuarios"),
    allowClear: true,
});
