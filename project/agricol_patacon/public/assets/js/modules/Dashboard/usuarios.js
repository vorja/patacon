import eventManager from "../../helpers/EventsManager.js";
import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";

const API_USUARIOS = new ApiService(Url + "/data/usuarios");
const API_ROLES = new ApiService(Url + "/data/rol");

const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsUsuarios = {
    btnAgregar: document.getElementById("btnAgregar"),
    formUsuario: document.getElementById("formUsuario"),
    nombre: document.querySelector("#nombre"),
    password: document.querySelector("#password"),
    selectRol: document.querySelector("#selectRol"), // Cambiado de id_rol a selectRol
    filtroRol: document.querySelector("#filtroRol"), // Para el filtro de la tabla
    modalUsuarios: new bootstrap.Modal(
        document.getElementById("ModalUsuarios"),
    ),
    modalInfoUsuario: new bootstrap.Modal(
        document.getElementById("ModalInfoUsuario"),
    ),
    btnCambiarPassword: document.getElementById("btnCambiarPassword"),
    togglePassword: document.getElementById("togglePassword"),
    btnSubmitText: document.getElementById("btnSubmitText"),
};

const listenerIds = {
    btnAgregar: null,
    formUsuario: null,
    btnCambiarPassword: null,
    togglePassword: null,
};

async function init() {
    try {
        await llenarRoles();
        await cargarUsuarios();
        setupEventListeners();
        inicializarSelect2();
        setupTableFilter();
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
    // Botón agregar
    if (elementsUsuarios.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsUsuarios.btnAgregar,
            "click",
            handleAgregarClick,
        );
    }

    // Formulario
    if (elementsUsuarios.formUsuario) {
        listenerIds.formUsuario = eventManager.add(
            elementsUsuarios.formUsuario,
            "submit",
            formUsuario,
        );
    }

    // Botón cambiar contraseña
    if (elementsUsuarios.btnCambiarPassword) {
        listenerIds.btnCambiarPassword = eventManager.add(
            elementsUsuarios.btnCambiarPassword,
            "click",
            habilitarCambioPassword,
        );
    }

    // Toggle mostrar/ocultar contraseña
    if (elementsUsuarios.togglePassword) {
        listenerIds.togglePassword = eventManager.add(
            elementsUsuarios.togglePassword,
            "click",
            toggleVerPassword,
        );
    }

    // Evento cuando se cierra el modal
    document
        .getElementById("ModalUsuarios")
        .addEventListener("hidden.bs.modal", function () {
            limpiarFormulario();
        });
}

function setupTableFilter() {
    // Configurar el filtro de roles en la tabla
    if (elementsUsuarios.filtroRol) {
        eventManager.add(elementsUsuarios.filtroRol, "change", function () {
            const valor = this.value;
            const table = $("#tablaUsuarios").DataTable();

            if (valor === "") {
                table.columns(0).search("").draw();
            } else {
                table
                    .columns(0)
                    .search("^" + valor + "$", true, false)
                    .draw();
            }
        });
    }
}

async function cargarUsuarios() {
    try {
        const response = await API_USUARIOS.get(`/obtener`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { usuarios, conteo } = response.data;
        asignarConteo(conteo);

        // Destruir DataTable existente
        if ($.fn.DataTable.isDataTable("#tablaUsuarios")) {
            $("#tablaUsuarios").DataTable().destroy();
            $("#tablaUsuarios tbody").empty();
        }

        const table = $("#tablaUsuarios").DataTable({
            data: usuarios,
            searching: true,
            destroy: true,
            serverSide: false,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            responsive: true,
            columns: [
                {
                    data: "Rol",
                    render: function (data) {
                        return data || "Sin rol";
                    },
                },
                {
                    data: "Nombre",
                    render: function (data) {
                        return data || "Sin nombre";
                    },
                },
                {
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group dropend">
                                <button type="button" class="btn btn-light btn-sm dropdown-toggle"
                                    data-bs-toggle="dropdown" aria-expanded="false"
                                    style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu shadow-sm border-0 rounded-3">
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center info-btn" href="#" data-id="${row.id}">
                                            <i class="fas fa-circle-info text-info me-2"></i> Info
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center edit-btn" href="#" data-id="${row.id}">
                                            <i class="fas fa-edit text-warning me-2"></i> Editar
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center delete-btn" href="#" data-id="${row.id}">
                                            <i class="fas fa-trash-alt text-danger me-2"></i> Eliminar
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        `;
                    },
                },
            ],
            initComplete: function () {
                setupTableListeners();
            },
            drawCallback: function () {
                setupTableListeners();
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });
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

function setupTableListeners() {
    // Botón Editar
    $(document)
        .off("click", ".edit-btn")
        .on("click", ".edit-btn", async function (e) {
            e.preventDefault();
            const id = $(this).data("id");
            if (id) {
                await abrirEditar(id);
            }
        });

    // Botón Información
    $(document)
        .off("click", ".info-btn")
        .on("click", ".info-btn", async function (e) {
            e.preventDefault();
            const id = $(this).data("id");
            if (id) {
                await mostrarInformacion(id);
            }
        });

    // Botón Eliminar
    $(document)
        .off("click", ".delete-btn")
        .on("click", ".delete-btn", async function (e) {
            e.preventDefault();
            const id = $(this).data("id");
            if (id) {
                await eliminar(id);
            }
        });
}

async function abrirEditar(idUsuario) {
    try {
        const response = await API_USUARIOS.get(`/obtener-id/${idUsuario}`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { usuario } = response.data;

        // Llenar formulario
        document.querySelector("#id_usuario").value = usuario.id;
        elementsUsuarios.nombre.value = usuario.user_name || "";

        // Establecer el valor del rol
        if (usuario.Rol && usuario.Rol.id) {
            // Para Select2
            $(elementsUsuarios.selectRol).val(usuario.Rol.id).trigger("change");
            // Para el select nativo
            elementsUsuarios.selectRol.value = usuario.Rol.id;
        }

        // Configurar para modo edición
        elementsUsuarios.password.disabled = true;
        elementsUsuarios.password.placeholder = "Mantener contraseña actual";
        elementsUsuarios.password.required = false;
        elementsUsuarios.password.value = "";

        // Mostrar botón para cambiar contraseña
        elementsUsuarios.btnCambiarPassword.classList.remove("d-none");

        // Cambiar título y texto del botón
        document.querySelector("#modalFrituraLabel").textContent =
            "EDITAR USUARIO";
        elementsUsuarios.btnSubmitText.textContent = "Actualizar";

        // Mostrar modal
        elementsUsuarios.modalUsuarios.show();
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la información del usuario.",
            timer: 2000,
        });
    }
}

function habilitarCambioPassword() {
    elementsUsuarios.password.disabled = false;
    elementsUsuarios.password.required = true;
    elementsUsuarios.password.placeholder = "Ingrese nueva contraseña";
    elementsUsuarios.password.focus();

    // Ocultar botón después de habilitar
    elementsUsuarios.btnCambiarPassword.classList.add("d-none");

    Swal.fire({
        icon: "info",
        title: "Cambiar Contraseña",
        text: "Ahora puede ingresar una nueva contraseña",
        timer: 1500,
        showConfirmButton: false,
    });
}

async function mostrarInformacion(idUsuario) {
    try {
        const response = await API_USUARIOS.get(`/obtener-id/${idUsuario}`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { usuario } = response.data;

        document.getElementById("info-nombre").textContent = usuario.user_name || "N/A";
        document.getElementById("info-rol").textContent = usuario.Rol?.nombre || "Sin rol";

        // Manejar fechas
        const fechaCreacion = usuario.createdAt
            ? new Date(usuario.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "No disponible";

        const fechaActualizacion = usuario.updatedAt
            ? new Date(usuario.updatedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "No disponible";

        elementsUsuarios.modalInfoUsuario.show();
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la información del usuario.",
            timer: 2000,
        });
    }
}

function limpiarFormulario() {
    document.querySelector("#formUsuario").reset();
    document.querySelector("#id_usuario").value = "";

    // Restablecer campo de contraseña
    elementsUsuarios.password.disabled = false;
    elementsUsuarios.password.required = true;
    elementsUsuarios.password.placeholder = "Ingrese la contraseña..";
    elementsUsuarios.password.value = "";

    // Ocultar botón de cambiar contraseña
    elementsUsuarios.btnCambiarPassword.classList.add("d-none");

    // Resetear Select2 y select nativo
    $(elementsUsuarios.selectRol).val(null).trigger("change");
    elementsUsuarios.selectRol.value = "";

    // Restaurar título y texto del botón
    document.querySelector("#modalFrituraLabel").textContent =
        "REGISTRAR USUARIO";
    elementsUsuarios.btnSubmitText.textContent = "Registrar";

    // Restablecer tipo de input de password
    elementsUsuarios.password.type = "password";
    if (elementsUsuarios.togglePassword) {
        elementsUsuarios.togglePassword.innerHTML =
            '<i class="fas fa-eye"></i>';
    }
}

function handleAgregarClick() {
    limpiarFormulario();
    elementsUsuarios.modalUsuarios.show();
}

function toggleVerPassword() {
    const type =
        elementsUsuarios.password.getAttribute("type") === "password"
            ? "text"
            : "password";
    elementsUsuarios.password.setAttribute("type", type);

    // Cambiar icono
    const icon = elementsUsuarios.togglePassword.querySelector("i");
    if (type === "password") {
        icon.className = "fas fa-eye";
    } else {
        icon.className = "fas fa-eye-slash";
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizarCampos(dataEmpleado, method) {
    const dataFiltrado = { ...dataEmpleado };

    for (let key in dataFiltrado) {
        if (typeof dataFiltrado[key] === "string") {
            dataFiltrado[key] = escapeHtml(dataFiltrado[key].trim());
        }
    }

    if (dataFiltrado.id_rol) {
        dataFiltrado.id_rol = dataFiltrado.id_rol.toString().trim();
    }

    // Expresiones regulares
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/;
    const regexRol = /^\d+$/;
    const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@_\-*!\.]{8,}$/;

    if (!dataFiltrado.id_rol || !regexRol.test(dataFiltrado.id_rol)) {
        throw new Error("Debe asignar un rol válido al usuario.");
    }

    // Validar contraseña solo si está presente (para edición)
    if (dataFiltrado.password && dataFiltrado.password.trim() !== "") {
        if (!regexPassword.test(dataFiltrado.password)) {
            throw new Error(
                "La contraseña debe tener al menos 8 caracteres, 1 letra minúscula, 1 letra mayúscula y 1 número.",
            );
        }
    } else if (method === "POST") {
        throw new Error("La contraseña es obligatoria para crear un usuario.");
    }

    if (!regexNombre.test(dataFiltrado.nombre)) {
        throw new Error(
            "El nombre contiene caracteres no permitidos. Solo letras y espacios.",
        );
    }

    return dataFiltrado;
}

async function formUsuario(e) {
    e.preventDefault();
    const id = document.querySelector("#id_usuario").value;

    const datosEmpleados = {
        user_name: elementsUsuarios.nombre.value,
        password: elementsUsuarios.password.value,
        id_rol: parseInt(elementsUsuarios.selectRol.value), // Usar selectRol
    };

    try {
        const method = id ? "PUT" : "POST";
        const usuarioSanitizado = sanitizarCampos(datosEmpleados, method);

        let success = false;
        if (id) {
            success = await actualizarUsuario(id, usuarioSanitizado);
        } else {
            success = await guardarUsuario(usuarioSanitizado);
        }

        if (success) {
            // Cerrar modal y recargar datos
            elementsUsuarios.modalUsuarios.hide();
            await cargarUsuarios();
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: true,
        });
    }
}

async function actualizarUsuario(id, usuario) {
    try {
        // Si no se cambió la contraseña, eliminarla del objeto
        if (!usuario.password || usuario.password.trim() === "") {
            delete usuario.password;
        }

        const response = await API_USUARIOS.put(`/editar/${id}`, usuario, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        alerts.show(response);
        return response.success;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al actualizar usuario",
            showConfirmButton: true,
        });
        return false;
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

        alerts.show(response);
        return response.success;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al crear usuario",
            showConfirmButton: true,
        });
        return false;
    }
}

async function eliminar(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminará el usuario permanentemente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#545554ff",
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "Cancelar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await API_USUARIOS.delete(`/eliminar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            alerts.show(response);
            if (response.success) {
                await cargarUsuarios();
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

    data.forEach(({ nombre, cantidad }) => {
        const elemento = cardUsuarios[nombre];
        if (elemento) {
            elemento.textContent = parseInt(cantidad) || 0;
        }
    });
};

async function llenarRoles() {
    try {
        const res = await API_ROLES.get(`/obtener-roles`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!res.success) {
            alerts.show(res);
            return;
        }

        const { roles } = res.data;

        // Llenar el select del modal
        if (elementsUsuarios.selectRol) {
            elementsUsuarios.selectRol.innerHTML =
                "<option selected disabled>...</option>";

            roles.forEach((rol, index) => {
                const option = document.createElement("option");
                option.value = rol.id;
                option.textContent = `${index + 1}- ${rol.Nombre}`;
                elementsUsuarios.selectRol.appendChild(option);
            });
        }

        // Llenar el filtro de la tabla
        if (elementsUsuarios.filtroRol) {
            elementsUsuarios.filtroRol.innerHTML =
                '<option value="">Todos</option>';
            roles.forEach((rol) => {
                const option = document.createElement("option");
                option.value = rol.Nombre;
                option.textContent = rol.Nombre;
                elementsUsuarios.filtroRol.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar roles:", error);
    }
}

function inicializarSelect2() {
    $(".roles").select2({
        theme: "bootstrap-5",
        width: "100%",
        placeholder: "Selecciona un rol",
        dropdownParent: $("#ModalUsuarios"),
        allowClear: true,
    });
}

// Cleanup function
export function cleanup() {
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    // Limpiar listeners de jQuery
    $(document).off("click", ".edit-btn");
    $(document).off("click", ".info-btn");
    $(document).off("click", ".delete-btn");

    // Limpiar filtro
    if (elementsUsuarios.filtroRol) {
        eventManager.removeAll(elementsUsuarios.filtroRol);
    }

    // Limpiar DataTables
    if ($.fn.DataTable.isDataTable("#tablaUsuarios")) {
        $("#tablaUsuarios").DataTable().destroy();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);
