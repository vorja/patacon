import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
const API_PROVEEDOR = new ApiService("http://localhost:3105/data/proveedor");
const API_PRODUCCION = new ApiService("http://localhost:3105/data/produccion");

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
    if (elementsProveedor.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsProveedor.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsProveedor.formProveedor) {
        listenerIds.formProveedor = eventManager.add(
            elementsProveedor.formProveedor,
            "submit",
            formProveedor
        );
    }

    if (elementsProveedor.inputSearchP) {
        listenerIds.searchP = eventManager.addDebounced(
            elementsProveedor.inputSearchP,
            "input",
            buscarProveedores,
            300
        );
    } else {
        console.warn("Input de búsqueda de Proveedores no encontrado");
    }

    const suggestionsProveedores = document.getElementById("suggestionsP");
    if (suggestionsProveedores) {
        eventManager.delegate(
            suggestionsProveedores,
            "click",
            ".suggestion-item",
            handleSuggestionClick
        );
    }
    console.log(" Event Listeners configurados:", eventManager.getStats());
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
    document.getElementById("suggestionsP").innerHTML = "";
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalProveedoresPlatano").modal("show");
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

async function buscarProveedores() {
    const suggestions = document.getElementById("suggestionsP");
    const query = elementsProveedor.inputSearchP.value.toLowerCase().trim();

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
            proveedor.Nombre.toLowerCase().includes(query)
        );

        renderSuggestions(resultados, suggestions, "P");
    } catch (error) {
        console.error("Error al buscar órdenes:", error);
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
        $("#tablaProveedores").DataTable({
            data: proveedores,
            searching: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
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
    if (!table) return;

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
            }
        );

        if (!res.success) {
            alerts.show(res);
            return false;
        }
        const { global } = res.data;
        // Tabla de Rendimiento de Materia Prima o Platano.
        $(`#tablaRendProveedores`).DataTable({
            data: global,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
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
                    targets: 0, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-I">${cellData}</span>`);
                    },
                },
                {
                    targets: 1, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-O">${cellData}</span>`);
                    },
                },
                {
                    targets: 2, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-F">${cellData} Kg</span>`
                        );
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 10) {
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

        $("#tablaRendProveedores tbody").on("click", ".info-btn", function () {
            rendimientoProveedor(this.dataset.fecha, this.dataset.id);
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
        drawChart(rechazo, "graficaRechazoProv");
        $(`#cajasProveedor`).DataTable({
            data: cajas,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [{ data: "caja" }, { data: "cantidad" }],
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
                        $(td).html(`<span class="text-O">${cellData}</span>`);
                    },
                },
            ],
            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 3) {
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

        const { detalles } = cortes[0];
        $(`#cortesProveedor`).DataTable({
            data: detalles,
            destroy: true,
            searching: false,
            serverSide: false,
            responsive: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [{ data: "tipo" }, { data: "materia" }],
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
            ],

            drawCallback: function () {
                let api = this.api();
                let numRegistros = api.rows({ filter: "applied" }).count();
                let tableWrapper = $(api.table().container());
                if (numRegistros <= 3) {
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

    document.querySelector("#id_proveedor").value = data.id;
    elementsProveedor.nombre.value = data.nombre;
    elementsProveedor.identificacion.value = data.identificacion;
    elementsProveedor.telefono.value = data.movil;

    $("#ModalProveedoresPlatano").modal("show");
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
        "#tablaPlatano",
        "#cajasProveedor",
        "#cortesProveedor",
        "tablaRendProveedores",
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
    const regexDocumento = /^\d{10,11}$/;
    const regexTelefono = /^\d{10,11}$/;

    if (!regexDocumento.test(dataProveedor.identificacion)) {
        throw new Error(
            "El documento debe tener entre 10 y 11 dígitos numéricos consecutivos."
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
        identificacion: elementsProveedor.identificacion.value,
        nombre: elementsProveedor.nombre.value,
        movil: elementsProveedor.telefono.value,
    };

    try {
        const proveedor = sanitizarCampos(datosProveedores);
        const action = id
            ? actualizarProveedor(id, proveedor)
            : guardarProveedor(proveedor);
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
//Infomación de Rendimiento de Proveedor: Modúlo de Rendimiento.
const asignarInfoProveedor = (rendimientos, dataFritura) => {
    $("#progPlatano")
        .text(`${rendimientos[0].RendPlatano ?? 0}%`)
        .css("width", `${rendimientos[0].RendPlatano}%`);
    $("#labelPlatano").text(`${rendimientos[0].RendPlatano}%`);

    $("#progFritura")
        .text(`${rendimientos[0].RendFritura ?? 0}%`)
        .css("width", `${rendimientos[0].RendFritura}%`);
    $("#labelFritura").text(`${rendimientos[0].RendFritura}%`);

    $("#progHFritura")
        .text(`${rendimientos[0].RendHFritura ?? 0}%`)
        .css("width", `${rendimientos[0].RendHFritura}%`);
    $("#labelHFritura").text(`${rendimientos[0].RendHFritura}%`);

    $("#progEmpaque")
        .text(`${rendimientos[0].RendEmpaque ?? 0}%`)
        .css("width", `${rendimientos[0].RendEmpaque}%`);
    $("#labelEmpaque").text(`${rendimientos[0].RendEmpaque}%`);

    $("#rendimientoPro").text(`${rendimientos[0].RendTotal ?? 0}%`);

    // Informacion del Proceso de Fritura
    $("#fritFecha").text(`${dataFritura[0]?.info[0].fecha ?? 0}`);
    $("#fritIni").text(`${dataFritura[0].inicio_fritura ?? 0}`);
    $("#fritFin").text(`${dataFritura[0].fin_fritura ?? 0}`);
    $("#fritDuracion").text(`${dataFritura[0].tiempo_fritura ?? 0} min`);
    $("#fritTemperatura").text(`${dataFritura[0].temperatura_fritura ?? 0} °C`);
    $("#fritCanastas").text(`${dataFritura[0].canastas ?? 0}`);
    $("#fritKgPatacon").text(`${dataFritura[0].materia_kg ?? 0}`);
    $("#fritMigas").text(`${dataFritura[0].migas ?? 0}`);
    $("#fritRechazo").text(`${dataFritura[0].rechazo ?? 0}`);
};

const asignarConteo = (data) => {
    const cardProveedores = {
        Provedores: document.querySelector("#Proveedores"),
    };
    cardProveedores.Provedores.textContent = data;
};
// Grafica D3.JS RECHAZO POR AREA, 1 DIA DE PRODUCCIòN.
function drawChart(data, id) {
    if (!data || data.length === 0) return;

    const container = document.querySelector(".container-proveedores");
    const containerWidth = container.offsetWidth;

    const margin = { top: 40, right: 20, bottom: 50, left: 50 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, data.length * 40);

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
