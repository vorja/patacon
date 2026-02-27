import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_REFERENCIAS = new ApiService(Url + "/data/referencias");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsRederencias = {
    btnAgregar: document.getElementById("btnAgregar"),
    formReferencia: document.getElementById("formReferencia"),
};
export async function init() {
    try {
        await cargarReferencias();
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
    formReferencia: null,
    tablaReferencias: null,
};

function setupEventListeners() {
    if (elementsRederencias.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsRederencias.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsRederencias.formReferencia) {
        listenerIds.formReferencia = eventManager.add(
            elementsRederencias.formReferencia,
            "submit",
            formReferencias
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarReferencias() {
    try {
        const response = await API_REFERENCIAS.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { referencias, conteoReferencias } = response.data;
        asignarConteo(conteoReferencias);
        $("#tablaReferencias").DataTable({
            data: referencias,
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

        setupTableListeners("tablaReferencias");
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
        await eliminarReferencia(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoReferencia(id);
    });
}

function limpiarFormulario() {
    document.getElementById("formReferencia").reset();
    document.getElementById("id_referencia").value = "";
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
    ["#tablaReferencias"].forEach((tableId) => {
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

async function guardarReferencia(referencia) {
    try {
        const response = await API_REFERENCIAS.post("/crear", referencia, {
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
            $("#ModalReferencias").modal("hide");
            await cargarReferencias();
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

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalReferencias").modal("show");
}

async function formReferencias(e) {
    e.preventDefault();
    const id = document.getElementById("id_referencia").value;
    let nombre = document.getElementById("nombre").value;
    let descripcion = document.getElementById("descripcion").value;
    try {
        const referencia = sanitizarCampos(nombre, descripcion);
        const action = id
            ? actualizarReferencia(id, referencia)
            : guardarReferencia(referencia);
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

async function actualizarReferencia(id, rol) {
    try {
        const response = await API_REFERENCIAS.put(`/editar/${id}`, rol, {
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
            $("#ModalReferencias").modal("hide");
            await cargarReferencias();
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

async function abrirEditar(idReferencia) {
    const response = await API_REFERENCIAS.get(`/obtener-id/${idReferencia}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { data } = response;

    document.getElementById("id_referencia").value = data.id;
    document.getElementById("nombre").value = data.nombre;
    document.getElementById("descripcion").value = data.descripcion;
    $("#ModalReferencias").modal("show");
}

async function eliminarReferencia(id) {
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
            const response = await API_REFERENCIAS.delete(`/eliminar/${id}`, {
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
                await cargarReferencias();
            }
        }
    });
}

async function infoReferencia(id) {
    try {
        const response = await API_REFERENCIAS.get(`/obtener-id/${id}`, {
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

        $("#ModalInfoReferencia").modal("show");
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
    const cardReferencia = {
        Referencia: document.querySelector("#Referencia"),
    };
    cardReferencia.Referencia.textContent = data;
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