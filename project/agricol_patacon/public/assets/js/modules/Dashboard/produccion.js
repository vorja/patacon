import eventManager from "../../helpers/EventsManager.js";
import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_PRODUCCION = new ApiService("http://localhost:3105/data/produccion");
const API_ENCARGO = new ApiService("http://localhost:3105/config/encargo");
const API_EMPLEADO = new ApiService("http://localhost:3105/data/empleados");
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsProduccion = {
    inputSearchC: document.querySelector("#inputSearhC"),
    inputSaerchFecha: document.querySelector("#inputSearhR"),
    inputPeso: document.querySelector("#peso_promedio"),
    confirmButton: document.querySelector("#confirmButton"),
    btnAgregar: document.getElementById("btnAgregar"),
    btnAsignarReferencias: document.getElementById("btnAsignarReferencias"),
    btnRegistrar: document.getElementById("btnRegistrar"),
    btnToggle: document.querySelector(".caja-card"),
    checkbox: document.querySelector(".checkbox-custom"),
    btnCancel: document.querySelector(".btn-cancel"),
    formProduccion: document.getElementById("formProduccion"),
};
const listenerIds = {
    searchR: null,
    searchC: null,
    inputPeso: null,
    btnAgregar: null,
    btnAsignarReferencias: null,
    btnRegistrar: null,
    btnCancel: null,
    btnToggle: null,
    checkbox: null,
    formProduccion: null,
    confirmButton: null,
    tableRendimientos: null,
    tablaPlatano: null,
};

async function init() {
    try {
        await llenarResposables();
        await cargarProducciones();
        await renderPanel();
        await renderOrden();
        initializeCards();
        await eventCheck();
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
    if (elementsProduccion.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsProduccion.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsProduccion.btnRegistrar) {
        listenerIds.btnCancel = eventManager.add(
            elementsProduccion.btnRegistrar,
            "click",
            handleSubmit
        );
    }
    if (elementsProduccion.btnCancel) {
        listenerIds.btnCancel = eventManager.add(
            elementsProduccion.btnCancel,
            "click",
            handleCancel
        );
    }
    const btnCancelReferencias = document.querySelector(
        "#ModalReferencias .btn-cancel"
    );

    if (btnCancelReferencias) {
        listenerIds.btnCancel = eventManager.add(
            btnCancelReferencias,
            "click",
            handleCancel
        );
    }
    /* 
    if (elementsProduccion.btnToggle) {
        listenerIds.btnToggle = eventManager.add(
            elementsProduccion.btnToggle,
            "click",
            toggleCard
        );
    } */
    /*   if (elementsProduccion.checkbox) {
        listenerIds.checkbox = eventManager.add(
            elementsProduccion.checkbox,
            "click",
            updateCard
        );
    } */
    if (elementsProduccion.formProduccion) {
        listenerIds.formProduccion = eventManager.add(
            elementsProduccion.formProduccion,
            "submit",
            formProduccion
        );
    }

    if (elementsProduccion.inputSearchC) {
        listenerIds.searchC = eventManager.addDebounced(
            elementsProduccion.inputSearchC,
            "input",
            buscarOrdenesC,
            300
        );
    } else {
        console.warn("Input de búsqueda de contenedores no encontrado");
    }

    if (elementsProduccion.inputPeso) {
        listenerIds.inputPeso = eventManager.addDebounced(
            elementsProduccion.inputPeso,
            "input",
            updateSummary,
            300
        );
    } else {
        console.warn("Input de búsqueda de contenedores no encontrado");
    }

    if (elementsProduccion.confirmButton) {
        listenerIds.confirmButton = eventManager.add(
            elementsProduccion.confirmButton,
            "click",
            handleConfirmClick
        );
    }
    if (elementsProduccion.inputSaerchFecha) {
        listenerIds.inputSaerchFecha = eventManager.add(
            elementsProduccion.inputSaerchFecha,
            "change",
            infoRendimiento
        );
    }

    //
    const suggestionsContainer = document.getElementById("suggestionsC");
    if (suggestionsContainer) {
        eventManager.delegate(
            suggestionsContainer,
            "click",
            ".suggestion-item",
            handleSuggestionClick
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalProduccion").modal("show");
}
// ==========================
// ASIGNACIÓN DE REFERENCIAS
// ==========================

const tiposCajas = [
    { id: "tipoA", value: "A", name: "Caja Tipo A", icon: "fa-box" },
    { id: "tipoB", value: "B", name: "Caja Tipo B", icon: "fa-box" },
    { id: "tipoC", value: "C", name: "Caja Tipo C", icon: "fa-box" },
    {
        id: "tipoXL",
        value: "XL",
        name: "Caja Tipo XL",
        icon: "fa-boxes-stacked",
    },
    { id: "tipoBH", value: "BH", name: "Caja Tipo BH", icon: "fa-box-open" },
    { id: "tipoCIL", value: "CIL", name: "Caja Tipo CIL", icon: "fa-cube" },
];

function initializeCards() {
    const grid = document.getElementById("cajasGrid");
    if (!grid) return;

    grid.innerHTML = tiposCajas
        .map(
            (caja) => `
            <div class="caja-card" id="card_${caja.value}" >
                <div class="caja-card-header">
                    <div class="caja-name">
                        <i class="fas ${caja.icon}"></i>
                        ${caja.name}
                    </div>
                    <input 
                        type="checkbox" 
                        class="checkbox-custom" 
                        id="${caja.id}"
                        value="${caja.value}"
                    >
                </div>
                <label class="cantidad-label">Cantidad de Cajas</label>
                <input 
                    type="number" 
                    class="cantidad-input" 
                    id="cantidad_${caja.id}"
                    min="0"
                    value="0"
                    disabled
                >
            </div>
        `
        )
        .join("");
}

function updateCard(id) {
    if (!id) {
        return false;
    }
    const card = document.getElementById(`card_${id}`);
    const checkbox = document.getElementById(`tipo${id}`);
    const input = document.getElementById(`cantidad_tipo${id}`);

    if (!card || !checkbox || !input) return;

    if (checkbox.checked) {
        card.classList.add("selected");
        input.disabled = false;
        input.focus();
        if (input.value === "0") {
            input.value = "1";
        }
    } else {
        card.classList.remove("selected");
        input.disabled = true;
        input.value = "0";
    }

    updateSummary();
}
const eventCheck = async () => {
    const checkboxes = document.querySelectorAll(
        '.caja-card-header input[type="checkbox"]'
    );

    checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
            if (e.target.checked) {
                console.log("selecii", e.target.value);
                updateCard(e.target.value);
            } else {
                console.log("false");
            }
        });
    });
};
function toggleCard(id) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        updateCard(id);
    }
}

function updateSummary() {
    const pesoInput = document.getElementById("peso_promedio");
    if (!pesoInput) return;

    const peso = parseFloat(pesoInput.value) || 0;
    let totalCajas = 0;
    let tiposSeleccionados = 0;

    tiposCajas.forEach((caja) => {
        const checkbox = document.getElementById(caja.id);
        const cantidadInput = document.getElementById(`cantidad_${caja.id}`);

        if (!checkbox || !cantidadInput) return;

        const cantidad = parseInt(cantidadInput.value) || 0;

        if (checkbox.checked && cantidad > 0) {
            totalCajas += cantidad;
            tiposSeleccionados++;
        }
    });

    const pesoTotal = totalCajas * peso;

    // Actualizar elementos del resumen
    const totalCajasEl = document.getElementById("totalCajas");
    const tiposSeleccionadosEl = document.getElementById("tiposSeleccionados");
    const pesoTotalEl = document.getElementById("pesoTotal");
    const summaryBox = document.getElementById("summaryBox");

    if (totalCajasEl) totalCajasEl.textContent = totalCajas;
    if (tiposSeleccionadosEl)
        tiposSeleccionadosEl.textContent = tiposSeleccionados;
    if (pesoTotalEl)
        pesoTotalEl.textContent =
            new Intl.NumberFormat("es-CL").format(pesoTotal.toFixed(2)) + " kg";

    if (summaryBox) {
        if (tiposSeleccionados > 0 && peso > 0) {
            summaryBox.classList.add("show");
        } else {
            summaryBox.classList.remove("show");
        }
    }
}

function showError(message) {
    const errorMsg = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    if (!errorMsg || !errorText) {
        console.error(message);
        return;
    }

    errorText.textContent = message;
    errorMsg.classList.add("show");

    setTimeout(() => {
        errorMsg.classList.remove("show");
    }, 4000);
}

function handleCancel() {
    Swal.fire({
        title: "¿Estás seguro de Cancelar?",
        text: "¡Se perderán los datos ingresados!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#2584afff",
        confirmButtonText: "Sí, Cancelar",
        cancelButtonText: "No, continuar",
    }).then((result) => {
        if (result.isConfirmed) {
            resetFormReferencias();
        }
    });
}

function resetFormReferencias() {
    const pesoInput = document.getElementById("peso_promedio");
    if (pesoInput) pesoInput.value = "";

    tiposCajas.forEach((caja) => {
        const checkbox = document.getElementById(caja.id);
        if (checkbox) {
            checkbox.checked = false;
            updateCard(caja.value);
        }
    });

    updateSummary();

    // Limpiar mensaje de error
    const errorMsg = document.getElementById("errorMessage");
    if (errorMsg) {
        errorMsg.classList.remove("show");
    }
}

async function handleSubmit() {
    const peso = parseFloat(document.getElementById("peso_promedio").value);

    if (!peso || peso <= 0) {
        showError("Debe ingresar un peso promedio válido mayor a 0");
        document.getElementById("peso_promedio").focus();
        return;
    }

    const detalles = [];
    let hasSelection = false;

    tiposCajas.forEach((caja) => {
        const checkbox = document.getElementById(caja.id);
        const cantidadInput = document.getElementById(`cantidad_${caja.id}`);

        if (!checkbox || !cantidadInput) return;

        const cantidad = parseInt(cantidadInput.value) || 0;

        if (checkbox.checked) {
            if (cantidad <= 0) {
                showError(`La cantidad para ${caja.name} debe ser mayor a 0`);
                hasSelection = false;
                return;
            }
            hasSelection = true;

            // Obtener el ID de producción
            const idProduccionInput = document.getElementById(
                "id_produccion_referencias"
            );
            const idProduccion = idProduccionInput
                ? idProduccionInput.value
                : null;

            detalles.push({
                id_produccion: idProduccion,
                caja: caja.value,
                numero_cajas: cantidad,
                peso_promedio: peso,
            });
        }
    });

    if (!hasSelection) {
        showError("Debe seleccionar al menos un tipo de caja");
        return;
    }

    console.log("Datos a enviar:", detalles);

    // Deshabilitar botón mientras se procesa
    const btnRegistrar = document.getElementById("btnRegistrar");
    if (!btnRegistrar) return;

    const originalText = btnRegistrar.innerHTML;
    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        const response = await API_PRODUCCION.post("/asig-cajas", detalles, {
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

            // Cerrar modal
            $("#ModalReferencias").modal("hide");

            // Recargar tabla de producciones
            await cargarProducciones();

            // Limpiar formulario
            resetFormReferencias();
        }
    } catch (error) {
        console.error("Error al asignar referencias:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al procesar la solicitud",
            showConfirmButton: false,
            timer: 2000,
        });
    } finally {
        // Restaurar botón
        btnRegistrar.disabled = false;
        btnRegistrar.innerHTML = originalText;
    }
}

async function handleConfirmClick() {
    let id = document.getElementById("ordenid").value;
    const data = {
        id: id,
        fecha: new Date().toISOString().slice(0, 10),
    };
    try {
        const response = await API_ENCARGO.put(`/editar`, data, {
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
            window.location.reload();
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Ha ocurrido un error al procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Cerrar",
        });
    } finally {
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("confirmModal")
        );
        modal?.hide();
    }
}

async function handleSuggestionClick(e) {
    const suggestionItem = e.target;
    const ordenId = suggestionItem.dataset.id;
    const ordenLote = suggestionItem.textContent;
    elementsProduccion.inputSearchC.value = ordenLote;
    elementsProduccion.inputSearchC.setAttribute("data-id", ordenId);
    await infoContenedor(ordenId);

    // Limpiar sugerencias
    document.getElementById("suggestionsC").innerHTML = "";
}

async function buscarOrdenesC() {
    const suggestions = document.getElementById("suggestionsC");
    const query = elementsProduccion.inputSearchC.value.toLowerCase().trim();

    if (query === "") {
        suggestions.innerHTML = "";
        return;
    }

    try {
        const response = await API_PRODUCCION.get("/obtener", {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { data } = response;
        const resultados = data.filter((orden) =>
            orden.Lote.toLowerCase().includes(query)
        );

        renderSuggestions(resultados, suggestions, "C");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
    }
}

function renderSuggestions(resultados, container, tipo) {
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
        moreDiv.textContent = `+${
            resultados.length - maxResults
        } resultados más...`;
        container.appendChild(moreDiv);
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
    [
        "#tableContenedores",
        "#tablaPlatano",
        "#tablaCajas",
        "#tablaProveedores",
        "tablaProyecciones",
        "tablaEstadisticas",
        "tablaPorEmpacar",
        "tablaPorEmpacarProducciones",
    ].forEach((tableId) => {
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

async function cargarProducciones() {
    const res = await API_PRODUCCION.get(`/obtener-producciones`, {
        headers: { Authorization: "Bearer " + token },
    });

    if (!res.success) {
        alerts.show(res);
        return false;
    }

    const { data } = res;

    $("#tableContenedores").DataTable({
        data: data,
        searching: true,
        destroy: true,
        serverSide: false,
        responsive: true,
        orderCellsTop: true,
        deferRender: true,
        columns: [
            { data: "Fecha" },
            { data: "Lote" },
            { data: "ordenadas" },
            {
                data: "Proceso",
                render: (data, type, row) => {
                    if (data === "Finalizado") {
                        return `<span class="badge bg-success fw-semibold">${data}</span>`;
                    } else if (data === "En Proceso") {
                        return `<span class="badge bg-warning text-dark fw-semibold">${data}</span>`;
                    } else {
                        return `<span class="badge bg-secondary fw-semibold">${data}</span>`;
                    }
                },
            },
            {
                data: null,
                render: (data, type, row) => `

                     <div class="btn-group dropend">
  <button type="button" class="btn btn-light  btn-sm dropdown-toggle text-center d-flex align-items-center justify-content-center"
  data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #fffefdef;  width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3 suggestions">
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
     <li>
      <a class="dropdown-item d-flex align-items-center asignar-btn" data-id="${row.id}">
        <i class="fas fa-tags me-2" style="color: #ec6704"></i> Referencias 
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center finalizar-btn" data-id="${row.id}">
        <i class="fas fa-circle-check text-success me-2"></i> Terminado 
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

    // Registrar listeners de la tabla
    setupTableListeners("tableContenedores");
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
        await eliminarProduccion(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoProduccion(id);
    });

    eventManager.delegate(table, "click", ".finalizar-btn", async function (e) {
        const id = this.dataset.id;
        await finalizarProduccion(id);
    });

    eventManager.delegate(table, "click", ".asignar-btn", async function (e) {
        const id = this.dataset.id;
        document.getElementById("id_produccion_referencias").value = id;
        limpiarAsignar();
        $("#ModalReferencias").modal("show");
    });
}

async function abrirEditar(id_produccion) {
    const res = await API_PRODUCCION.get(`/obtener-id/${id_produccion}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!res.success) {
        alerts.show(res);
        return false;
    }
    const { data } = res;
    document.getElementById("id_produccion").value = data.id;
    document.getElementById("fecha_creacion").value = data.fecha_creacion;
    document.getElementById("lote_produccion").value = data.lote_produccion;
    document.getElementById("numero_cajas").value = data.numero_cajas;
    document.getElementById("inputElaboracion").value = data.responsable.nombre;
    document.getElementById("id_elaboracion").value =
        data.responsable.id_responsable;

    $("#ModalProduccion").modal("show");
}

function limpiarFormulario() {
    document.getElementById("formProduccion").reset();
    document.getElementById("id_produccion").value = "";
}

function limpiarAsignar() {
    // reseteamos todos los checks
    resetFormReferencias();
}

const limpiarModal = () => {
    $("#tablaCajas > tbody").empty();
    $("#tablaProveedores > tbody").empty();
    $("#platano").text(``);
    $("#fritura").text(``);
    $("#hfritura").text(``);
    $("#empaque").text(``);
    $("#total").text(``);
    $("#materiaPrima").text(``);
    $("#materiaCorte").text(``);
    $("#materiaProcesada").text(``);
    $("#canastillas").text(``);
    $("#cajasTotal").text(`0`);
};

// Limpia las Modals y datos Globales con la informacion del contenedor.
const limpiarModals = () => {
    // Datos Globales
    $("#materiaContenedor").text(`${0} Kg`);
    $("#gasContenedor").text(`${0}%`);
    $("#rechazoContenedor").text(`${0} Kg`);
    $("#bidonesContenedor").text(`${0}`);
    $("#proveedoreContenedor").text(`${0}`);
    //Modal de Recepcion
    $("#rendMate").text(`${0}`);
    $("#platanoRecep").text(`${0} Kg`);
    $("#platanoProcesado").text(`${0} Kg`);
    //Modal de Alistamiento
    $("#canastasPeladas").text(`${0}`);
    $("#rechazoAlist").text(`${0} Kg`);
    $("#maduroAlist").text(`${0} Kg`);
    //Modal de Fritura
    $("#patacones").text(`${0} Kg`);
    $("#canastillasConte").text(`${0}`);
    $("#rechazoFrit").text(`${0} Kg`);
    $("#migasFrit").text(`${0} Kg`);
    //Modal de Empaque
    $("#cajasConte").text(`${0}`);
    $("#rechazoEmp").text(`${0}`);
    $("#migasEmp").text(`${0}`);
};

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

function sanitizarCampos(datosProduccion) {
    for (let key in datosProduccion) {
        if (typeof datosProduccion[key] === "string") {
            datosProduccion[key] = escapeHtml(datosProduccion[key].trim());
        }
    }
    const regexFecha = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    const regexLote = /^[a-zA-Z0-9]*$/;

    datosProduccion.id_responsable = datosProduccion.id_responsable
        ?.toString()
        .trim();
    if (!regexFecha.test(datosProduccion.fecha_creacion)) {
        throw new Error(
            "El Formato de fecha no es valido. Debe ser YYYY-MM-dd."
        );
    }

    if (!regexLote.test(datosProduccion.lote_produccion)) {
        throw new Error(
            "El lote de produccion NO puede contener espacios o caracteres especiales."
        );
    }
    return datosProduccion;
}

async function formProduccion(e) {
    e.preventDefault();
    const id = document.getElementById("id_produccion").value;
    const datosProduccion = {
        fecha_creacion: document.getElementById("fecha_creacion").value,
        fecha_cierre: document.getElementById("fecha_cierre").value,
        lote_produccion: document.getElementById("lote_produccion").value,
        numero_cajas: document.getElementById("numero_cajas").value,
        id_responsable: document.getElementById("id_elaboracion").value,
    };
    console.log(datosProduccion);

    try {
        const produccion = sanitizarCampos(datosProduccion);
        const action = id
            ? actualizarProduccion(id, produccion)
            : guardarProduccion(produccion);
        await action;
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

async function guardarProduccion(produccion) {
    try {
        const response = await API_PRODUCCION.post("/crear", produccion, {
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
            $("#ModalProduccion").modal("hide");
            await cargarProducciones();
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

async function actualizarProduccion(id, produccion) {
    try {
        const response = await API_PRODUCCION.put(`/editar/${id}`, produccion, {
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
            $("#ModalProduccion").modal("hide");
            await cargarProducciones();
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

async function eliminarProduccion(id) {
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
            const response = await API_PRODUCCION.delete(`/eliminar/${id}`, {
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
                await cargarProducciones();
            }
        }
    });
}

async function finalizarProduccion(id_produccion) {
    try {
        const res = await API_PRODUCCION.delete(`/finalizar/${id_produccion}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }
        await cargarProducciones();
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

async function infoProduccion(id_produccion) {
    try {
        const res = await API_PRODUCCION.get(`/obtener-id/${id_produccion}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { data } = res;

        document.querySelector("#fecha_creacion_info").value =
            data.fecha_creacion;
        document.querySelector("#fecha_cierre_info").value = data.fecha_cierre;
        document.querySelector("#lote_produccion_info").value =
            data.lote_produccion;
        document.querySelector("#cantidad_info").value = data.cantidad;

        $("#ModalInfoproduccion").modal("show");
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

// Cargar las cajas de la bodega Bodega
async function proyeccionContenedor(id_contenedor) {
    try {
        const res = await API_PRODUCCION.get(
            `/proyeccion-contenedor/${id_contenedor}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        if (!res.success) {
            alerts.show(res);
            return false;
        }

        const { solicitud, bodega, inventarioProduccion, inventarioCajas } =
            res.data;

        // Escuchar cambios en inputs de ritmo

        // Ejecutar cálculos
        const inventarioActualizado = actualizarEstadoEmpaquePorProduccion(
            inventarioProduccion,
            inventarioCajas,
            solicitud
        );

        // Promedio de Cajas Activas
        const estadisticas = calcularEstadisticasProduccion(inventarioCajas);

        // Total Producido por referencia
        const cajasProducidas = obtenerCajasProducidas(
            inventarioCajas,
            solicitud
        );

        // Traemos las producciones que faltan por empacar
        const faltantes = inventarioActualizado.filter(
            (item) => item.CanastasDisponibles != 0
        );

        /*   console.log("Faltantes: ", faltantes); */

        const kilosPorEmpacar = faltantes.reduce((acc, item) => {
            const tipo = item.tipo;

            // Si es AF, sumar a "A"
            if (tipo === "AF") {
                if (!acc["A"]) {
                    acc["A"] = { tipo: "A", totalEmpacar: 0 };
                }
                acc["A"].totalEmpacar += item.kilosPendientes || 0;
                return acc;
            }

            // Para otros tipos (A, B, etc.)
            if (!acc[tipo]) {
                acc[tipo] = { tipo, totalEmpacar: 0 };
            }
            acc[tipo].totalEmpacar += item.kilosPendientes || 0;
            return acc;
        }, {});

        console.log("Por empacar: ", kilosPorEmpacar);

        const inputsRitmoDiv = document.getElementById("inputsRitmo");

        function actualizarDashboard() {
            // Leer ritmos por tipo
            const ritmoKg = document.getElementById("ritmoKg").value || 0;

            const rendimientos = {};
            solicitud.forEach((sol) => {
                const id = `rendimiento_${sol.caja}`;
                rendimientos[sol.caja] =
                    Number(document.getElementById(id).value) || 0;
            });

            const {
                proyecciones,
                totalSolicitado,
                totalProducido,
                totalFaltante,
                totalKilosSolicitados,
                totalKilosFaltantes,
                diasMaximo,
                porcentajeGlobal,
            } = calcularProyeccionCompleta(
                solicitud,
                cajasProducidas,
                kilosPorEmpacar,
                rendimientos,
                ritmoKg
            ); /* 

            console.log("inventario: ", cajasProducidas); */

            // Actualizar tarjetas principales
            document.getElementById("cajasSolicitadas").textContent =
                new Intl.NumberFormat("es-CL").format(totalSolicitado);
            document.getElementById("cajasProducidas").textContent =
                new Intl.NumberFormat("es-CL").format(totalProducido);
            document.getElementById("cajasFaltantes").textContent =
                new Intl.NumberFormat("es-CL").format(totalFaltante);
            document.getElementById("diasProyeccion").textContent =
                diasMaximo || "-";
            document.getElementById("kilosTotales").textContent =
                new Intl.NumberFormat("es-CL").format(
                    totalKilosSolicitados.toFixed(1)
                );

            document.getElementById(
                "porcentaje"
            ).textContent = `${porcentajeGlobal}% completado`;
            document.getElementById(
                "kilosFaltantes"
            ).textContent = `${new Intl.NumberFormat("es-CL").format(
                totalKilosFaltantes.toFixed(1)
            )} kg faltantes`;

            document.getElementById(
                "progressBar"
            ).style.width = `${porcentajeGlobal}%`;

            const proyeccionesArray = Object.values(proyecciones);

            const kilos = Object.values(kilosPorEmpacar);

            asignarInfoProyeccion(
                totalSolicitado,
                totalProducido,
                totalFaltante,
                totalKilosSolicitados,
                totalKilosFaltantes,
                diasMaximo,
                porcentajeGlobal
            );

            renderDataTableProyeccion(
                proyeccionesArray,
                estadisticas,
                bodega,
                kilos,
                inventarioActualizado
            );
        }

        solicitud.forEach((sol) => {
            const id = `rendimiento_${sol.caja}`;
            inputsRitmoDiv.innerHTML += `
            <div class="col-md-4">
                <div class="caja-card">
                    <div class="caja-card-header">
                       <div class="caja-name">
                           <i class="fas fa-box"></i>
                        Tipo ${sol.caja}
                        </div>
                    </div>
                       <label class="cantidad-label">% Rendimiento</label>
                       <input type="number" class="form-control cantidad-input text-center shadow-sm" min="0" step="1" placeholder="Ej: 40, 35, 48 .." id="${id}" />
                </div>
            </div>
            `;
        });

        solicitud.forEach((sol) => {
            document
                .getElementById(`rendimiento_${sol.caja}`)
                .addEventListener("input", actualizarDashboard);
        });
        actualizarDashboard();
    } catch (error) {
        console.error(error);
    }
}

// Información de Lote de producción.
const asignarInfo = (
    rendimientos,
    dataHFritura,
    dataFritura,
    totalCanastillas,
    rechazoTotal
) => {
    $("#platano").text(`${rendimientos[0].RendPlatano ?? 0}%`);
    $("#fritura").text(`${rendimientos[0].RendFritura ?? 0}%`);
    $("#hfritura").text(`${rendimientos[0].RendHFritura ?? 0}%`);
    $("#empaque").text(`${rendimientos[0].RendEmpaque ?? 0}%`);
    $("#total").text(`${rendimientos[0].RendTotal ?? 0}%`);
    $("#materiaPrima").text(
        ` ${new Intl.NumberFormat("es-CL").format(
            dataHFritura[0].totalMateria ?? 0
        )} kg`
    );
    $("#materiaCorte").text(
        `${new Intl.NumberFormat("es-CL").format(
            dataFritura[0].totalCorte ?? 0
        )} kg`
    );
    $("#materiaProcesada").text(
        `${new Intl.NumberFormat("es-CL").format(
            dataHFritura[0].totalFritura ?? 0
        )} Kg`
    );
    $("#canastillas").text(`${totalCanastillas ? totalCanastillas : 0}`);

    $("#rechazoTotal").text(
        `${rechazoTotal.value ? rechazoTotal.value : 0} Kg`
    );
};

// Información de Contenedor: Datos Globales
const asignarInfoContGlobal = (global, recepcion) => {
    const { Bidones, Rechazo, Gas, Proveedores } = global;
    $("#materiaContenedor").text(
        `${new Intl.NumberFormat("es-CL").format(recepcion.prima ?? 0)} Kg`
    );
    $("#gasContenedor").text(`${Gas ?? 0}%`);
    $("#rechazoContenedor").text(
        `${new Intl.NumberFormat("es-CL").format(Rechazo.RechazoTotal ?? 0)} Kg`
    );
    $("#bidonesContenedor").text(`${Bidones ?? 0}`);
    $("#proveedoreContenedor").text(`${Proveedores ?? 0}`);
};

// Información de Proyecion de Contenedor
const asignarInfoProyeccion = (
    totalSolicitado,
    totalProducido,
    totalFaltante,
    totalKilosSolicitados,
    totalKilosFaltantes,
    diasMaximo,
    porcentajeGlobal
) => {
    $("#cajasSolicitadas").text(
        `${new Intl.NumberFormat("es-CL").format(totalSolicitado)}`
    );
    $("#cajasProducidas").text(
        `${new Intl.NumberFormat("es-CL").format(totalProducido)}`
    );
    $("#cajasFaltantes").text(
        `${new Intl.NumberFormat("es-CL").format(totalFaltante)} `
    );
    $("#diasProyeccion").text(`${diasMaximo ?? 0}`);
    $("#kilosTotales").text(
        `${new Intl.NumberFormat("es-CL").format(
            totalKilosSolicitados.toFixed(1)
        )}`
    );
    $("#porcentaje").text(`${porcentajeGlobal}% completado`);

    $("#kilosDiarios").text(
        `${new Intl.NumberFormat("es-CL").format(
            totalKilosFaltantes.toFixed(1)
        )} kg/día`
    );
    $("#progressBar").css("width", `${porcentajeGlobal}%`);
};

// Información de Contenedor a las Modales de cada area
const asignarInfoModals = (recepcion, alistamiento, fritura, empaque) => {
    $("#rendMate").text(`${recepcion.rendimiento ?? 0}`);
    $("#platanoRecep").text(
        `${new Intl.NumberFormat("es-CL").format(recepcion.prima ?? 0)} Kg`
    );
    $("#platanoProcesado").text(
        `${new Intl.NumberFormat("es-CL").format(recepcion.procesada ?? 0)} Kg`
    );
    $("#canastasPeladas").text(`${alistamiento.canastillas ?? 0}`);
    $("#rechazoAlist").text(`${alistamiento.rechazo ?? 0} Kg`);
    $("#maduroAlist").text(`${alistamiento.maduro ?? 0} Kg`);

    $("#patacones").text(
        `${new Intl.NumberFormat("es-CL").format(fritura.patacon ?? 0)} Kg`
    );
    $("#canastillasConte").text(`${fritura.canastillas ?? 0}`);
    $("#rechazoFrit").text(
        `${new Intl.NumberFormat("es-CL").format(fritura.rechazo ?? 0)} Kg`
    );
    $("#migasFrit").text(
        `${new Intl.NumberFormat("es-CL").format(fritura.migas ?? 0)} Kg`
    );

    $("#cajasConte").text(`${empaque.cajas ?? 0}`);
    $("#rechazoEmp").text(`${empaque.rechazo ?? 0}`);
    $("#migasEmp").text(`${empaque.migas ?? 0}`);
};

function calcularEstadisticasProduccion(inventario) {
    const estadisticas = {};
    const tiposCaja = [...new Set(inventario.map((item) => item.tipo))];

    tiposCaja.forEach((tipo) => {
        const propiedadCaja = `${tipo.toUpperCase()}`;
        const producciones = inventario.filter(
            (item) => item.tipo === propiedadCaja
        );
        const produccionesActivas = producciones.filter(
            (p) => p.total_cajas > 0
        );
        const total = producciones.reduce(
            (sum, val) => sum + val.total_cajas,
            0
        );
        const promedioActivo =
            produccionesActivas.length > 0
                ? produccionesActivas.reduce(
                      (sum, val) => sum + val.total_cajas,
                      0
                  ) / produccionesActivas.length
                : 0;

        estadisticas[tipo] = {
            tipo,
            total,
            promedioActivo: Math.round(promedioActivo * 100) / 100,
            diasProduccion: produccionesActivas.length,
            maximo: Math.max(...producciones.map((item) => item.total_cajas)),
            minimo:
                produccionesActivas.length > 0
                    ? Math.min(
                          ...produccionesActivas.map((item) => item.total_cajas)
                      )
                    : 0,
        };
    });

    return estadisticas;
}

function actualizarEstadoEmpaquePorProduccion(
    inventarioProduccion,
    inventarioCajas,
    cajasSolicitadas
) {
    const cajasMap = {};

    inventarioCajas.forEach((c) => {
        if (!cajasMap[c.fecha_produccion]) {
            cajasMap[c.fecha_produccion] = {};
        }

        const tipo = c.tipo.toUpperCase();

        cajasMap[c.fecha_produccion][tipo] = {
            total_cajas: c.total_cajas || 0,
            numero_canastas: c.numero_canastas || 0,
        };
    });

    // Procesar cada producción
    const produccionActualizada = inventarioProduccion
        // solo producciones de tipos solicitados
        .map((prod) => {
            const fecha = prod.fecha_produccion;
            const tipo = prod.tipo;
            const totalProducido = prod.totalMateria;
            const canastasProducidas = prod.canastas;

            const tipoReal = tipo === "AF" ? "A" : tipo;
            const pesoCaja = cajasSolicitadas.find((p) => p.caja === tipoReal);
            // si no hay config de kilosPorCaja para ese tipo, no se calcula
            const kilosPorCaja = pesoCaja?.peso_promedio ?? 0;

            // Kilos empacados para esta producción específica
            let kilosEmpacados = 0;
            let canastasEmpacadas = 0;
            let cajasEmpacadas = 0;
            let kilosPorCanasta = 0;
            let canstasSobrante = 0;

            if (cajasMap[fecha]?.[tipo]) {
                const datosEmpaque = cajasMap[fecha][tipo];
                const canastasRegistradas =
                    Number(datosEmpaque.numero_canastas) || 0;

                // Calcular canastas efectivamente empacadas (considerando límite de producción)
                if (canastasRegistradas > canastasProducidas) {
                    // Hay más canastas registradas que producidas (defecto)
                    canastasEmpacadas = canastasProducidas;
                    canstasSobrante = canastasRegistradas - canastasProducidas;
                } else {
                    canastasEmpacadas = canastasRegistradas;
                }

                // Calcular kilos por canasta (evitar división por cero)
                kilosPorCanasta =
                    canastasEmpacadas > 0
                        ? totalProducido / canastasEmpacadas
                        : 0;

                // Calcular totales de cajas empacadas
                cajasEmpacadas = Number(datosEmpaque.total_cajas) || 0;
                kilosEmpacados = cajasEmpacadas * kilosPorCaja;
            }

            // Canastas pendientes por empacar
            const canastasPendientes = Math.max(
                0,
                Number(canastasProducidas || 0) - canastasEmpacadas
            );

            // Kilos pendientes por empacar
            const kilosPendientes = Math.max(
                0,
                totalProducido - kilosEmpacados
            );

            // Determinar estado empacado
            const completamenteEmpacado = kilosPendientes === 0;

            return {
                ...prod,
                kilosEmpacados: Math.round(kilosEmpacados * 10) / 10,
                kilosPendientes: Math.round(kilosPendientes * 10) / 10,
                KilosPorCanasta: Math.round(kilosPorCanasta * 10) / 10,
                CanastasDisponibles: canastasPendientes,
                CanastasEmpacadas: canastasEmpacadas,
                CajasEmpacadas: cajasEmpacadas,
                CanastasDesface: canstasSobrante,
                empacado: completamenteEmpacado,
            };
        });

    return produccionActualizada;
}
function obtenerCajasProducidas(inventarioCajas, solicitudes) {
    const resultado = {};

    solicitudes.forEach((solicitud) => {
        const tipo = solicitud.caja;

        // AF se trata como A
        const tipoReal = tipo === "AF" ? "A" : tipo;

        let totalCajas = 0;

        // Sumar todas las cajas del tipo solicitado
        inventarioCajas.forEach((caja) => {
            // Si el tipo real es "A", sumar tanto A como AF
            if (tipoReal === "A" && (caja.tipo === "A" || caja.tipo === "AF")) {
                totalCajas += caja.total_cajas || 0;
            }
            // Para otros tipos, solo sumar el tipo exacto
            else if (caja.tipo === tipoReal) {
                totalCajas += caja.total_cajas || 0;
            }
        });

        if (!resultado[tipoReal]) resultado[tipoReal] = { totalProducido: 0 };
        resultado[tipoReal].totalProducido = totalCajas;
    });

    return resultado;
}

function calcularProyeccionCompleta(
    solicitudes,
    cajasProducidas,
    kilosPorEmpacar,
    rendimientos,
    ritmoKilos
) {
    const proyecciones = {};

    let totalSolicitado = 0;
    let totalProducido = 0;
    let totalFaltante = 0;
    let totalKilosSolicitados = 0;
    let totalKilosFaltantes = 0;

    let diasMaximo = 0;
    solicitudes.forEach((sol) => {
        const tipo = sol.caja;
        const solicitado = sol.numero_cajas;
        const producido = cajasProducidas[tipo]?.totalProducido || 0; // cajas producidas
        const faltante = Math.max(0, solicitado - producido); // cajas faltantes
        const kilosSolicitados = solicitado * sol.peso_promedio;
        const kilosProducidos = producido * sol.peso_promedio;
        const rendimientoTipo = Number(rendimientos[tipo] || 1) / 100; // Porcentaje de rendimiento
        const kilosCaja = faltante * sol.peso_promedio;
        const kilosFaltantes = Math.max(
            0,
            kilosCaja - Number(kilosPorEmpacar[tipo]?.totalEmpacar || 0)
        );

        console.log(`kg faltantes tipo ${tipo}: `, kilosFaltantes);

        const KilosVerde = kilosFaltantes / rendimientoTipo;
        const diasTipo = KilosVerde / Number(ritmoKilos) || 0;

        console.log(`dias tipo ${tipo} : `, diasTipo.toFixed(2));
        proyecciones[tipo] = {
            tipo,
            cajasSolicitadas: solicitado,
            cajasProducidas: producido,
            cajasFaltantes: faltante,
            porcentajeCompletado:
                solicitado > 0 ? Math.round((producido / solicitado) * 100) : 0,
            kilosSolicitados,
            kilosProducidos,
            kilosFaltantes: kilosFaltantes.toFixed(2),
            KilosVerde: KilosVerde.toFixed(2),
            diasTipo: diasTipo.toFixed(2),
        };

        totalSolicitado += solicitado;
        totalProducido += producido;
        totalFaltante += faltante;
        totalKilosSolicitados += kilosSolicitados;
        totalKilosFaltantes += kilosFaltantes;
        diasMaximo = Math.max(diasMaximo, diasTipo.toFixed(2));
    });

    const porcentajeGlobal =
        totalSolicitado > 0
            ? Math.round((totalProducido / totalSolicitado) * 100)
            : 0;

    return {
        proyecciones,
        totalSolicitado,
        totalProducido,
        totalFaltante,
        totalKilosSolicitados,
        totalKilosFaltantes,
        diasMaximo,
        porcentajeGlobal,
    };
}

// Modal de Información de Producción
async function infoRendimiento(event) {
    const valor = event.target.value;
    if (!valor) {
        return;
    }
    limpiarModal();
    try {
        const res = await API_PRODUCCION.get(`/performance/${valor}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const {
            data,
            rechazo,
            rechazoTotal,
            rendimientoFritura,
            rendimientoHFritura,
            rendimientoProveedores,
            dataProveedor,
            cajas,
            totalCanastillas,
        } = res.data;

        renderDataTableCaja(cajas);
        renderDataTableProv(rendimientoProveedores);
        renderDataTableDetalleProv(dataProveedor);
        drawChart(rechazo, "graficaRechazo");
        asignarInfo(
            data,
            rendimientoHFritura,
            rendimientoFritura,
            totalCanastillas,
            rechazoTotal
        );

        $("#ModalInfoDataProd").modal("show");
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1900,
        });
    }
}

// Información de Contenedor.
async function infoContenedor(id) {
    limpiarModals();
    try {
        const res = await API_PRODUCCION.get(`/container-info/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            alerts.show(res);
            return false;
        }

        const { container } = res.data;
        const { Recepcion, Alistamiento, Fritura, Empaque, InfoGlobal } =
            container;
        const { RechazoAreas } = InfoGlobal.Rechazo;
        asignarInfoContGlobal(InfoGlobal, Recepcion);
        drawChartBar(RechazoAreas, "rendimientoChart");
        asignarInfoModals(Recepcion, Alistamiento, Fritura, Empaque);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 1900,
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
    const response = await API_EMPLEADO.get(`/obtener-by-rol/Elaborador`, {
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

const renderPanel = async () => {
    const response = await API_PRODUCCION.get("/obtener", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return;
    }
    const { data } = response;

    const ordenlist = document.getElementById("ordenlist");
    data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id + " / " + item.Lote;
        option.dataset.id = item.id;
        ordenlist.appendChild(option);
    });

    document.getElementById(`nombreorden`).addEventListener("input", (e) => {
        const selectedOption = ordenlist.querySelector(
            `option[value="${e.target.value}"]`
        );
        if (selectedOption) {
            document.getElementById(`ordenid`).value =
                selectedOption.dataset.id;
        }
    });
};

const renderOrden = async () => {
    try {
        const response = await API_ENCARGO.get("/obtener", {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);

            document.getElementById("ordenactual").textContent =
                "Error al obtener la orden actual.";
            return;
        }
        const { ordenProduccion } = response.data;
        document.getElementById("ordenactual").textContent =
            ordenProduccion.lote_produccion;

        proyeccionContenedor(ordenProduccion.id);
    } catch (error) {
        console.error(error);
    }
};

// Tabla de cajas.
const renderDataTableCaja = async (dataCaja) => {
    try {
        // Tabla de Rendimiento de Materia Prima o Platano.
        $(`#tablaCajas`).DataTable({
            data: dataCaja,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [{ data: "caja" }, { data: "cantidad" }],
            columnDefs: [
                {
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`
                        );
                    },
                },
            ],

            footerCallback: function (row, data, start, end, display) {
                var api = this.api();
                var intVal = function (i) {
                    return typeof i === "string"
                        ? parseFloat(i) || 0
                        : typeof i === "number"
                        ? i
                        : 0;
                };

                var totalesPorTipo = api
                    .column(1)
                    .data()
                    .reduce(function (a, b) {
                        return intVal(a) + intVal(b);
                    });

                var texto = `<span class="badge bg-light text-dark fw-semibold fs-6"> ${totalesPorTipo}</span>`;
                $(api.column(1).footer()).html(texto);
            },

            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 6) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla.",
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
        elementsProduccion.inputSaerchFecha.value = "";
    }
};

// Tabla de proveedores Produccion
const renderDataTableProv = async (dataProv) => {
    try {
        $(`#tablaProveedores`).DataTable({
            data: dataProv,
            searching: false,
            destroy: true,
            serverSide: false,
            responsive: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "proveedor" },
                { data: "materia" },
                { data: "totalMateria" },
                { data: "rendimiento" },
            ],
            columnDefs: [
                {
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-O">${cellData} Kg</span>`
                        );
                    },
                },
                {
                    targets: 2, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-O">${cellData} Kg</span>`
                        );
                    },
                },
                {
                    targets: 3, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-N">${cellData}%</span>`);
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 6) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });
        $(`#tablaProveedores tbody`).on("click", ".info-btn", function () {
            onInfo(this.dataset.id);
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

// Tabla de (detalle o rendimiento ) de los proveedores en 1 produccion.
const renderDataTableDetalleProv = async (dataProv) => {
    try {
        $(`#tablaCanastasProveedor`).DataTable({
            data: dataProv,
            searching: false,
            destroy: true,
            serverSide: false,
            responsive: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "proveedor" },
                { data: "tipo" },
                { data: "materia" },
            ],
            columnDefs: [
                {
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`
                        );
                    },
                },
                {
                    targets: 2, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-O">${cellData} Kg</span>`
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 6) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
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

// Tabla de Proyeccion de Contenedor.
const renderDataTableProyeccion = async (
    proyecciones,
    estadisticas,
    bodega,
    kilos,
    inventarioActualizado,
    producciones
) => {
    try {
        //====================================================
        // TABLAS DE INFORMACIÓN DE PROYECCIÓN DE CONTENEDOR
        //====================================================
        $("#tablaProyecciones").DataTable({
            data: proyecciones,
            searching: false,
            destroy: true,
            responsive: true,
            pageLength: 6,
            dom: "Bfrtip",
            columns: [
                { data: "tipo" },
                { data: "cajasSolicitadas" },
                { data: "cajasProducidas" },
                { data: "cajasFaltantes" },
                { data: "kilosSolicitados" },
                { data: "kilosProducidos" },
                { data: "kilosFaltantes" },
                { data: "KilosVerde" },
                {
                    data: "porcentajeCompletado",
                    render: function (data, type, row) {
                        if (type !== "display") return data;
                        const val = parseFloat(data ?? 0, 10);
                        let span = "";

                        if (val > 90) {
                            span = `<span class="badge rounded-pill fw-semibold fs-6" style="background-color: #e2f8d7ff; color: #4fb415fb">${val}%</span>`;
                        } else if (val > 55 && val <= 90) {
                            span = `<span class="badge rounded-pill fw-semibold fs-6" style="background-color: #d7ecf8ff; color: #2532e9ff">${val}%</span>`;
                        } else if (val >= 43 && val <= 55) {
                            span = `<span class="badge rounded-pill fw-semibold fs-6" style="background-color: #f8eed7ff; color: #d8a429ff">${val}%</span>`;
                        } else if (val < 43) {
                            span = `<span class="badge rounded-pill fw-semibold fs-6" style="background-color: #f8d7da; color: #be0f1dff">${val}%</span>`;
                        } else {
                            span = `<span class="badge rounded-pill fw-semibold text-dark fs-6">${val}%</span>`;
                        }

                        return span;
                    },
                },
                { data: "diasTipo" },
            ],
            columnDefs: [
                {
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`
                        );
                    },
                },
                {
                    targets: 1, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )}`
                        );
                    },
                },
                {
                    targets: 2, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-AZ">${new Intl.NumberFormat(
                                "es-CL"
                            ).format(cellData.toFixed(1))}</span>`
                        );
                    },
                },
                {
                    targets: 3, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-B">${new Intl.NumberFormat(
                                "es-CL"
                            ).format(cellData.toFixed(1))}</span>`
                        );
                    },
                },
                {
                    targets: 4, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text">${new Intl.NumberFormat(
                                "es-CL"
                            ).format(cellData.toFixed(1))}</span>`
                        );
                    },
                },
                {
                    targets: 5, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span >${new Intl.NumberFormat("es-CL").format(
                                cellData.toFixed(1)
                            )}</span>`
                        );
                    },
                },

                {
                    targets: 6, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text">${new Intl.NumberFormat(
                                "es-CL"
                            ).format(cellData)}</span>`
                        );
                    },
                },

                {
                    targets: 7, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-A">${new Intl.NumberFormat(
                                "es-CL"
                            ).format(cellData)}</span>`
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros < 7) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                emptyTable: "No hay datos disponibles en la tabla",
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            },
        });

        let data = Object.values(estadisticas);

        $("#tablaEstadisticas").DataTable({
            data: data,
            searching: true,
            destroy: true,
            responsive: true,
            pageLength: 7,
            dom: "Bfrtip",
            columns: [
                { data: "tipo" },
                { data: "total" },
                { data: "promedioActivo" },
                { data: "diasProduccion" },
                { data: "maximo" },
                { data: "minimo" },
            ],
            columnDefs: [
                {
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-A">${cellData}</span>`
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros < 7) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });

        $("#tablaPorEmpacar").DataTable({
            data: kilos,
            responsive: true,
            destroy: true,
            orderCellsTop: true,
            pageLength: 6,
            dom: "Bfrtip",
            columns: [{ data: "tipo" }, { data: "totalEmpacar" }],
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
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });

        $("#tablaPorEmpacarProducciones").DataTable({
            data: inventarioActualizado,
            orderCellsTop: true,
            responsive: true,
            pageLength: 15,
            destroy: true,
            dom: "Bfrtip",
            columns: [
                { data: "fecha_produccion" },
                { data: "tipo" },
                { data: "totalMateria" },
                { data: "canastas" },
                { data: "KilosPorCanasta" },
                { data: "CajasEmpacadas" },
                { data: "kilosEmpacados" },
                { data: "kilosPendientes" },
                { data: "CanastasEmpacadas" },
                { data: "CanastasDisponibles" },
                { data: "CanastasDesface" },
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
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });

        $("#tablaInventario").DataTable({
            data: bodega,
            searching: true,
            destroy: true,
            pageLength: 6,
            dom: "Bfrtip",
            responsive: true,
            columns: [
                { data: "fecha_produccion" },
                { data: "tipo_a" },
                { data: "tipo_af" },
                { data: "tipo_xl" },
                { data: "tipo_b" },
                { data: "tipo_bh" },
                { data: "tipo_c" },
                { data: "tipo_cil" },
                { data: "tipo_p" },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros < 7) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        });
        /* 
        $("#tablaInventarioDiario").DataTable({
            data: producciones,
            searching: true,
            destroy: true,
            pageLength: 6,
            columns: [
                { data: "produccion" },
                { data: "tipo" },
                { data: "cantidad" },
            ],
            columnDefs: [
                {
                    targets: 1, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">C</span><span class="text-AG">${cellData}</span>`
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros < 7) {
                    tableWrapper.find(".dataTables_paginate").hide();
                } else {
                    tableWrapper.find(".dataTables_paginate").show();
                }
            },
            dom: "Bfrtip",
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
        }); */
    } catch (error) {
        console.error(error);
    }
};

// Grafica de Rechazo por Area etc. Chart.Js
function drawChartBar(data, id) {
    const ctx = document.getElementById(`${id}`).getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Recepcion",
                "Alistamiento",
                "Corte",
                "Fritura",
                "Empaque",
            ],
            datasets: [
                {
                    label: "Rechazo (kg)",
                    data: data,
                    backgroundColor: [
                        "#6c780d",
                        "#b4c348",
                        "#fab612",
                        "#ec670a",
                        "#10100f",
                    ],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
        },
    });
}

// Grafica D3.JS RECHAZO POR AREA, 1 DIA DE PRODUCCIÓN.
function drawChart(data, id) {
    if (!data || data.length === 0) return;
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    // Escalas
    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)]) // rango de valores
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
    const svg = d3.create("svg").attr("width", width).attr("height", height);

    d3.select(`#${id}`).selectAll("*").remove();

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
