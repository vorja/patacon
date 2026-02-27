import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_INSUMOS = new ApiService(Url + "/data/insumos");
const API_INVENTARIO = new ApiService(Url + "/data/inventario");
const API_EMPLEADO = new ApiService(Url + "/data/empleados");
const API_PROVEEDORES = new ApiService(Url + "/data/proveedorInsumos");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    ?.getAttribute("content");

const elementsInsumos = {
    btnAgregar: document.getElementById("btnAgregar"),
    formInsumos: document.getElementById("formInsumos"),
    btnSubmit: document.getElementById("btnSubmit"),
};

let dataTable = null;

export async function init() {
    try {
        setupEventListeners();
        await cargarInsumos();
        await listaPoductos();
        await llenarResposables();
        await llenarProveedor();
        configCalendario();
        console.log("Módulo de Insumos inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar:", error);
        Swal.fire({
            icon: "error",
            title: "Error de Inicialización",
            text: "No se pudo cargar la aplicación correctamente.",
        });
    }
}

const listenerIds = {};

function setupEventListeners() {
    if (elementsInsumos.btnAgregar) {
        listenerIds.btnAgregar = eventManager.add(
            elementsInsumos.btnAgregar,
            "click",
            handleAgregarClick,
        );
    }

    if (elementsInsumos.formInsumos) {
        listenerIds.formInsumos = eventManager.add(
            elementsInsumos.formInsumos,
            "submit",
            formItem,
        );
    }

    // Resetear formulario cuando se cierra el modal
    const modal = document.getElementById("ModalInsumos");
    if (modal) {
        modal.addEventListener("hidden.bs.modal", function () {
            limpiarFormulario();
        });
    }

    console.log("Event Listeners configurados:", eventManager.getStats());
}

async function cargarInsumos() {
    try {
        const response = await API_INSUMOS.get(`/obtener`, {
            headers: { Authorization: "Bearer " + token },
        });

        console.log("Respuesta de insumos:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { items, conteoRegistros } = response.data;
        asignarConteo(conteoRegistros);

        // Destruir DataTable existente si hay uno
        if (dataTable) {
            dataTable.destroy();
        }

        dataTable = $("#tableInsumos").DataTable({
            data: items,
            processing: true,
            destroy: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            dom:
                "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [],
            columns: [
                {
                    data: "Fecha",
                    className: "text-center",
                },
                {
                    data: "Proveedor",
                    className: "text-center",
                },
                {
                    data: "Producto",
                    className: "text-center",
                },
                {
                    data: "Cantidad",
                    className: "text-center",
                },
                {
                    data: "Lote",
                    className: "text-center",
                },
                {
                    data: "Vencimiento",
                    className: "text-center",
                },
                {
                    data: null,
                    className: "text-center",
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group dropend">
                                <button type="button" class="btn btn-light btn-sm dropdown-toggle d-flex align-items-center justify-content-center" 
                                    style="width: 38px; height: 38px; border-radius: 50%;" 
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-ellipsis-v"></i>
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
                            </div>`;
                    },
                },
            ],
            initComplete: function () {
                const api = this.api();
                const $header = $(api.table().header());

                api.columns().every(function (colIdx) {
                    const column = this;
                    const $thFilter = $header.find("tr:eq(1) th").eq(colIdx);

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

                    const $select = $thFilter.find("select");
                    if ($select.length) {
                        const uniques = column.data().unique().sort();
                        $select
                            .empty()
                            .append('<option value="">Todos</option>');
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

                // Configurar listeners para los botones de acción
                setupTableListeners("tableInsumos");
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
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 a 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                lengthMenu: "Mostrar _MENU_ registros",
                loadingRecords: "Cargando...",
                processing: "Procesando...",
                search: "Buscar:",
                zeroRecords: "No se encontraron registros coincidentes",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior",
                },
            },
        });
    } catch (error) {
        console.error("Error cargando insumos:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los insumos: " + error.message,
            timer: 3000,
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
}

function limpiarFormulario() {
    const form = document.getElementById("formInsumos");
    if (form) {
        form.reset();
        document.getElementById("id_insumo").value = "";
        document.getElementById("cantidadDef").value = "0";

        // Limpiar radio buttons
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach((radio) => (radio.checked = false));

        // Resetear selects
        document.getElementById("listItems").innerHTML =
            '<option value="" selected disabled>Seleccione un producto...</option>';
        document.getElementById("proveedores").selectedIndex = 0;
        document.getElementById("area").selectedIndex = 0;

        // Resetear fecha al día actual
        const today = new Date().toISOString().split("T")[0];
        document.getElementById("fecha").value = today;

        // Resetear botón de submit
        const btnSubmit = document.getElementById("btnSubmit");
        if (btnSubmit) {
            btnSubmit.textContent = "Registrar";
            btnSubmit.style.backgroundColor = "#5dbb1f";
        }
    }
}

function configCalendario() {
    const hoy = new Date().toISOString().split("T")[0];
    const fechaInput = document.getElementById("fecha");
    if (fechaInput) {
        fechaInput.setAttribute("min", hoy);
        fechaInput.value = hoy;
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizarCampos(dataItem) {
    if (!dataItem) {
        throw new Error("Datos no válidos");
    }

    for (let key in dataItem) {
        if (typeof dataItem[key] === "string") {
            dataItem[key] = escapeHtml(dataItem[key].trim());
        }
    }

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    const regexCantidad = /^\d+$/;
    const regexLote = /^[a-zA-Z0-9\s\-_]+$/;

    if (!regexFecha.test(dataItem.fecha)) {
        throw new Error(
            "La fecha de registro no es válida. Debe ser YYYY-MM-DD.",
        );
    }

    if (
        dataItem.fechaVencimiento &&
        !regexFecha.test(dataItem.fechaVencimiento)
    ) {
        throw new Error(
            "La fecha de vencimiento no es válida. Debe ser YYYY-MM-DD.",
        );
    }

    if (!regexCantidad.test(dataItem.cantidad)) {
        throw new Error("La cantidad debe ser un número válido.");
    }

    if (!regexLote.test(dataItem.lote)) {
        throw new Error("El lote contiene caracteres no permitidos.");
    }

    return dataItem;
}

function handleAgregarClick() {
    limpiarFormulario();
    $("#ModalInsumos").modal("show");
}

async function formItem(e) {
    e.preventDefault();

    try {
        const id = document.getElementById("id_insumo").value;
        const btnSubmit = document.getElementById("btnSubmit");

        // Deshabilitar botón para evitar doble envío
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Procesando...";
        }

        console.log("Procesando formulario, ID:", id);

        // Obtener valores del formulario
        const datosInsumos = {
            fecha: document.querySelector("#fecha").value,
            fechaVencimiento: document.querySelector("#fechaVencimiento").value,
            cantidad: parseInt(document.querySelector("#cantidad").value),
            cantidad_def: parseInt(
                document.querySelector("#cantidadDef").value || 0,
            ),
            lote: document.querySelector("#lote").value,
            area: document.querySelector("#area").value,
            olor:
                document.querySelector('input[name="olor"]:checked')?.value ||
                "",
            color:
                document.querySelector('input[name="color"]:checked')?.value ||
                "",
            estado_fisico:
                document.querySelector('input[name="estado"]:checked')?.value ||
                "",
            defectos:
                document.querySelector("#defectos").value ||
                "No Contiene defectos",
            id_item: document.querySelector("#listItems").value,
            id_responsable: document.querySelector("#id_elaboracion").value,
            id_proveedor: document.querySelector("#proveedores").value,
        };

        console.log("Datos del formulario:", datosInsumos);

        // Validaciones básicas
        if (
            !datosInsumos.id_responsable ||
            datosInsumos.id_responsable === ""
        ) {
            throw new Error("Debe seleccionar un responsable válido");
        }

        if (!datosInsumos.id_proveedor || datosInsumos.id_proveedor === "") {
            throw new Error("Debe seleccionar un proveedor");
        }

        if (!datosInsumos.id_item || datosInsumos.id_item === "") {
            throw new Error("Debe seleccionar un producto");
        }

        if (!datosInsumos.area || datosInsumos.area === "") {
            throw new Error("Debe seleccionar un área");
        }

        const insumos = sanitizarCampos(datosInsumos);

        if (id && id !== "") {
            await actualizarItem(id, insumos);
        } else {
            await guardarItem(insumos);
        }
    } catch (error) {
        console.error("Error en formItem:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: true,
        });
    } finally {
        // Rehabilitar botón
        const btnSubmit = document.getElementById("btnSubmit");
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = id ? "Actualizar" : "Registrar";
        }
    }
}

async function actualizarItem(id, insumo) {
    try {
        console.log("Actualizando insumo ID:", id, "Datos:", insumo);

        const response = await API_INSUMOS.put(`/editar/${id}`, insumo, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta actualización:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        $("#ModalInsumos").modal("hide");
        alerts.show(response);
        await cargarInsumos();
    } catch (error) {
        console.error("Error actualizando insumo:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar el insumo: " + error.message,
            showConfirmButton: true,
        });
    }
}

async function guardarItem(insumo) {
    try {
        console.log("Guardando nuevo insumo:", insumo);

        const response = await API_INSUMOS.post("/crear", insumo, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta creación:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        alerts.show(response);
        $("#ModalInsumos").modal("hide");
        await cargarInsumos();
    } catch (error) {
        console.error("Error guardando insumo:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo guardar el insumo: " + error.message,
            showConfirmButton: true,
        });
    }
}

async function abrirEditar(idItem) {
    try {
        console.log("Abriendo edición para ID:", idItem);

        const response = await API_INSUMOS.get(`/obtener-id/${idItem}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta obtención por ID:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const dataInsumo = response.data;
        console.log("Datos del insumo a editar:", dataInsumo);

        // Llenar formulario con datos existentes
        document.getElementById("id_insumo").value = dataInsumo.id;
        document.getElementById("fecha").value = dataInsumo.fecha;
        document.getElementById("fechaVencimiento").value =
            dataInsumo.fechaVencimiento;
        document.getElementById("cantidad").value = dataInsumo.cantidad;
        document.getElementById("cantidadDef").value =
            dataInsumo.cantidad_def || 0;
        document.getElementById("lote").value = dataInsumo.lote;
        document.getElementById("defectos").value = dataInsumo.defectos;

        // Seleccionar valores en selects
        const selectArea = document.getElementById("area");
        if (selectArea && dataInsumo.area) {
            Array.from(selectArea.options).forEach((option) => {
                if (option.value === dataInsumo.area) {
                    option.selected = true;
                }
            });
        }

        // Seleccionar radio buttons
        if (dataInsumo.color) {
            const colorRadio = document.querySelector(
                `input[name="color"][value="${dataInsumo.color}"]`,
            );
            if (colorRadio) colorRadio.checked = true;
        }

        if (dataInsumo.olor) {
            const olorRadio = document.querySelector(
                `input[name="olor"][value="${dataInsumo.olor}"]`,
            );
            if (olorRadio) olorRadio.checked = true;
        }

        if (dataInsumo.estado_fisico) {
            const estadoRadio = document.querySelector(
                `input[name="estado"][value="${dataInsumo.estado_fisico}"]`,
            );
            if (estadoRadio) estadoRadio.checked = true;
        }

        // Cambiar texto del botón submit
        const btnSubmit = document.getElementById("btnSubmit");
        if (btnSubmit) {
            btnSubmit.textContent = "Actualizar";
            btnSubmit.style.backgroundColor = "#ec6704";
        }

        // Cargar productos del proveedor
        if (dataInsumo.id_proveedor) {
            await listProductos(dataInsumo.id_proveedor);

            // Seleccionar producto después de cargar la lista
            setTimeout(() => {
                const selectProducto = document.getElementById("listItems");
                if (selectProducto && dataInsumo.id_item) {
                    Array.from(selectProducto.options).forEach((option) => {
                        if (option.value === dataInsumo.id_item.toString()) {
                            option.selected = true;
                        }
                    });
                }
            }, 500);
        }

        // Seleccionar proveedor
        const selectProveedor = document.getElementById("proveedores");
        if (selectProveedor && dataInsumo.id_proveedor) {
            Array.from(selectProveedor.options).forEach((option) => {
                if (option.value === dataInsumo.id_proveedor.toString()) {
                    option.selected = true;
                }
            });
        }

        // Cargar responsable
        // Nota: Necesitarías una función para buscar y establecer el responsable por ID
        // Esto depende de cómo tengas implementado el datalist de responsables

        $("#ModalInsumos").modal("show");
    } catch (error) {
        console.error("Error abriendo edición:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar el insumo para editar: " + error.message,
            timer: 2000,
            showConfirmButton: false,
        });
    }
}

async function eliminarItem(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminará el registro permanentemente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#545554",
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "Cancelar",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await API_INSUMOS.delete(`/eliminar/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                });

                if (!response.success) {
                    alerts.show(response);
                    return false;
                }

                alerts.show(response);
                await cargarInsumos();
            } catch (error) {
                console.error("Error eliminando insumo:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo eliminar el insumo: " + error.message,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        }
    });
}

async function listProductos(idProveedor) {
    try {
        if (!idProveedor || idProveedor === "") {
            console.warn("ID de proveedor no válido");
            return;
        }

        console.log("Cargando productos para proveedor ID:", idProveedor);

        const response = await API_INVENTARIO.get(
            `/obtener-by-proveedor/${idProveedor}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            },
        );

        console.log("Respuesta productos por proveedor:", response);

        if (!response.success) {
            alerts.show(response);
            return;
        }

        const { items } = response.data;
        const selectProductos = document.querySelector("#listItems");

        if (!selectProductos) {
            console.error("Select de productos no encontrado");
            return;
        }

        // Limpiar opciones excepto la primera
        selectProductos.innerHTML =
            '<option value="" selected disabled>Seleccione un producto...</option>';

        if (items && items.length > 0) {
            items.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = `${item.Nombre || "Producto sin nombre"}`;
                selectProductos.appendChild(option);
            });
        } else {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No hay productos disponibles";
            option.disabled = true;
            selectProductos.appendChild(option);
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los productos: " + error.message,
            timer: 2000,
            showConfirmButton: false,
        });
    }
}

function fillDatalist(datalist, data) {
    if (!datalist) return;

    datalist.innerHTML = "";

    if (data && data.length > 0) {
        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.nombre || item.Nombre || "Sin nombre";
            option.dataset.id = item.id;
            datalist.appendChild(option);
        });
    }
}

function handleInput(datalist, inputId, idFieldId) {
    const inputElement = document.getElementById(inputId);
    const idField = document.getElementById(idFieldId);

    if (!inputElement || !idField || !datalist) return;

    inputElement.addEventListener("input", (e) => {
        const value = e.target.value;
        const option = Array.from(datalist.options).find(
            (opt) => opt.value === value,
        );

        if (option && option.dataset.id) {
            idField.value = option.dataset.id;
        } else {
            idField.value = "";
        }
    });

    inputElement.addEventListener("change", (e) => {
        const value = e.target.value;
        const option = Array.from(datalist.options).find(
            (opt) => opt.value === value,
        );

        if (option && option.dataset.id) {
            idField.value = option.dataset.id;
        }
    });
}

async function llenarResposables() {
    try {
        console.log("Cargando responsables...");

        const response = await API_EMPLEADO.get(`/obtener-by-rol/Elaborador`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta responsables:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { responsables } = response.data;
        const empleadolist = document.getElementById("listElaboracion");

        if (!empleadolist) {
            console.error("Datalist de responsables no encontrado");
            return;
        }

        fillDatalist(empleadolist, responsables);
        handleInput(empleadolist, "inputElaboracion", "id_elaboracion");
    } catch (error) {
        console.error("Error cargando responsables:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los responsables: " + error.message,
            timer: 2000,
            showConfirmButton: false,
        });
    }
}

async function llenarProveedor() {
    try {
        console.log("Cargando proveedores...");

        const response = await API_PROVEEDORES.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        console.log("Respuesta proveedores:", response);

        if (!response.success) {
            alerts.show(response);
            return false;
        }

        const { proveedores } = response.data;
        const selectProveedores = document.querySelector("#proveedores");

        if (!selectProveedores) {
            console.error("Select de proveedores no encontrado");
            return;
        }

        // Limpiar opciones excepto la primera
        selectProveedores.innerHTML =
            '<option value="" selected disabled>Seleccione un proveedor...</option>';

        if (proveedores && proveedores.length > 0) {
            proveedores.forEach((prov) => {
                const option = document.createElement("option");
                option.value = prov.id;
                option.textContent = `${prov.Nombre || "Proveedor sin nombre"}`;
                selectProveedores.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando proveedores:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los proveedores: " + error.message,
            timer: 2000,
            showConfirmButton: false,
        });
    }
}

const listaPoductos = async () => {
    const selectProveedores = document.querySelector("#proveedores");
    if (selectProveedores) {
        selectProveedores.addEventListener("change", async (e) => {
            const id = e.target.value;
            console.log("Proveedor cambiado, ID:", id);
            await listProductos(id);
        });
    } else {
        console.error("No se encontró el select de proveedores en el DOM.");
    }
};

const asignarConteo = (data) => {
    const cardItems = {
        Items: document.querySelector("#Registros"),
    };
    if (cardItems.Items) {
        cardItems.Items.textContent = data || "0";
    }
};

export function cleanup() {
    // Remover listeners específicos
    Object.values(listenerIds).forEach((id) => {
        if (id !== null) {
            eventManager.remove(id);
        }
    });

    // Limpiar DataTables
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }

    console.log("Cleanup completado");
}

export function reloadEventListeners() {
    cleanup();
    setupEventListeners();
}

// Inicialización
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.addEventListener("beforeunload", cleanup);

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
