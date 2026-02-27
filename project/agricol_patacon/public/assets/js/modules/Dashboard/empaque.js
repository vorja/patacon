import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_EMPAQUE = new ApiService(Url + "/data/empaque");

const alerts = new AlertManager();

const elementsEmpaque = {
    btnClose: document.querySelector("#btn-Close"),
    inputFecha: document.querySelector("#inputFecha"),
};
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Modifica la función cargarEmpaque para usar jQuery.on() con namespace
async function cargarEmpaque(fecha) {
    let retorno = false;
    try {
        if (!/^\d{4}-\d{2}$/.test(fecha)) {
            retorno = false;
            throw new Error(
                "El Formato de fecha no es valido. Debe ser YYYY-MM-dd."
            );
        }
        
        const response = await API_EMPAQUE.get(
            `/obtener-empaques-month/${fecha}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        if (!response.success) {
            alerts.show(response);
            retorno = false;
            throw new Error("No hay información disponible.");
        }

        const { empaques, promedios } = response.data;

        asignarPromedio(promedios);

        // DESTRUIR LA DATATABLE EXISTENTE ANTES DE CREAR UNA NUEVA
        if ($.fn.DataTable.isDataTable('#tableEmpaque')) {
            // También limpia eventos antes de destruir
            $('#tableEmpaque').off('.empqueEvents');
            $('#tableEmpaque').DataTable().destroy();
            $('#tableEmpaque tbody').empty();
        }

        // Ahora inicializa la nueva DataTable
        const table = $("#tableEmpaque").DataTable({
            data: empaques,
            searching: true,
            processing: true,
            serverSide: false,
            responsive: true,
            orderCellsTop: true,
            deferRender: true,
            destroy: true,
            retrieve: true,
            dom: "Bfrtip",
            columns: [
                { data: "Empaque" },
                { data: "LoteEmpaque" },
                { data: "Cajas" },
                { data: "Rechazo" },
                { data: "Migas" },
                { data: "Observaciones" },
                {
                    data: null,
                    render: (data, type, row) => `
                        <div class="btn-group dropup">
  <button type="button" class="btn btn-light btn-sm dropdown-toggle  d-flex align-items-center justify-content-center"   data-bs-toggle="dropdown"
   aria-expanded="false" style="background-color: #f7f7f7ff; width: 42px; height: 42px; border-radius: 50%;">
    <i class="fas fa-ellipsis-v"></i>
  </button>
  <ul class="dropdown-menu shadow-sm border-0 rounded-3">
    <li>
      <a class="dropdown-item d-flex align-items-center info-btn" data-id="${row.id}">
        <i class="fas fa-circle-info text-info me-2"></i> información
      </a>
    </li>
    <li>
         <a class="dropdown-item d-flex align-items-center pdf-btn" data-id="${row.id}">
           <i class="fas fa-file-export text-danger me-2"></i> Exportar
         </a>
      </li>
  </ul>
</div>`,
                },
            ],
            // ... resto de la configuración ...
        });

        // Configurar eventos DIRECTAMENTE en la tabla DataTable
        setupTableListenersDirect(table);

        $("#carousel-item1").removeClass("active");
        $("#carousel-item2").addClass("active");
        retorno = true;
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

    return retorno;
}

// Nueva función para configurar eventos directamente
function setupTableListenersDirect(tableInstance) {
    // Usar el contenedor de DataTable para delegación
    const tableNode = tableInstance.table().container();
    
    // Limpiar eventos anteriores
    $(tableNode).off('.empqueEvents');
    
    // Configurar nuevos eventos con namespace
    $(tableNode).on('click.empqueEvents', '.info-btn', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = $(this).data('id');
        console.log("Info btn clicked, ID:", id);
        await infoEmpaque(id);
    });
    
    $(tableNode).on('click.empqueEvents', '.pdf-btn', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = $(this).data('id');
        console.log("PDF btn clicked, ID:", id);
        await generarPDF(id);
    });
}
function setupTableListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    eventManager.delegate(table, "click", ".info-btn", async function (e) {
        const id = this.dataset.id;
        await infoEmpaque(id);
    });

    eventManager.delegate(table, "click", ".pdf-btn", async function (e) {
        const id = this.dataset.id;
        await generarPDF(id);
    });
}

async function infoEmpaque(id) {
    if (!id) {
        return;
    }
    limpiarModal();
    try {
        const response = await API_EMPAQUE.get(`/obtener-detalle-id/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            throw new Error(
                "Error al Obtener la informacion del Registro de Corte.",
            );
        }

        console.log("Datos recibidos:", response.data);
        const { proveedores, empaques } = response.data;

        // CORRECCIÓN: empaques es un objeto, no un array
        // Pásalo como array con un solo elemento
        asignarInfo([empaques]); // ← ¡Aquí está el cambio!
        // O si prefieres, modifica asignarInfo para aceptar un objeto

        $("#tablaProveedores").DataTable({
            data: proveedores,
            searching: false,
            destroy: true,
            columns: [
                {
                    data: "fecha",
                    render: function (data, type, row) {
                        return data || "N/A";
                    },
                },
                {
                    data: "proveedor",
                    render: function (data, type, row) {
                        return data || "N/A";
                    },
                },
                {
                    data: "tipo",
                    render: function (data, type, row) {
                        return data || "N/A";
                    },
                },
                {
                    data: "canastas",
                    render: function (data, type, row) {
                        return data || "0";
                    },
                },
                {
                    data: "cajas",
                    render: function (data, type, row) {
                        return data || "0";
                    },
                },
                {
                    data: "rechazo",
                    render: function (data, type, row) {
                        return data ? data + " kg" : "0 kg";
                    },
                },
                {
                    data: "migas",
                    render: function (data, type, row) {
                        return data ? data + " kg" : "0 kg";
                    },
                },
            ],

            columnDefs: [
                {
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-F">${cellData || "N/A"}</span>`,
                        );
                    },
                },
                {
                    targets: 2,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-G">${cellData || ""}</span>`,
                        );
                    },
                },
                {
                    targets: 3,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-I">${cellData || "0"}</span>`,
                        );
                    },
                },
                {
                    targets: 4,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-A">${cellData || "0"}</span>`,
                        );
                    },
                },
                {
                    targets: 5,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-B">${cellData || "0"}</span>`,
                        );
                    },
                },
                {
                    targets: 6,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(
                            `<span class="text-C">${cellData || "0"}</span>`,
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

                var totalesPorTipo = {};

                api.rows().every(function () {
                    var d = this.data();
                    var tipo = d.tipo;
                    var cajas = intVal(d.cajas);
                    totalesPorTipo[tipo] = (totalesPorTipo[tipo] || 0) + cajas;
                });

                var texto = Object.keys(totalesPorTipo)
                    .map(
                        (tipo) =>
                            `<span class="badge bg-light text-dark fw-semibold fs-6">${tipo}: ${totalesPorTipo[tipo]}</span>`,
                    )
                    .join(" ");

                $(api.column(4).footer()).html(texto);
            },
            drawCallback: function () {
                var api = this.api();
                var numColumnas = api.columns().count();
                if (numColumnas <= 20) {
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
    } catch (error) {
        console.error(error);
    }
    $("#ModalEmpaque").modal("show");
}

const asignarPromedio = (data) => {
    const cardPromedio = {
        registros: document.querySelector("#Registros"),
        rechazo: document.querySelector("#Rechazo"),
        migas: document.querySelector("#Migas"),
    };
    cardPromedio.rechazo.textContent =
        parseFloat(data[0].rechazo.toFixed(1)) ?? 0;
    cardPromedio.registros.textContent =
        parseInt(data[0].registros.toFixed(0)) ?? 0;
    cardPromedio.migas.textContent = parseFloat(data[0].migas.toFixed(1)) ?? 0;
};

// Información de Lote de producción.
const asignarInfo = (data) => {
    $("#loteEmpaque").text(`${data[0].lote_empaque ?? 0}`);
    $("#fechaEmpaque").text(`${data[0].fecha_empaque ?? 0}`);
    $("#totalCanastas").text(`${data[0].numero_canastas ?? 0}`);
    $("#totalCajas").text(`${data[0].total_cajas ?? 0}`);
    $("#totalRechazo").text(`${data[0].rechazo_empaque ?? 0} kg`);
    $("#totalMigas").text(`${data[0].migas_empaque ?? 0} kg`);
};

const limpiarModal = () => {
    $("#tablaProveedores > tbody").empty();
    $("#loteEmpaque").text(`${0}`);
    $("#fechaEmpaque").text(`${0}`);
    $("#totalCanastas").text(`${0}`);
    $("#totalCajas").text(``);
    $("#totalRechazo").text(`0 kg`);
    $("#totalMigas").text(`0 kg`);
};
const generarPDF = async (id) => {
    if (!id) {
        return false;
    }
    const res = await API_EMPAQUE.get(`/obtener-detalle-id/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });
    const dataCorte = res.data;
    const response = await fetch("/reporte-empaque", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify(dataCorte),
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank"); // abre el PDF en nueva pestaña
    } else {
        console.error("Error al generar PDF");
    }
};
if (elementsEmpaque.inputFecha) {
    elementsEmpaque.inputFecha.addEventListener("change", async (e) => {
        const fecha = e.target.value;

        if (!fecha) return;

        const valid = await cargarEmpaque(fecha);
        if (!valid) {
            return false;
        }
    });
} else {
    console.warn("El input para la fecha no se encontró en el DOM.");
}

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
