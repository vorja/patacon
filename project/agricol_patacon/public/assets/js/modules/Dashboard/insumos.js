import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_INSUMOS = new ApiService("http://localhost:3105/data/insumos");
const API_INVENTARIO = new ApiService("http://localhost:3105/data/inventario"); // Inventario de productos
const API_EMPLEADO = new ApiService("http://localhost:3105/data/empleados");
const API_PROVEEDORES = new ApiService(
    "http://localhost:3105/data/proveedorInsumos"
);

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const elementsInsumos = {
    btnAgregar: document.getElementById("btnAgregar"),
    formInsumos: document.getElementById("formInsumos"),
};
export async function init() {
    try {
        await cargarInsumos();
        await listaPoductos();
        await llenarResposables();
        await llenarProveedor();
        configCalendario();
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
    formInsumos: null,
    tablaInsumos: null,
};

function setupEventListeners() {
    if (elementsInsumos.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsInsumos.btnAgregar,
            "click",
            handleAgregarClick
        );
    }

    if (elementsInsumos.formInsumos) {
        listenerIds.f = eventManager.add(
            elementsInsumos.formInsumos,
            "submit",
            formItem
        );
    }

    console.log(" Event Listeners configurados:", eventManager.getStats());
}

async function cargarInsumos() {
    try {
        const response = await API_INSUMOS.get(`/obtener`, {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }
        const { items, conteoRegistros } = response.data;
        asignarConteo(conteoRegistros);
        $("#tableInsumos").DataTable({
            data: items,
            processing: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom: "Bfrtip",
            columns: [
                { data: "Fecha" },
                { data: "Proveedor" },
                { data: "Producto" },
                { data: "Cantidad" },
                { data: "Lote" },
                { data: "Vencimiento" },
                {
                    data: null,
                    render: (data, type, row) => `
                        <div class="btn-group dropend">
  <button type="button" class="btn btn-light btn-sm dropdown-toggle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; border-radius: 50%;" data-bs-toggle="dropdown" aria-expanded="false">
    <i class="fas fa-ellipsis-v"></i> <!-- tres puntos verticales -->
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3">
    <li>
      <a class="dropdown-item d-flex align-items-center edit-btn" data-id="${row.id}">
        <i class="fas fa-edit text-info me-2"></i> Editar
      </a>
    </li>
    <li>
      <a class="dropdown-item d-flex align-items-center delete-btn" data-id="${row.id}">
        <i class="fas fa-trash-alt text-danger me-2"></i> Eliminar
      </a>
    </li>
  </ul>
</div>`,
                },
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
            columnDefs: [
                {
                    targets: 2, // índice de columna
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-A">${cellData}</span>`);
                    },
                },
                {
                    targets: 5,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`<span class="text-B">${cellData}</span>`);
                    },
                },
            ],
        });

        setupTableListeners("tableInsumos");
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
    /* 
    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoItem(id);
    }); */
}

function limpiarFormulario() {
    document.getElementById("formInsumos").reset();
    document.getElementById("id_insumo").value = "";
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
    ["#tableInsumos"].forEach((tableId) => {
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

function configCalendario() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    // Configurar el mínimo en el input
    document.getElementById("fecha").setAttribute("min", hoy);
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
    const regexFecha = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

    if (
        !regexFecha.test(dataItem.fecha) ||
        !regexFecha.test(dataItem.fechaVencimiento)
    ) {
        throw new Error(
            "El Formato de fecha no es valido. Debe ser YYYY-MM-dd."
        );
    }
    if (
        !regexCantidad.test(dataItem.cantidad) ||
        !regexCantidad.test(dataItem.cantidad_def)
    ) {
        throw new Error(
            "Solo se permiten datos numericos, Ingrese un valor valido."
        );
    }

    if (!regexNombre.test(dataItem.defectos)) {
        throw new Error("El campo Defectos contiene caracteres no permitidos.");
    }

    if (!regexMedida.test(dataItem.medida)) {
        throw new Error(
            "La Medida no debe contener espacios o caracteres no permitidos."
        );
    }
    if (!regexMedida.test(dataItem.area)) {
        throw new Error(
            "La Medida no debe contener espacios o caracteres no permitidos."
        );
    }
    return dataItem;
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalInsumos").modal("show");
}

async function formItem(e) {
    e.preventDefault();
    const id = document.getElementById("id_insumo").value;
    const datosInsumos = {
        fecha: document.querySelector("#fecha").value,
        fechaVencimiento: document.querySelector("#fechaVencimiento").value,
        cantidad: parseFloat(document.querySelector("#cantidad").value),
        cantidad_def: parseFloat(
            document.querySelector("#cantidadDef").value || 0
        ),
        lote: document.querySelector("#lote").value,
        area: document.querySelector("#area").value,
        olor: document.querySelector("#olor").value,
        color: document.querySelector("#color").value,
        estado_fisico: document.querySelector("#estado").value,
        defectos:
            document.querySelector("#defectos").value || "No Contiene defectos",
        id_item: document.querySelector("#listItems").value,
        id_responsable: document.querySelector("#id_elaboracion").value,
        id_proveedor: document.querySelector("#proveedores").value,
    };
    try {
        const insumos = sanitizarCampos(datosInsumos);
        const action = id ? actualizarItem(id, insumos) : guardarItem(insumos);
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

async function actualizarItem(id, insumo) {
    try {
        const response = await API_INSUMOS.put(`/editar/${id}`, insumo, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        } else {
            $("#ModalInsumos").modal("hide");
            alerts.show(response);
            await cargarInsumos();
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

async function guardarItem(insumo) {
    try {
        const response = await API_INSUMOS.post("/crear", insumo, {
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
            $("#ModalInsumos").modal("hide");
            await cargarInsumos();
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
    const response = await API_INSUMOS.get(`/obtener-id/${idItem}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.ok) {
        alerts.show(response);
        return false;
    }
    const dataInsumo = response.data;
    document.getElementById("id_insumo").value = dataInsumo.id;
    document.getElementById("descripcion").value = dataInsumo.descripcion;
    document.querySelector("#nombre").value = dataInsumo.nombre;
    document.querySelector("#stock").value = dataInsumo.stock;
    $("#ModalInsumos").modal("show");
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
            const response = await API_INSUMOS.delete(`/eliminar/${id}`, {
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
                await cargarInsumos();
            }
        }
    });
}

async function infoItem(id) {
    try {
        const response = await API_INSUMOS.get(`/obtener-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const dataItem = response.data;

        document.querySelector("#nombre_info").value = dataItem.nombre;

        document.querySelector("#descripcion_info").value =
            dataItem.descripcion;

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

async function listProductos(id) {
    const response = await API_INVENTARIO.get(`/obtener-by-proveedor/${id}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { items } = response.data;

    const datalist = document.querySelector("#listItems");
    if (!datalist) return;

    datalist.innerHTML = "";
    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = `${item.id}`;
        option.label = `${item.Nombre}`;
        datalist.appendChild(option);
    });
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

const listaPoductos = async () => {
    const selectProveedores = document.querySelector("#proveedores");
    if (selectProveedores) {
        selectProveedores.addEventListener("change", (e) => {
            let id = e.target.value;
            listProductos(id);
        });
    } else {
        console.error("No se encontro el elemento en el DOM.");
    }
};

const asignarConteo = (data) => {
    const cardItems = {
        Items: document.querySelector("#Registros"),
    };
    cardItems.Items.textContent = data;
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