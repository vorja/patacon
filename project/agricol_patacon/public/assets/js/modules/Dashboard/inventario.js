import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_INVENTARIO = new ApiService("http://localhost:3105/data/inventario");
const API_PROVEEDORES = new ApiService(
    "http://localhost:3105/data/proveedorInsumos"
);
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

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
            handleAgregarClick
        );
    }

    if (elementsInventario.formInventario) {
        listenerIds.formInventario = eventManager.add(
            elementsInventario.formInventario,
            "submit",
            formItem
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
        const tabla = $("#tableInventario").DataTable({
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
                },
            ],
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
                emptyTable: "No hay datos disponibles en la tabla",
            },
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
        });

        setupTableListeners("tableInventario");
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

function cleanupDataTables() {
    ["#tableInventario"].forEach((tableId) => {
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
            "Solo se permiten datos numericos, Ingrese un valor valido."
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
            "La Medida no debe contener espacios o caracteres no permitidos."
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
        const action = id ? actualizarItem(id, item) : guardarItem(item);
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
        const response = await API_INVENTARIO.put(`/crear/${id}`, item, {
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
    document.getElementById("id_item").value = dataRol.id;
    document.querySelector("#nombre").value = dataRol.nombre;
    document.querySelector("#stock").value = dataRol.stock;
    document.querySelector("#medida").value = dataRol.medida;
    document.querySelector("#area").value = dataRol.area;
    document.querySelector("#proveedores").value = dataRol.id_proveedor;
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

            if (!response) {
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
        /*  const response = await fetch(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        const dataRol = await response.json();
        const { data } = dataRol;

        if (!response.ok) {
            throw new Error("Error al obtener el la información del Item");
        } */
        /*     document.querySelector("#nombre_info").value = data.nombre;
        document.querySelector("#nombre_info").value = data.nombre;
        document.querySelector("#nombre_info").value = data.nombre;
        document.querySelector("#nombre_info").value = data.nombre; */
        /*  document.querySelector("#descripcion_info").value = data.descripcion; */

        $("#ModalInfoItem").modal("show");
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