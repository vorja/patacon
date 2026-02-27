import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_INVENTARIO = new ApiService(Url + "/data/inventario");
const API_PROVEEDORES = new ApiService(Url + "/data/proveedorInsumos");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Variable para almacenar la instancia de DataTable
let dataTableInstance = null;

export async function init() {
    try {
        await cargarInventario();
        await llenarProveedor();
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

const elementsInventario = {
    btnAgregar: document.getElementById("btnAgregar"),
    formInventario: document.getElementById("formInventario"),
};
const listenerIds = {
    btnAgregar: null,
    formInventario: null,
    tableInventario: null,
};

function setupEventListeners() {
    if (elementsInventario.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsInventario.btnAgregar,
            "click",
            handleAgregarClick,
        );
    }

    if (elementsInventario.formInventario) {
        listenerIds.formInventario = eventManager.add(
            elementsInventario.formInventario,
            "submit",
            formItem,
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
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
        await eliminarItem(id);
    });

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoItem(id);
    });
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalInventario").modal("show");
}

async function cargarInventario() {
    try {
        const response = await API_INVENTARIO.get(`/obtener`, {
            headers: { Authorization: "Bearer " + token },
        });
        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { items, conteoItems } = response.data;
        asignarConteo(conteoItems);

        // Verificar si ya existe una instancia y destruirla
        if ($.fn.DataTable.isDataTable("#tableInventario")) {
            dataTableInstance.clear().rows.add(items).draw();
        } else {
            // Solo crear la tabla si no existe
            // Primero, asegurarnos de que el HTML de la tabla está correcto
            const tableElement = document.getElementById("tableInventario");
            if (!tableElement.querySelector("thead")) {
                // Recrear la estructura si se perdió
                tableElement.innerHTML = `
                    <thead>
                        <tr>
                            <th>Proveedor</th>
                            <th>Medida</th>
                            <th>Área</th>
                            <th>Nombre</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                        <!-- Fila de filtros -->
                        <tr>
                            <th><input type="text" class="form-control form-control-sm" placeholder="Buscar..." /></th>
                            <th>
                                <select class="form-select form-select-sm">
                                    <option value="">Todos</option>
                                </select>
                            </th>
                            <th>
                                <select class="form-select form-select-sm">
                                    <option value="">Todos</option>
                                </select>
                            </th>
                            <th><input type="text" class="form-control form-control-sm" placeholder="Buscar..." /></th>
                            <th><input type="text" class="form-control form-control-sm" placeholder="Buscar..." /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
            }

            // Crear la nueva instancia de DataTable
            dataTableInstance = $("#tableInventario").DataTable({
                data: items,
                processing: true,
                serverSide: false,
                responsive: true,
                orderCellsTop: true,
                deferRender: true,
                dom: "Bfrtip",
                columns: [
                    { data: "Proveedor" },
                    { data: "Medida" },
                    { data: "Area" },
                    { data: "Nombre" },
                    {
                        data: "Stock",
                        render: function (data, type, row) {
                            if (type !== "display") return data;
                            const val = parseInt(data ?? 0, 10);
                            if (val <= 1) {
                                return `<span class="badge bg-danger rounded-pill fw-bold">${val}</span>`;
                            }
                            return `<span class="badge bg-success rounded-pill fw-bold">${val}</span>`;
                        },
                    },
                    {
                        data: null,
                        render: (data, type, row) => `
                           <div class="btn-group dropend">
                              <button type="button" class="btn btn-light btn-sm dropdown-toggle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; border-radius: 50%;" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-ellipsis-v"></i>
                              </button>
                              <ul class="dropdown-menu shadow-sm border-0 rounded-3">
                                <li>
                                  <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}">
                                    <i class="fas fa-circle-info text-info me-2"></i> Información
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
                        orderable: false,
                        searchable: false,
                    },
                ],
                drawCallback: function () {
                    var api = this.api();
                    let numRegistros = api.rows({ filter: "applied" }).count();
                    let tableWrapper = $(api.table().container());
                    if (numRegistros <= 11) {
                        tableWrapper.find(".dataTables_paginate").hide();
                    } else {
                        tableWrapper.find(".dataTables_paginate").show();
                    }

                    // Reconfigurar listeners después de cada draw
                    setupTableListeners("tableInventario");
                },
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                    emptyTable: "No hay datos disponibles en la tabla",
                },
                initComplete: function () {
                    const api = this.api();
                    const $header = $(api.table().header());

                    // Configurar filtros
                    api.columns().every(function (colIdx) {
                        const column = this;
                        const $thFilter = $header
                            .find("tr:eq(1) th")
                            .eq(colIdx);

                        // INPUT -> búsqueda libre
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

                        // SELECT -> opciones únicas
                        const $select = $thFilter.find("select");
                        if ($select.length) {
                            // Limpiar y llenar opciones únicas
                            $select
                                .empty()
                                .append('<option value="">Todos</option>');

                            const uniques = column.data().unique().sort();
                            uniques.each(function (d) {
                                if (d !== null && d !== undefined && d !== "") {
                                    $select.append(
                                        `<option value="${d}">${d}</option>`,
                                    );
                                }
                            });

                            $select.off("change").on("change", function () {
                                const val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val(),
                                );
                                column
                                    .search(val ? `^${val}$` : "", true, false)
                                    .draw();
                            });
                        }
                    });

                    setupTableListeners("tableInventario");
                },
            });
        }
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

// Modificar la función cleanupDataTables para ser más cuidadosa
function cleanupDataTables() {
    if (dataTableInstance) {
        try {
            // Solo destruir si realmente es necesario
            if ($.fn.DataTable.isDataTable("#tableInventario")) {
                dataTableInstance.destroy(true); // true para preservar el HTML
            }
        } catch (error) {
            console.warn("Error al limpiar DataTable:", error);
        }
        dataTableInstance = null;
    }
}

function limpiarFormulario() {
    document.getElementById("formInventario").reset();
    document.getElementById("id_item").value = "";
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

function sanitizarCampos(dataItem) {
    for (let key in dataItem) {
        if (typeof dataItem[key] === "string") {
            dataItem[key] = escapeHtml(dataItem[key].trim());
        }
    }
    const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/;
    const regexCantidad = /^\d+$/;
    const regexMedida = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ]+$/;
    const regexId = /^\d+$/;

    if (!regexCantidad.test(dataItem.stock)) {
        throw new Error(
            "Solo se permiten datos numericos, Ingrese un valor valido.",
        );
    }

    if (!regexId.test(dataItem.id_proveedor)) {
        throw new Error("Seleccione un proveedor valio..");
    }

    if (!regexNombre.test(dataItem.nombre)) {
        throw new Error("El Nombre contiene caracteres no permitidos.");
    }

    if (!regexMedida.test(dataItem.medida)) {
        throw new Error(
            "La Medida no debe contener espacios o caracteres no permitidos.",
        );
    }
    if (!regexMedida.test(dataItem.area)) {
        throw new Error("El area seleccionado no es  valido.");
    }

    return dataItem;
}

// Guardar Registro
async function formItem(e) {
    e.preventDefault();
    const id = document.getElementById("id_item").value;
    const datosItem = {
        nombre: document.querySelector("#nombre").value,
        stock: parseFloat(document.querySelector("#stock").value),
        medida: document.querySelector("#medida").value,
        area: document.querySelector("#area").value,
        id_proveedor: document.querySelector("#proveedores").value,
    };
    try {
        const item = sanitizarCampos(datosItem);
        if (id) {
            await actualizarItem(id, item);
        } else {
            await guardarItem(item);
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

async function actualizarItem(id, item) {
    try {
        const response = await API_INVENTARIO.put(`/editar/${id}`, item, {
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
            $("#ModalInventario").modal("hide");
            await cargarInventario();
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

async function guardarItem(item) {
    try {
        const response = await API_INVENTARIO.post("/crear", item, {
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
            $("#ModalInventario").modal("hide");
            await cargarInventario();
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

async function abrirEditar(idItem) {
    const response = await API_INVENTARIO.get(`/obtener-id/${idItem}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    const dataRol = response.data;

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    document.getElementById("id_item").value = dataRol.item.id;
    document.querySelector("#nombre").value = dataRol.item.nombre;
    document.querySelector("#stock").value = dataRol.item.stock;
    document.querySelector("#medida").value = dataRol.item.medida;
    document.querySelector("#area").value = dataRol.item.area;
    document.querySelector("#proveedores").value = dataRol.item.id_proveedor;
    $("#ModalInventario").modal("show");
}

async function eliminarItem(id) {
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
            const response = await API_INVENTARIO.delete(`/eliminar/${id}`, {
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
                await cargarInventario();
            }
        }
    });
}

async function infoItem(id) {
    try {
        // Obtener información del item
        const response = await API_INVENTARIO.get(`/obtener-id/${id}`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { item } = response.data;
        const proveedorNombre = item.proveedor?.nombre || "No especificado";

        // Crear tabla simple con la información
        const infoHTML = `
            <table class="table table-bordered table-sm">
                <tr><th style="width: 40%">Nombre</th><td>${item.nombre}</td></tr>
                <tr><th>Stock</th><td>${item.stock}</td></tr>
                <tr><th>Medida</th><td>${item.medida}</td></tr>
                <tr><th>Área</th><td>${item.area}</td></tr>
                <tr><th>Proveedor</th><td>${proveedorNombre}</td></tr>
                <tr><th>Estado</th><td>${item.estado === 1 ? "Activo" : "Inactivo"}</td></tr>
            </table>
        `;

        // Actualizar contenido del modal
        const modalBody = document.querySelector("#ModalInfoItem .modal-body");
        if (modalBody) {
            modalBody.innerHTML = infoHTML;
        }

        // Mostrar el modal
        $("#ModalInfoItem").modal("show");
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo cargar la información",
            showConfirmButton: false,
            timer: 1800,
        });
    }
}

const asignarConteo = (data) => {
    const cardItems = {
        Items: document.querySelector("#Items"),
    };
    cardItems.Items.textContent = data;
};

async function llenarProveedor() {
    const response = await API_PROVEEDORES.get(`/obtener`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { proveedores } = response.data;
    let selectProveedores = document.querySelector("#proveedores");
    // Limpiar opciones existentes
    selectProveedores.innerHTML =
        '<option value="">Seleccione un proveedor</option>';
    proveedores.forEach((prov) => {
        const option = document.createElement("option");
        option.value = prov.id;
        option.textContent = prov.Nombre;
        selectProveedores.appendChild(option);
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
