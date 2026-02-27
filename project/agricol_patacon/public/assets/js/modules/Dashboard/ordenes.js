import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_ORDEN = new ApiService(Url + "/data/encargo");
const API_CLIENTE = new ApiService(Url + "/data/cliente");
const API_EMPLEADOS = new ApiService(Url + "/data/empleados");

const alerts = new AlertManager();

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
        setupResponsablesListeners();
    } catch (error) {
        console.error("Error al inicializar:", error);
        Swal.fire({
            icon: "error",
            title: "Error de Inicialización",
            text: "No se pudo cargar la aplicación correctamente.",
        });
    }
}

function setupResponsablesListeners() {
    // Listener para elaboración
    if (elementsOrden.inputElaboracion) {
        elementsOrden.inputElaboracion.addEventListener('input', function() {
            const datalist = document.getElementById('listElaboracion');
            const option = datalist.querySelector(`option[value="${this.value}"]`);
            if (option) {
                elementsOrden.id_elaboracion.value = option.dataset.id;
            } else {
                elementsOrden.id_elaboracion.value = "";
            }
        });
    }

    // Listener para notificación
    if (elementsOrden.inputNotificacion) {
        elementsOrden.inputNotificacion.addEventListener('input', function() {
            const datalist = document.getElementById('listNotificacion');
            const option = datalist.querySelector(`option[value="${this.value}"]`);
            if (option) {
                elementsOrden.id_notificacion.value = option.dataset.id;
            } else {
                elementsOrden.id_notificacion.value = "";
            }
        });
    }

    // Listener para autorización
    if (elementsOrden.inputAutorizacion) {
        elementsOrden.inputAutorizacion.addEventListener('input', function() {
            const datalist = document.getElementById('listAutorizacion');
            const option = datalist.querySelector(`option[value="${this.value}"]`);
            if (option) {
                elementsOrden.id_autorizacion.value = option.dataset.id;
            } else {
                elementsOrden.id_autorizacion.value = "";
            }
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
    try {
        console.log("Cargando órdenes...");
        const res = await API_ORDEN.get(`/obtener`);

        console.log("Respuesta completa de API:", res);

        if (!res.success) {
            console.error("Error al cargar órdenes:", res);
            alerts.show(res);
            return;
        }

        // CORRECCIÓN: Los datos están en res.data.ordenes
        const ordenes = res.data?.ordenes || [];
        console.log("Órdenes recibidas:", ordenes);

        if (!Array.isArray(ordenes)) {
            console.error("Los datos no son un array válido:", ordenes);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Los datos recibidos no son válidos",
            });
            return;
        }

        // Destruir DataTable existente si hay
        if ($.fn.DataTable.isDataTable("#tablaOrdenes")) {
            $("#tablaOrdenes").DataTable().destroy();
            $("#tablaOrdenes").empty();
        }

        $("#tablaOrdenes").DataTable({
            data: ordenes, // Usar 'ordenes' en lugar de 'data'
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            columns: [
                { data: "Numero", title: "Número" },
                { data: "Contenedor", title: "Contenedor" },
                { data: "Cliente", title: "Cliente" },
                { data: "Solicitud", title: "Solicitud" },
                { data: "Observaciones", title: "Observaciones" },
                {
                    data: null,
                    title: "Acciones",
                    orderable: false,
                    render: (data, type, row) => {
                        // Asegurar que row.id existe
                        const id = row.id || row.Id || row.ID;
                        return `
                            <div class="btn-group dropend">
                                <button type="button" class="btn btn-light btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
                                    data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef; width: 42px; height: 42px; border-radius: 50%;">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center info-btn" data-id="${id}">
                                            <i class="fas fa-circle-info text-info me-2"></i> Info
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center edit-btn" data-id="${id}">
                                            <i class="fas fa-edit text-warning me-2"></i> Editar
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item d-flex align-items-center delete-btn" data-id="${id}">
                                            <i class="fas fa-trash-alt text-danger me-2"></i> Eliminar
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        `;
                    },
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
            initComplete: function () {
                console.log(
                    "DataTable inicializado correctamente con",
                    ordenes.length,
                    "registros",
                );
                setupTableListeners("tablaOrdenes");
            },
        });

        console.log(`Cargadas ${ordenes.length} órdenes`);
    } catch (error) {
        console.error("Error en cargarOrdenes:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las órdenes: " + error.message,
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
    try {
        const response = await API_ORDEN.get(`/obtener-id/${idOrden}`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        // Los datos están en response.data.resultado
        const dataOrden = response.data?.resultado || {};
        console.log("Datos para editar:", dataOrden);

        // Establecer valores del formulario
        document.querySelector("#id_orden").value = dataOrden.id || "";
        elementsOrden.fecha_solicitud.value = dataOrden.fecha_solicitud || "";
        elementsOrden.numero_orden.value = dataOrden.numero_orden || "";
        elementsOrden.lote_contenedor.value = dataOrden.lote_contenedor || "";
        elementsOrden.id_cliente.value = dataOrden.id_cliente || "";
        elementsOrden.inputSearch.value = dataOrden.nombre_cliente || "";
        elementsOrden.inputSearch.setAttribute(
            "data-id",
            dataOrden.id_cliente || "",
        );
        elementsOrden.fecha_inicial.value = dataOrden.fecha_inicial || "";
        elementsOrden.fecha_estimada.value = dataOrden.fecha_estimada || "";

        // Establecer valores de responsables usando los nombres completos
        if (dataOrden.id_elaboracion) {
            elementsOrden.id_elaboracion.value = dataOrden.id_elaboracion || "";
            elementsOrden.inputElaboracion.value =
                dataOrden.nombre_elaboracion || "";
        }

        if (dataOrden.id_notificacion) {
            elementsOrden.id_notificacion.value =
                dataOrden.id_notificacion || "";
            elementsOrden.inputNotificacion.value =
                dataOrden.nombre_notificacion || "";
        }

        if (dataOrden.id_autorizacion) {
            elementsOrden.id_autorizacion.value =
                dataOrden.id_autorizacion || "";
            elementsOrden.inputAutorizacion.value =
                dataOrden.nombre_autorizacion || "";
        }

        elementsOrden.observaciones.value = dataOrden.observaciones || "";

        $("#ModalOrdenes").modal("show");
    } catch (error) {
        console.error("Error al cargar orden para editar:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la orden para editar: " + error.message,
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
    elementsOrden.inputSearch.value = "";
    elementsOrden.inputSearch.removeAttribute("data-id");
    // Limpiar también los campos de responsables
    elementsOrden.id_elaboracion.value = "";
    elementsOrden.id_notificacion.value = "";
    elementsOrden.id_autorizacion.value = "";
    elementsOrden.inputElaboracion.value = "";
    elementsOrden.inputNotificacion.value = "";
    elementsOrden.inputAutorizacion.value = "";
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
    const regexNumeroId = /^\d+$/; // Para cliente (numérico)
    const regexUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i; // Para empleados (UUID)
    const regexContenedor = /^[a-zA-Z0-9]*$/;
    const regexObservaciones = /^[a-zA-Z0-9 ,.-]*$/;

    // Trimear los valores
    datosOrden.id_cliente = datosOrden.id_cliente?.toString().trim();
    datosOrden.id_autorizacion = datosOrden.id_autorizacion?.toString().trim();
    datosOrden.id_elaboracion = datosOrden.id_elaboracion?.toString().trim();
    datosOrden.id_notificacion = datosOrden.id_notificacion?.toString().trim();

    if (!regexNumeroOrden.test(datosOrden.numero_orden)) {
        throw new Error("El Numero de Orden debe ser un dato Numérico.");
    }

    // Validar cliente (numérico) - REQUERIDO
    if (!datosOrden.id_cliente || !regexNumeroId.test(datosOrden.id_cliente)) {
        throw new Error(
            "El ID del cliente es requerido y debe ser un número válido.",
        );
    }

    // Validar empleados (UUIDs) - OPCIONALES
    if (
        datosOrden.id_autorizacion &&
        datosOrden.id_autorizacion !== "" &&
        !regexUUID.test(datosOrden.id_autorizacion)
    ) {
        throw new Error("El ID de autorización no es un UUID válido.");
    }

    if (
        datosOrden.id_elaboracion &&
        datosOrden.id_elaboracion !== "" &&
        !regexUUID.test(datosOrden.id_elaboracion)
    ) {
        throw new Error("El ID de elaboración no es un UUID válido.");
    }

    if (
        datosOrden.id_notificacion &&
        datosOrden.id_notificacion !== "" &&
        !regexUUID.test(datosOrden.id_notificacion)
    ) {
        throw new Error("El ID de notificación no es un UUID válido.");
    }

    if (
        !regexFecha.test(datosOrden.fecha_estimada) ||
        !regexFecha.test(datosOrden.fecha_inicial) ||
        !regexFecha.test(datosOrden.fecha_solicitud)
    ) {
        throw new Error(
            "El Formato de fecha no es válido. Debe ser YYYY-MM-dd.",
        );
    }

    if (
        datosOrden.lote_contenedor &&
        !regexContenedor.test(datosOrden.lote_contenedor)
    ) {
        throw new Error(
            "El contenedor solo puede tener alfanuméricos y sin espacios.",
        );
    }

    if (
        datosOrden.observaciones &&
        !regexObservaciones.test(datosOrden.observaciones)
    ) {
        throw new Error(
            "Las Observaciones solo pueden contener letras, números, espacios, puntos y comas.",
        );
    }

    return datosOrden;
}

async function formOrden(e) {
    e.preventDefault();
    
    console.log("=== DEBUG formOrden ===");
    console.log("id_elaboracion value:", elementsOrden.id_elaboracion.value);
    console.log("id_notificacion value:", elementsOrden.id_notificacion.value);
    console.log("id_autorizacion value:", elementsOrden.id_autorizacion.value);

    const id = document.querySelector("#id_orden").value;
    
    const datosOrden = {
        fecha_solicitud: elementsOrden.fecha_solicitud.value,
        numero_orden: elementsOrden.numero_orden.value,
        lote_contenedor: elementsOrden.lote_contenedor.value,
        id_cliente: elementsOrden.id_cliente.value,
        fecha_inicial: elementsOrden.fecha_inicial.value,
        fecha_estimada: elementsOrden.fecha_estimada.value,
        id_elaboracion: elementsOrden.id_elaboracion.value,
        id_notificacion: elementsOrden.id_notificacion.value,
        id_autorizacion: elementsOrden.id_autorizacion.value,
        observaciones: elementsOrden.observaciones.value || "No hay Observaciones",
    };

    console.log("Datos a enviar:", datosOrden);

    try {
        const orden = sanitizarCampos(datosOrden);
        console.log("Datos sanitizados:", orden);
        
        if (id) {
            await actualizarOrden(id, orden);
        } else {
            await guardarOrden(orden);
        }
        
    } catch (error) {
        console.error("Error en formulario:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: true
        });
    }
}

async function actualizarOrden(id, orden) {
    try {
        console.log("Actualizando orden ID:", id, "con datos:", orden);
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
        console.log("Guardando nueva orden:", orden);
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
            const response = await API_ORDEN.delete(`/eliminar/${id}`, {
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

        // Los datos están en response.data.resultado
        const dataOrden = response.data?.resultado || {};
        console.log("Datos para info:", dataOrden);

        // Actualizar campos del modal de información
        document.querySelector("#fecha_solicitud_info").value =
            dataOrden.fecha_solicitud || "";

        document.querySelector("#numero_orden_info").value =
            dataOrden.numero_orden || "";

        document.querySelector("#lote_empaque_info").value =
            dataOrden.lote_contenedor || "";

        // Para cliente: mostrar el nombre en lugar del ID
        const clienteInput = document.querySelector("#search_cliente");
        if (clienteInput) {
            clienteInput.value = dataOrden.nombre_cliente || "";
        }

        document.querySelector("#id_cliente_info").value =
            dataOrden.id_cliente || "";

        document.querySelector("#fecha_inicial_info").value =
            dataOrden.fecha_inicial || "";

        document.querySelector("#fecha_estimada_info").value =
            dataOrden.fecha_estimada || "";

        // Para responsables: mostrar los nombres completos
        document.querySelector("#inputElaboracion_info").value =
            dataOrden.nombre_elaboracion || "";

        document.querySelector("#id_elaboracion_info").value =
            dataOrden.id_elaboracion || "";

        document.querySelector("#inputAutorizacion_info").value =
            dataOrden.nombre_autorizacion || "";

        document.querySelector("#id_autorizacion_info").value =
            dataOrden.id_autorizacion || "";

        document.querySelector("#inputNotificacion_info").value =
            dataOrden.nombre_notificacion || "";

        document.querySelector("#id_notificacion_info").value =
            dataOrden.id_notificacion || "";

        document.querySelector("#observaciones_info").value =
            dataOrden.observaciones || "";

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

async function cargarNombreResponsable(idResponsable, inputField) {
    try {
        const response = await API_EMPLEADOS.get(`/obtener-id/${idResponsable}`, {
            headers: { Authorization: "Bearer " + token },
        });
        
        if (response.success && response.data) {
            const empleado = response.data;
            elementsOrden[inputField].value = empleado.nombre || empleado.Nombre || "";
        }
    } catch (error) {
        console.error(`Error al cargar responsable ${idResponsable}:`, error);
    }
}

function fillDatalist(datalistId, data) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    datalist.innerHTML = "";
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nombre || item.Nombre || "";
        option.dataset.id = item.id;
        datalist.appendChild(option);
    });
}

async function llenarResposables() {
    try {
        // Definir los roles para cada campo
        const rolesConfig = {
            'listElaboracion': 'Elaborador',
            'listNotificacion': 'RecursosHumanos', // Cambié a RecursosHumanos según tus URLs
            'listAutorizacion': 'Gerencia' // Cambié a Gerente según tus URLs
        };

        // Cargar todos los roles en paralelo
        const promises = Object.entries(rolesConfig).map(async ([datalistId, rol]) => {
            try {
                // NOTA: Ajusta la ruta según tu API
                // Parece que tienes diferentes formatos de URL:
                // 1. "obtener-by-rol/RecursosHumanos" (con guión)
                // 2. "obtener-byrol-/Gerente" (sin guión antes del rol)
                // 3. "obtener-byrol-/Elaborador" (sin guión antes del rol)
                
                let url;
                if (rol === 'RecursosHumanos') {
                    url = `/obtener-by-rol/${rol}`; // Con guión
                } else {
                    url = `/obtener-by-rol/${rol}`; // Sin guión antes del rol
                }
                
                const response = await API_EMPLEADOS.get(url, {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                if (response.success && response.data) {
                    // La estructura puede variar, intenta diferentes propiedades
                    const empleados = response.data.responsables || 
                                     response.data.empleados || 
                                     response.data.data || 
                                     [];
                    
                    if (empleados.length > 0) {
                        fillDatalist(datalistId, empleados);
                        console.log(`Cargados ${empleados.length} empleados para rol ${rol}`);
                    }
                }
            } catch (error) {
                console.error(`Error al cargar rol ${rol}:`, error);
            }
        });

        await Promise.all(promises);
        console.log("Todos los responsables cargados");

    } catch (error) {
        console.error("Error al cargar responsables:", error);
        alerts.show({ success: false, message: "Error al cargar responsables" });
    }
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