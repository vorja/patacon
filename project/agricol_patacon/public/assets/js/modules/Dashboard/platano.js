import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";
import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";

const API_PROVEEDOR = new ApiService(Url + "/data/proveedor");
const API_PRODUCCION = new ApiService(Url + "/data/produccion");

const alerts = new AlertManager();
const elementsProveedor = {
    nombre: document.querySelector("#nombre"),
    identificacion: document.querySelector("#documento"),
    telefono: document.querySelector("#telefono"),
    inputSearchP: document.querySelector("#inputSearhP"),
    formProveedor: document.getElementById("formProveedor"),
    btnAgregar: document.getElementById("btnAgregar"),
};
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const listenerIds = {
    searchP: null,
    btnAgregar: null,
    formProveedor: null,
    tablaPlatano: null,
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
    // Verificar que los elementos existen
    const elements = ["btnAgregar", "formProveedor", "inputSearchP"];
    elements.forEach((el) => {
        if (!elementsProveedor[el]) {
            console.warn(`Elemento ${el} no encontrado`);
        }
    });

    if (elementsProveedor.btnAgregar && eventManager && eventManager.add) {
        listenerIds.btnAgregar = eventManager.add(
            elementsProveedor.btnAgregar,
            "click",
            handleAgregarClick,
        );
    }

    if (elementsProveedor.formProveedor && eventManager && eventManager.add) {
        listenerIds.formProveedor = eventManager.add(
            elementsProveedor.formProveedor,
            "submit",
            formProveedor,
        );
    }

    if (
        elementsProveedor.inputSearchP &&
        eventManager &&
        eventManager.addDebounced
    ) {
        listenerIds.searchP = eventManager.addDebounced(
            elementsProveedor.inputSearchP,
            "input",
            buscarProveedores,
            300,
        );
    } else {
        console.warn(
            "Input de búsqueda de Proveedores no encontrado o eventManager no disponible",
        );
    }

    const suggestionsProveedores = document.getElementById("suggestionsP");
    if (suggestionsProveedores && eventManager && eventManager.delegate) {
        eventManager.delegate(
            suggestionsProveedores,
            "click",
            ".suggestion-item",
            handleSuggestionClick,
        );
    } else {
        console.warn(
            "No se pudo configurar delegación de eventos para suggestions",
        );
    }
    console.log("Event Listeners configurados:", eventManager.getStats());
}

async function handleSuggestionClick(e) {
    const suggestionItem = e.target;
    const ordenId = suggestionItem.dataset.id;
    const containerTipo = suggestionItem.dataset.tipo;
    const ordenLote = suggestionItem.textContent;
    if (containerTipo == "P" && elementsProveedor.inputSearchP) {
        elementsProveedor.inputSearchP.value = ordenLote;
        elementsProveedor.inputSearchP.setAttribute("data-id", ordenId);
        await historialProveedor(ordenId);
    }

    // Limpiar sugerencias
    const suggestionsContainer = document.getElementById("suggestionsP");
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = "";
    }
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalProveedoresPlatano").modal("show");
}

function renderSuggestions(resultados, container, tipo) {
    if (!container) {
        console.warn("Contenedor de sugerencias no encontrado");
        return;
    }

    const fragment = document.createDocumentFragment();
    const maxResults = 10;
    const limited = resultados.slice(0, maxResults);

    if (tipo === "P") {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Nombre;
            div.dataset.id = orden.id;
            div.dataset.tipo = tipo;
            fragment.appendChild(div);
        });
    } else {
        limited.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Lote;
            div.dataset.id = orden.id;
            div.dataset.tipo = tipo;
            fragment.appendChild(div);
        });
    }

    container.innerHTML = "";
    container.appendChild(fragment);

    // Mostrar cantidad de resultados adicionales
    if (resultados.length > maxResults) {
        const moreDiv = document.createElement("div");
        moreDiv.classList.add("suggestion-more");
        moreDiv.textContent = `+${resultados.length - maxResults} resultados más...`;
        container.appendChild(moreDiv);
    }
}

async function buscarProveedores() {
    const suggestions = document.getElementById("suggestionsP");
    if (!suggestions) {
        console.warn("Contenedor de sugerencias no encontrado");
        return;
    }

    const query = elementsProveedor.inputSearchP
        ? elementsProveedor.inputSearchP.value.toLowerCase().trim()
        : "";

    if (query === "") {
        suggestions.innerHTML = "";
        return;
    }

    try {
        const response = await API_PROVEEDOR.get("/obtener", {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { proveedores } = response.data;
        const resultados = proveedores.filter((proveedor) =>
            proveedor.Nombre.toLowerCase().includes(query),
        );

        renderSuggestions(resultados, suggestions, "P");
    } catch (error) {
        console.error("Error al buscar proveedores:", error);
    }
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

        // VERIFICAR SI LA TABLA EXISTE
        const tablaElement = document.getElementById("tablaProveedores");
        if (!tablaElement) {
            console.warn("Elemento #tablaProveedores no encontrado");
            return;
        }

        // Limpiar tabla existente
        safeDestroyDataTable("#tablaProveedores");

        $("#tablaProveedores").DataTable({
            data: proveedores,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            pageLength: 10, // Número de registros por página
            lengthChange: true, // Permitir cambiar número de registros por página
            lengthMenu: [10, 25, 50, 100], // Opciones para cambiar registros por página
            dom: "lBfrtip", // 'l' añade lengthMenu, 'B' para botones
            buttons: [
                {
                    extend: "copy",
                    text: '<i class="fas fa-copy"></i> Copiar',
                    className: "btn btn-sm btn-light",
                },
                {
                    extend: "excel",
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    className: "btn btn-sm btn-light",
                },
                {
                    extend: "pdf",
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    className: "btn btn-sm btn-light",
                },
            ],
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
                var numRegistros = api.rows().count();
                var $paginate = $(
                    ".dataTables_paginate",
                    api.table().container(),
                );

                // Mostrar u ocultar paginación basado en número de registros
                if (numRegistros <= this.fnSettings()._iDisplayLength) {
                    $paginate.hide();
                } else {
                    $paginate.show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                paginate: {
                    first: "Primera",
                    last: "Última",
                    next: "Siguiente",
                    previous: "Anterior",
                },
                lengthMenu: "Mostrar _MENU_ registros por página",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                search: "Buscar:",
                zeroRecords: "No se encontraron registros coincidentes",
            },
        });
        setupTableListeners("tablaProveedores");
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

function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.warn(
            `Tabla ${tableId} no encontrada para configurar listeners`,
        );
        return;
    }

    // Verifica que eventManager exista
    if (!eventManager || !eventManager.delegate) {
        console.warn("eventManager no está disponible");
        return;
    }

    eventManager.delegate(table, "click", ".edit-btn", async function (e) {
        const id = this.dataset.id;
        await abrirEditar(id);
    });

    eventManager.delegate(table, "click", ".delete-btn", async function (e) {
        const id = this.dataset.id;
        await eliminarEliminar(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoProveedor(id);
    });
}

const historialProveedor = async (idProveedor) => {
    try {
        const res = await API_PRODUCCION.get(
            `/proveedor-historial/${idProveedor}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { global } = res.data;

        // VERIFICAR SI LA TABLA EXISTE
        const tablaElement = document.getElementById("tablaRendProveedores");
        if (!tablaElement) {
            console.warn("Elemento #tablaRendProveedores no encontrado");
            return;
        }

        // DESTRUIR TABLA EXISTENTE ANTES DE CREAR NUEVA
        safeDestroyDataTable("#tablaRendProveedores");

        // Tabla de Rendimiento de Materia Prima o Platano.
        $(`#tablaRendProveedores`).DataTable({
            data: global,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            pageLength: 10,
            lengthChange: true,
            lengthMenu: [10, 25, 50],
            dom: "lfrtip",
            columns: [
                { data: "fecha" },
                { data: "proveedor" },
                { data: "totalMateriaRecp" },
                {
                    data: "rendimiento",
                    render: function (data, type, row) {
                        if (type !== "display") return data;
                        const val = parseFloat(data ?? 0, 10);
                        if (val >= 43) {
                            return `<span class="badge bg-success rounded-pill fw-bold text-white fs-6">${val} %</span>`;
                        }
                        if (val > 39.9 && val <= 42.9) {
                            return `<span class="badge bg-warning rounded-pill fw-bold text-white fs-6">${val} %</span>`;
                        }
                        if (val <= 39.9) {
                            return `<span class="badge bg-danger rounded-pill fw-bold text-white fs-6">${val} %</span>`;
                        }
                    },
                },
                {
                    data: null,
                    className: "text-center border-1",
                    render: (data, type, row) => `
                     <div class="btn-group dropend">
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3">
  <li>
      <a class="dropdown-item d-flex align-items-center info-btn" data-fecha="${row.fecha}" data-id="${row.id}"  data-bs-toggle="modal" data-bs-target="#ModaRendProveedor">
        <i class="fas fa-circle-info text-info me-2"></i> Información
      </a>
    </li>
  </ul>
</div>
                `,
                },
            ],
            columnDefs: [
                {
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-O">${cellData}</span>`);
                    },
                },
                {
                    targets: 2,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-F">${cellData} Kg</span>`,
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows().count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= this.fnSettings()._iDisplayLength) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                    first: "Primera",
                    last: "Última",
                    next: "Siguiente",
                    previous: "Anterior",
                },
                lengthMenu: "Mostrar _MENU_ registros por página",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                zeroRecords: "No se encontraron registros coincidentes",
            },
        });

        // Configurar evento para info-btn
        const tablaBody = $("#tablaRendProveedores tbody");
        if (tablaBody.length) {
            tablaBody.off("click", ".info-btn"); // Remover eventos previos
            tablaBody.on("click", ".info-btn", function () {
                rendimientoProveedor(this.dataset.fecha, this.dataset.id);
            });
        }
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
};

const rendimientoProveedor = async (fecha, id) => {
    if (!fecha || !id) {
        return;
    }

    try {
        const res = await API_PRODUCCION.get(`/proveedor-info/${id}/${fecha}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }

        const { data, rechazo, fritura, cajas, cortes } = res.data;
        asignarInfoProveedor(data, fritura);

        // VERIFICAR SI EL ELEMENTO DE LA GRÁFICA EXISTE
        const chartElement = document.getElementById("graficaRechazoProv");
        if (!chartElement) {
            console.warn("Elemento para gráfica no encontrado");
            return;
        }

        drawChart(rechazo, "graficaRechazoProv");

        // Configurar tabla de cajas
        safeDestroyDataTable("#cajasProveedor");
        $(`#cajasProveedor`).DataTable({
            data: cajas,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            deferRender: true,
            pageLength: 3,
            lengthChange: false,
            lengthMenu: [3, 5, 10],
            dom: "rt", // Solo tabla sin controles
            columns: [{ data: "caja" }, { data: "cantidad" }],
            columnDefs: [
                {
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-O">${cellData}</span>`);
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows().count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= this.fnSettings()._iDisplayLength) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla.",
                info: "",
                infoEmpty: "",
                infoFiltered: "",
            },
        });

        // Configurar tabla de cortes
        safeDestroyDataTable("#cortesProveedor");
        const { detalles } = cortes[0] || { detalles: [] };
        $(`#cortesProveedor`).DataTable({
            data: detalles,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            deferRender: true,
            pageLength: 3,
            lengthChange: false,
            lengthMenu: [3, 5, 10],
            dom: "rt", // Solo tabla sin controles
            columns: [{ data: "tipo" }, { data: "materia" }],
            columnDefs: [
                {
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-O">${cellData} Kg</span>`,
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows().count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= this.fnSettings()._iDisplayLength) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla.",
                info: "",
                infoEmpty: "",
                infoFiltered: "",
            },
        });
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
};

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

    const idInput = document.querySelector("#id_proveedor");
    if (idInput) {
        idInput.value = data.id;
    }

    if (elementsProveedor.nombre) elementsProveedor.nombre.value = data.nombre;
    if (elementsProveedor.identificacion)
        elementsProveedor.identificacion.value = data.identificacion;
    if (elementsProveedor.telefono)
        elementsProveedor.telefono.value = data.movil;

    $("#ModalProveedoresPlatano").modal("show");
}

export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null && eventManager && eventManager.remove) {
            eventManager.remove(id);
        }
    });

    // Limpiar listeners de DataTables
    cleanupDataTables();
}

function safeDestroyDataTable(selector) {
    try {
        const $table = $(selector);
        if ($table.length === 0) {
            return false; // Elemento no existe
        }

        if ($.fn.DataTable && $.fn.DataTable.isDataTable(selector)) {
            const table = $table.DataTable();
            if (table && typeof table.destroy === "function") {
                table.destroy();
            }
            $table.empty();
            return true;
        }
        return false;
    } catch (error) {
        console.warn(`Error al destruir DataTable ${selector}:`, error);
        return false;
    }
}

function cleanupDataTables() {
    const tables = [
        "#tablaProveedores",
        "#tablaRendProveedores",
        "#cajasProveedor",
        "#cortesProveedor",
        "#tablaPlatano",
    ];

    tables.forEach((tableId) => {
        safeDestroyDataTable(tableId);
    });
}

export function reloadEventListeners() {
    cleanup();
    setupEventListeners();
}

function limpiarFormulario() {
    const form = document.querySelector("#formProveedor");
    if (form) {
        form.reset();
    }

    const idInput = document.querySelector("#id_proveedor");
    if (idInput) {
        idInput.value = "";
    }
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
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9() -]+$/;
    const regexDocumento = /^\d{6,11}$/;
    const regexTelefono = /^\d{6,11}$/;

    if (!regexDocumento.test(dataProveedor.identificacion)) {
        throw new Error(
            "El documento debe tener entre 10 y 11 dígitos numéricos consecutivos.",
        );
    }

    if (!regexTelefono.test(dataProveedor.movil)) {
        throw new Error(
            "El teléfono debe tener entre 10 y 11 dígitos numéricos.",
        );
    }

    if (!regexNombre.test(dataProveedor.nombre)) {
        throw new Error("El nombre contiene caracteres no permitidos.");
    }

    return dataProveedor;
}

async function formProveedor(e) {
    e.preventDefault();
    const idInput = document.querySelector("#id_proveedor");
    const id = idInput ? idInput.value : "";

    // Verificar que los elementos del formulario existen
    if (
        !elementsProveedor.identificacion ||
        !elementsProveedor.nombre ||
        !elementsProveedor.telefono
    ) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Elementos del formulario no encontrados",
            showConfirmButton: false,
            timer: 2000,
        });
        return;
    }

    const datosProveedores = {
        identificacion: elementsProveedor.identificacion.value,
        nombre: elementsProveedor.nombre.value,
        movil: elementsProveedor.telefono.value,
    };

    try {
        const proveedor = sanitizarCampos(datosProveedores);
        if (id) {
            await actualizarProveedor(id, proveedor);
        } else {
            await guardarProveedor(proveedor);
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
            $("#ModalProveedoresPlatano").modal("hide");
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
        const response = await API_PROVEEDOR.post(`/crear`, proveedor, {
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
            $("#ModalProveedoresPlatano").modal("hide");
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

async function eliminarEliminar(id) {
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
            const response = await API_PROVEEDOR.delete(`/eliminar/${id}`, {
                headers: {
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
        const res = await API_PROVEEDOR.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { data } = res;

        const nombreInfo = document.querySelector("#nombre_info");
        const documentoInfo = document.querySelector("#documento_info");
        const telefonoInfo = document.querySelector("#telefono_info");

        if (nombreInfo) nombreInfo.value = data.nombre;
        if (documentoInfo) documentoInfo.value = data.identificacion;
        if (telefonoInfo) telefonoInfo.value = data.movil;

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

// Infomación de Rendimiento de Proveedor: Modúlo de Rendimiento.
const asignarInfoProveedor = (rendimientos, dataFritura) => {
    // Verificar que los elementos existan antes de asignar valores
    const progPlatano = $("#progPlatano");
    const progFritura = $("#progFritura");
    const progHFritura = $("#progHFritura");
    const progEmpaque = $("#progEmpaque");
    const rendimientoPro = $("#rendimientoPro");

    if (progPlatano.length) {
        const rendPlatano = rendimientos[0]?.RendPlatano ?? 0;
        progPlatano.text(`${rendPlatano}%`).css("width", `${rendPlatano}%`);
        $("#labelPlatano").text(`${rendPlatano}%`);
    }

    if (progFritura.length) {
        const rendFritura = rendimientos[0]?.RendFritura ?? 0;
        progFritura.text(`${rendFritura}%`).css("width", `${rendFritura}%`);
        $("#labelFritura").text(`${rendFritura}%`);
    }

    if (progHFritura.length) {
        const rendHFritura = rendimientos[0]?.RendHFritura ?? 0;
        progHFritura.text(`${rendHFritura}%`).css("width", `${rendHFritura}%`);
        $("#labelHFritura").text(`${rendHFritura}%`);
    }

    if (progEmpaque.length) {
        const rendEmpaque = rendimientos[0]?.RendEmpaque ?? 0;
        progEmpaque.text(`${rendEmpaque}%`).css("width", `${rendEmpaque}%`);
        $("#labelEmpaque").text(`${rendEmpaque}%`);
    }

    if (rendimientoPro.length) {
        rendimientoPro.text(`${rendimientos[0]?.RendTotal ?? 0}%`);
    }

    // Informacion del Proceso de Fritura
    const frituraData = dataFritura && dataFritura[0] ? dataFritura[0] : {};
    const infoFritura =
        frituraData.info && frituraData.info[0] ? frituraData.info[0] : {};

    const elementosFritura = {
        "#fritFecha": infoFritura.fecha ?? 0,
        "#fritIni": frituraData.inicio_fritura ?? 0,
        "#fritFin": frituraData.fin_fritura ?? 0,
        "#fritDuracion": `${frituraData.tiempo_fritura ?? 0} min`,
        "#fritTemperatura": `${frituraData.temperatura_fritura ?? 0} °C`,
        "#fritCanastas": frituraData.canastas ?? 0,
        "#fritKgPatacon": `${frituraData.materia_kg ?? 0}`,
        "#fritMigas": `${frituraData.migas ?? 0}`,
        "#fritRechazo": `${frituraData.rechazo ?? 0}`,
    };

    for (const [selector, valor] of Object.entries(elementosFritura)) {
        const elemento = $(selector);
        if (elemento.length) {
            elemento.text(valor);
        }
    }
};

const asignarConteo = (data) => {
    const cardProveedores = {
        Provedores: document.querySelector("#Proveedores"),
    };
    if (cardProveedores.Provedores) {
        cardProveedores.Provedores.textContent = data;
    }
};

// Grafica D3.JS RECHAZO POR AREA, 1 DIA DE PRODUCCIÓN.
function drawChart(data, id) {
    try {
        if (!data || data.length === 0) {
            console.warn(`No hay datos para el gráfico: ${id}`);
            return;
        }

        const targetElement = document.getElementById(id);
        if (!targetElement) {
            console.warn(`Elemento destino "${id}" no encontrado`);
            return;
        }

        // Función para dibujar realmente la gráfica
        const renderChart = () => {
            // Buscar el contenedor
            let container =
                document.querySelector(".container-proveedor") ||
                targetElement.closest(".card-body") ||
                targetElement.closest(".modal-body") ||
                targetElement.closest(".container-fluid");

            if (!container) {
                container = document.body;
            }

            let containerWidth = container.offsetWidth;

            // Si aún tiene ancho cero, intentar obtener el ancho del modal
            if (containerWidth <= 0) {
                const modal = document.querySelector(
                    "#ModaRendProveedor .modal-dialog",
                );
                if (modal) {
                    containerWidth = modal.clientWidth - 40; // Margen interno
                } else {
                    containerWidth = 600; // Ancho mínimo
                }
            }

            // Limpiar contenido previo
            targetElement.innerHTML = "";

            const margin = { top: 40, right: 20, bottom: 50, left: 50 };
            const width = Math.max(
                500,
                containerWidth - margin.left - margin.right,
            );
            const height = Math.max(300, data.length * 40);

            // Escalas
            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.name))
                .range([margin.left, width - margin.right])
                .padding(0.2);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.value)])
                .nice()
                .range([height - margin.bottom, margin.top]);

            // Colores (puedes personalizar por área)
            const coloresPorArea = {
                Recepcion: "#b4c348",
                Alistamiento: "#6c780d",
                Corte: "#fab612",
                Fritura: "#ff7f0e",
                Empaque: "#24243c",
            };

            // Crear SVG y agregarlo al DOM
            const svg = d3
                .create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");

            d3.select(`#${id}`).append(() => svg.node());

            // Ejes
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            // Barras
            svg.append("g")
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("x", (d) => x(d.name))
                .attr("y", (d) => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", (d) => y(0) - y(d.value))
                .attr("fill", (d) => coloresPorArea[d.name] || "#888");

            // Etiquetas de valores sobre cada barra
            svg.append("g")
                .selectAll("text.value")
                .data(data)
                .join("text")
                .attr("class", "value")
                .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
                .attr("y", (d) => y(d.value) - 5)
                .attr("text-anchor", "middle")
                .attr("font-size", 12)
                .text((d) => d.value + "Kg");
        };

        // Intentar renderizar inmediatamente
        renderChart();

        // Si el modal está abierto o se abre después, volver a renderizar
        const modal = document.getElementById("ModaRendProveedor");
        if (modal && modal.classList.contains("show")) {
            // El modal ya está abierto, redibujar después de un pequeño delay
            setTimeout(renderChart, 100);
        }

        // Escuchar cuando se abra el modal
        $("#ModaRendProveedor").on("shown.bs.modal", function () {
            setTimeout(renderChart, 50);
        });

        // Escuchar redimensionamiento de ventana
        window.addEventListener("resize", function () {
            setTimeout(renderChart, 100);
        });
    } catch (error) {
        console.error(`Error al dibujar gráfico ${id}:`, error);
        const targetElement = document.getElementById(id);
        if (targetElement) {
            targetElement.innerHTML = `<div class="alert alert-warning">No se pudo cargar la gráfica</div>`;
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);

if (notificationManager && notificationManager.onNewNotification) {
    notificationManager.onNewNotification = (notificacion) => {
        console.log("Nueva notificación recibida:", notificacion);
    };
}
