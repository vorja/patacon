import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

// Inicializar
const API_CLIENTE = new ApiService(Url + "/data/cliente");
const API_EMPLEADOS = new ApiService(Url + "/data/empleados");

const alerts = new AlertManager();
const elements_cliente = {
    nombre: document.querySelector("#nombre"),
    puerto_embarque: document.querySelector("#puerto_embarque"),
    destino: document.querySelector("#destino"),
    numero_solicitud: document.querySelector("#numero_solicitud"),
    puerto_llegada: document.querySelector("#puerto_llegada"),
    orden_compra: document.querySelector("#orden_compra"),
    formCliente: document.querySelector("#formCliente"),
    btnAgregar: document.querySelector("#btnAgregar"),
};

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

async function init() {
    try {
        await cargarClientes();
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
    btnAgregar: null,
    formCliente: null,
    tablaClientes: null,
};

function setupEventListeners() {
    if (elements_cliente.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elements_cliente.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elements_cliente.formCliente) {
        listenerIds.formCliente = eventManager.add(
            elements_cliente.formCliente,
            "submit",
            formCliente
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarClientes() {
    const response = await API_CLIENTE.get(`/obtener`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { clientes, conteo } = response.data;
    asignarConteo(conteo);

    $("#tablaClientes").DataTable({
        data: clientes,
        searching: true,
        destroy: true,
        serverSide: false,
        responsive: true,
        orderCellsTop: true,
        deferRender: true,
        columns: [
            { data: "Nombre" },
            { data: "Destino" },
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
        responsive: true,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
        },
    });

    setupTableListeners("tablaClientes");
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
        await eliminarCliente(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoCliente(id);
    });
}

async function abrirEditar(idCliente) {
    const response = await API_CLIENTE.get(`/obtener-id/${idCliente}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }

    const { data } = response;

    document.querySelector("#id_cliente").value = data.id;
    elements_cliente.nombre.value = data.nombre;
    elements_cliente.puerto_embarque.value = data.puerto_embarque;
    elements_cliente.destino.value = data.destino;
    elements_cliente.puerto_llegada.value = data.puerto_llegada;
    elements_cliente.numero_solicitud.value = data.numero_solicitud;

    $("#ModalClientes").modal("show");
}

function limpiarFormulario() {
    document.querySelector("#formCliente").reset();
    document.querySelector("#id_cliente").value = "";
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
    ["#tablaClientes"].forEach((tableId) => {
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

function sanitizarCampos(datosCliente) {
    // Limpieza previa
    for (let key in datosCliente) {
        if (typeof datosCliente[key] === "string") {
            datosCliente[key] = escapeHtml(datosCliente[key].trim());
        }
    }
    // Expresiones regulares
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const regexDestino = /^[a-zA-Z ,]+$/;

    const regexEmbarque = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ,]+$/;
    const regexLlegada = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ,]+$/;

    if (!regexNombre.test(datosCliente.nombre)) {
        throw new Error(
            "El Nombre del Cliente solo puede contener caracteres."
        );
    }
    if (!regexDestino.test(datosCliente.destino)) {
        throw new Error("El Nombre del Destino solo puede contener letras.");
    }

    if (!regexEmbarque.test(datosCliente.puerto_embarque)) {
        throw new Error(
            "Ingrese datos validos en el campo de puerto de embarque. solo caracteres"
        );
    }
    if (!regexLlegada.test(datosCliente.puerto_llegada)) {
        throw new Error(
            "Ingrese datos validos en el campo de puerto de llegada, solo caracteres."
        );
    }
    return datosCliente;
}

async function formCliente(e) {
    e.preventDefault();
    const id = document.querySelector("#id_cliente").value;
    const datosCliente = {
        nombre: elements_cliente.nombre.value,
        puerto_embarque: elements_cliente.puerto_embarque.value,
        destino: elements_cliente.destino.value,
        puerto_llegada: elements_cliente.puerto_llegada.value,
        numero_solicitud: elements_cliente.numero_solicitud.value,
    };
    try {
        // Sanitiza y valida
        const cliente = sanitizarCampos(datosCliente);
        const action = id
            ? actualizarCliente(id, cliente)
            : guardarCliente(cliente);
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

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalClientes").modal("show");
}

async function guardarCliente(data) {
    try {
        const response = await API_CLIENTE.post("/crear", data, {
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
            $("#ModalClientes").modal("hide");
            await cargarClientes();
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

async function actualizarCliente(id, data) {
    try {
        const response = await API_CLIENTE.put(`/editar/${id}`, data, {
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
            $("#ModalClientes").modal("hide");
            await cargarClientes();
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

async function eliminarCliente(id) {
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
            const response = await API_CLIENTE.delete(`/eliminar/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            if (!response.success) {
                alerts.show(response);
            } else {
                alerts.show(response);
                await cargarClientes();
            }
        }
    });
}

async function infoCliente(id) {
    try {
        const response = await API_CLIENTE.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            throw new Error("Error al obtener la información del Cliente.");
        }

        const { data } = response;
        document.querySelector("#nombre_info").value = data.nombre;

        document.querySelector("#puerto_embarque_info").value =
            data.puerto_embarque;
        document.querySelector("#destino_info").value = data.destino;
        document.querySelector("#numero_solicitud_info").value =
            data.numero_solicitud;

        document.querySelector("#puerto_llegada_info").value =
            data.puerto_llegada;
        $("#ModalInfoClientes").modal("show");
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
    const cardCliente = {
        Cliente: document.querySelector("#Clientes"),
    };
    cardCliente.Cliente.textContent = data;
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