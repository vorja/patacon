import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_ORDEN = new ApiService("http://localhost:3105/data/encargo");
const API_CLIENTE = new ApiService("http://localhost:3105/data/cliente");
const API_EMPLEADOS = new ApiService("http://localhost:3105/data/empleados");

const alerts = new AlertManager();

/* const urls = [
    "http://localhost:3105/data/empleados/obtener-by-rol/RecursosHumanos",
    "http://localhost:3105/data/empleados/obtener-byrol-/Gerente",
    "http://localhost:3105/data/empleados/obtener-byrol-/Elaborador",
]; */

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsOrden = {
    formOrden: document.getElementById("formOrden"),
    fecha_solicitud: document.querySelector("#fecha_solicitud"),
    numero_orden: document.querySelector("#numero_orden"),
    lote_contenedor: document.querySelector("#lote_contenedor"),
    id_cliente: document.querySelector("#id_cliente"),
    inputSearch: document.querySelector("#search_cliente"),
    fecha_inicial: document.querySelector("#fecha_inicial"),
    fecha_estimada: document.querySelector("#fecha_estimada"),
    inputElaboracion: document.querySelector("#inputElaboracion"),
    id_elaboracion: document.querySelector("#id_elaboracion"),
    inputNotificacion: document.querySelector("#inputNotificacion"),
    id_notificacion: document.querySelector("#id_notificacion"),
    inputAutorizacion: document.querySelector("#inputAutorizacion"),
    id_autorizacion: document.querySelector("#id_autorizacion"),
    btnAgregar: document.getElementById("btnAgregar"),
    observaciones: document.querySelector("#observaciones"),
};

const listenerIds = {
    inputSearch: null,
    btnAgregar: null,
    formOrden: null,
};

export async function init() {
    try {
        await cargarOrdenes();
        await llenarResposables();
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
    if (elementsOrden.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsOrden.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsOrden.formOrden) {
        listenerIds.formOrden = eventManager.add(
            elementsOrden.formOrden,
            "submit",
            formOrden
        );
    }

    if (elementsOrden.inputSearch) {
        listenerIds.inputSearch = eventManager.addDebounced(
            elementsOrden.inputSearch,
            "input",
            buscarClientes,
            300
        );
    } else {
        console.warn("Input de búsqueda de Proveedores no encontrado");
    }

    const suggestionsClientes = document.getElementById("suggestions");
    if (suggestionsClientes) {
        eventManager.delegate(
            suggestionsClientes,
            "click",
            ".suggestion-item",
            handleSuggestionClick
        );
    }
    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarOrdenes() {
    const res = await API_ORDEN.get(`/obtener`);
    if (!res.success) {
        alerts.show(res);
    }
    const { data } = res;
    $("#tablaOrdenes").DataTable({
        data: data,
        searching: true,
        destroy: true,
        serverSide: false,
        responsive: true,
        orderCellsTop: true,
        deferRender: true,
        columns: [
            { data: "Numero" },
            { data: "Contenedor" },
            { data: "Cliente" },
            { data: "Solicitud" },
            { data: "Observaciones" },
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

    setupTableListeners("tablaOrdenes");
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
        await eliminarOrden(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoOrden(id);
    });
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalOrdenes").modal("show");
}

async function handleSuggestionClick(e) {
    const suggestionItem = e.target;
    const clienteId = suggestionItem.dataset.id;
    const cliente = suggestionItem.textContent;

    elementsOrden.inputSearch.value = cliente;
    elementsOrden.inputSearch.setAttribute("data-id", clienteId);
    elementsOrden.id_cliente.value = clienteId;

    console.log(clienteId);
    console.log(cliente);
    // Limpiar sugerencias
    document.getElementById("suggestions").innerHTML = "";
}

function renderSuggestions(resultados, container, tipo) {
    const fragment = document.createDocumentFragment();
    const maxResults = 10;
    const limited = resultados.slice(0, maxResults);

    if (tipo === "C") {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Nombre;
            div.dataset.id = orden.id;
            fragment.appendChild(div);
        });
    } else {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Nombre;
            div.dataset.id = orden.id;
            fragment.appendChild(div);
        });
    }

    container.innerHTML = "";
    container.appendChild(fragment);

    // Mostrar cantidad de resultados adicionales
    if (resultados.length > maxResults) {
        const moreDiv = document.createElement("div");
        moreDiv.classList.add("suggestion-more");
        moreDiv.textContent = `+${
            resultados.length - maxResults
        } resultados más...`;
        container.appendChild(moreDiv);
    }
}

async function buscarClientes() {
    const suggestions = document.getElementById("suggestions");
    const query = elementsOrden.inputSearch.value.toLowerCase().trim();

    if (query === "") {
        suggestions.innerHTML = "";
        return;
    }

    try {
        const response = await API_CLIENTE.get("/obtener", {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { clientes } = response.data;
        const resultados = clientes.filter((cliente) =>
            cliente.Nombre.toLowerCase().includes(query)
        );
        renderSuggestions(resultados, suggestions, "C");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

async function abrirEditar(idOrden) {
    const response = await API_ORDEN.get(`/obtener-id/${idOrden}`, {
        headers: { Authorization: "Bearer " + token },
    });

    const dataOrden = await response.json();

    if (!response.ok) {
        throw new Error("Error al obtener el la informaciòn del rol");
    }
    document.querySelector("#id_orden").value = dataOrden.id;
    elements.fecha_solicitud = dataOrden.fecha_solicitud;
    elements.numero_orden.value = dataOrden.numero_orden;
    elements.lote_contenedor.value = dataOrden.lote_contenedor;
    elements.id_cliente.value = dataOrden.id_cliente;
    elements.fecha_inicial = dataOrden.fecha_inicial;
    elements.fecha_estimada = dataOrden.fecha_estimada;
    elements.id_elaboracion.value = dataOrden.id_elaboracion;
    elements.id_notificacion.value = dataOrden.id_notificacion;
    elements.id_autorizacion.value = dataOrden.id_autorizacion;
    elements.observaciones.value = dataOrden.observaciones;

    $("#ModalOrdenes").modal("show");
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
    ["#tablaOrdenes"].forEach((tableId) => {
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
    document.querySelector("#formOrden").reset();
    document.querySelector("#id_orden").value = "";
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

function sanitizarCampos(datosOrden) {
    for (let key in datosOrden) {
        if (typeof datosOrden[key] === "string") {
            datosOrden[key] = escapeHtml(datosOrden[key].trim());
        }
    }
    const regexFecha = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    const regexNumeroOrden = /^\d+$/;
    const regexId = /^\d+$/;
    const regexContenedor = /^[a-zA-Z0-9]*$/;
    const regexObservaciones = /^[a-zA-Z ,]+$/;

    datosOrden.id_cliente = datosOrden.id_cliente?.toString().trim();
    datosOrden.id_autorizacion = datosOrden.id_autorizacion?.toString().trim();
    datosOrden.id_elaboracion = datosOrden.id_elaboracion?.toString().trim();

    if (!regexNumeroOrden.test(datosOrden.numero_orden)) {
        throw new Error("El Numero de Orden debe ser un dato Numerico.");
    }
    if (
        !regexId.test(datosOrden.id_cliente) ||
        !regexId.test(datosOrden.id_autorizacion) ||
        !regexId.test(datosOrden.id_elaboracion) ||
        !regexId.test(datosOrden.id_notificacion)
    ) {
        throw new Error("La refencia no es válida.");
    }

    if (
        !regexFecha.test(datosOrden.fecha_estimada) ||
        !regexFecha.test(datosOrden.fecha_inicial) ||
        !regexFecha.test(datosOrden.fecha_solicitud)
    ) {
        throw new Error(
            "El Formato de fecha no es valido. Debe ser YYYY-MM-dd."
        );
    }

    if (!regexContenedor.test(datosOrden.lote_contenedor)) {
        throw new Error(
            "El contenedor solo puede tener Alfanumericos y sin de espacios."
        );
    }
    if (!regexObservaciones.test(datosOrden.observaciones)) {
        throw new Error(
            "Las Observaciones solo puede contener letras, y espacios."
        );
    }
    return datosOrden;
}

async function formOrden(e) {
    e.preventDefault();

    const id = document.querySelector("#id_orden").value;
    const datosOrden = {
        fecha_solicitud: elements.fecha_solicitud.value,
        numero_orden: elements.numero_orden.value,
        lote_contenedor: elements.lote_contenedor.value,
        id_cliente: elements.id_cliente.value,
        fecha_inicial: elements.fecha_inicial.value,
        fecha_estimada: elements.fecha_estimada.value,
        id_elaboracion: elements.id_elaboracion.value,
        id_notificacion: elements.id_notificacion.value,
        id_autorizacion: elements.id_autorizacion.value,
        observaciones: elements.observaciones.value || "No hay Observaciones",
    };

    try {
        const orden = sanitizarCampos(datosOrden);
        const action = id ? actualizarOrden(id, orden) : guardarOrden(orden);
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
async function actualizarOrden(id, orden) {
    try {
        const response = await API_ORDEN.put(`/editar/${id}`, orden, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        } else {
            alerts.show(response);
            $("#ModalOrdenes").modal("hide");
            await cargarOrdenes();
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
async function guardarOrden(orden) {
    try {
        const response = await API_ORDEN.post("/crear", orden, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        } else {
            alerts.show(response);
            $("#ModalOrdenes").modal("hide");
            await cargarOrdenes();
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

async function eliminarOrden(id) {
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
            const response = await API_CLIENTE.delete(`/estado/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response) {
                alerts.show(response);
            } else {
                alerts.show(response);
                await cargarOrdenes();
            }
        }
    });

    await cargarOrdenes();
}

async function infoOrden(id) {
    try {
        const response = await API_ORDEN.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.success) {
            alerts.show(response);
            return;
        }
        const dataOrden = response.data;

        document.querySelector("#fecha_solicitud_info").value =
            dataOrden.fecha_solicitud;

        document.querySelector("#numero_orden_info").value =
            dataOrden.numero_orden;

        document.querySelector("#lote_empaque_info").value =
            dataOrden.lote_contenedor;

        document.querySelector(".cliente").value = dataOrden.id_cliente;

        document.querySelector("#fecha_inicial_info").value =
            dataOrden.fecha_inicial;

        document.querySelector("#fecha_estimada_info").value =
            dataOrden.fecha_estimada;

        document.querySelector("#inputElaboracion_info").value =
            dataOrden.id_elaboracion;

        document.querySelector("#inputAutorizacion_info").value =
            dataOrden.id_autorizacion;

        document.querySelector("#inputNotificacion_info").value =
            dataOrden.id_notificacion;

        document.querySelector("#observaciones_info").value =
            dataOrden.observaciones;

        $("#ModalInfoOrdenes").modal("show");
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

function fillDatalist(datalist, data) {
    datalist.innerHTML = ""; // Limpia opciones previas si existen
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nombre;
        option.dataset.id = item.id;
        datalist.appendChild(option);
    });
}

// Función para manejar el evento de input
function handleInput(datalist, inputId, idFieldId) {
    document.getElementById(inputId).addEventListener("input", (e) => {
        const selectedOption = datalist.querySelector(
            `option[value="${e.target.value}"]`
        );
        if (selectedOption) {
            document.getElementById(idFieldId).value =
                selectedOption.dataset.id;
        }
    });
}

async function llenarResposables() {
    const response = await API_EMPLEADOS.get(`/obtener-by-rol/Elaborador`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { responsables } = response.data;
    const empleadolist = document.getElementById("listElaboracion");

    fillDatalist(empleadolist, responsables);
    handleInput(empleadolist, "inputElaboracion", "id_elaboracion");
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