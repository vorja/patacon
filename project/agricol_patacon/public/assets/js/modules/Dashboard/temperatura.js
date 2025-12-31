import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_TEMPERATURA = new ApiService(
    "http://localhost:3105/data/temperatura"
);
const API_CUARTO = new ApiService("http://localhost:3105/data/cuarto");
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const btnClose = document.querySelector("#btn-Close");
let title = document.querySelector("#title");

export async function init() {
    await cargarCuartos();
    document.getElementById("btnAgregar").addEventListener("click", () => {
        limpiarFormulario();
        $("#Modaltemperatura").modal("show");
    });

    document
        .getElementById("formCuarto")
        .addEventListener("submit", formCuarto);
}

/// Renderiza los cuartos de almacenamiento
async function cargarCuartos() {
    const container = document.getElementById("tabla-dinamica");
    if (!container) return;

    container.innerHTML = "";

    const row = document.createElement("div");
    row.className = "row";

    try {
        const res = await API_CUARTO.get(`/obtener`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!res.success) {
            throw new Error("Hubo un error o No hay cuartos disponibles.");
        }

        const { data } = res;

        data.forEach((data) => {
            const element = `
<div class="col-4">
  <div class="card shadow border-0 p-3" style="border-radius: 1rem; background-color: #ffffff;">
    <div class="card-header d-flex align-items-center gap-2 text-white border-0 mt-2"
         style="background-color: #1f6175; border-radius: 0.7rem;">
      <i class="fas fa-snowflake"></i>
      <h4 class="mb-0">${data.nombre}</h4>
    </div>
    <div class="card-body">
      <p class="card-text text-muted mb-3">
        <i class="fas fa-quote-left me-2 text-secondary"></i>${data.descripcion}.
      </p>
      <div class="row align-items-center">
        <div class="col-8">
          <input 
            type="month" 
            class="form-control form-control-sm rounded-pill mt-2 shadow-sm"
            id="fecha-${data.id}" 
            data-id="${data.id}"/>
        </div>
        <div class="col-4 text-center">
          <button class="btn btn-sm btn-success text-white search-btn mt-2" style="border-radius: 50%; width: 40px; height: 38px;"data-action="search${data.id}" data-id="${data.id}">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`;
            row.innerHTML += element;
        });
    } catch (error) {
        const element = `<div class="col-12">
            <div
                class="card p-4 shadow-sm border-0 text-center"
                style="border-radius: 1rem;"
            >
                <div
                    class="card-header border-0 mb-3"
                    style="background-color: #1f6175; color: #fff; border-radius: 0.7rem;"
                >
                    <h5 class="mb-0">¡ Aviso Importante !</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <i class="fas fa-door-closed fa-3x text-secondary"></i>
                    </div>
                    <h6 class="card-title text-muted">
                        No hay cuartos registrados actualmente
                    </h6>
                    <p class="card-text">
                        Por favor, verifique más tarde o contacte al
                        administrador si espera ver cuartos disponibles.
                    </p>
                </div>
            </div>
        </div>`;
        row.innerHTML = element;
    }
    const contenedor = document.createElement("div");
    contenedor.className = "container-fluid mb-3";
    contenedor.id = "contenedor";

    const fragmnet = new DocumentFragment();

    contenedor.appendChild(row);
    fragmnet.appendChild(contenedor);
    container.appendChild(fragmnet);
}
// Renderiza la tabla con la informacion de la
async function cargarInfo(id, fecha) {
    try {
        const res = await API_TEMPERATURA.get(`/obtener-fecha/${fecha}/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!res.success) {
            alerts.show(res);
        }
        const { data } = res;
        title.innerHTML = `REGISTRO DE TEMPERATURAS - ${data.Mes.toUpperCase()}`;
        const dataTabla = transformarDatos(data);

        $("#tablaTemperaturas").DataTable({
            data: dataTabla,
            destroy: true,
            drawCallback: function () {
                var api = this.api();
                var numColumnas = api.columns().count(); // Cantidad de columnas visibles

                if (numColumnas <= 32) {
                    // Cambia 3 por el número que quieres controlar
                    $(".dataTables_paginate").hide(); // Oculta la paginación si hay menos de o igual columnas específicas
                } else {
                    $(".dataTables_paginate").show(); // La muestra si supera ese número
                }
            },
            columns: [
                { title: "Día" },
                { title: "Hora I" },
                { title: "Temp I" },
                { title: "Hora M" },
                { title: "Temp M" },
                { title: "Hora F" },
                { title: "Temp F" },
                { title: "Responsable" },
            ],
            dom: "Bfrtip",

            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
                emptyTable: "No hay datos disponibles en la tabla",
            },
            columnDefs: [],
        });
    } catch (error) {
        console.error(error);
    }
}
document.addEventListener("click", async (e) => {
    try {
        const target = e.target.closest("button");
        if (!target) return;
        let action = target.getAttribute("data-action");
        let id = target.getAttribute("data-id");
        // Busca el input asociado a este cuarto usando el ID
        let fechaInput = document.querySelector(`#fecha-${id}`);
        let fecha = fechaInput ? fechaInput.value : "";

        if (action !== `search${id}`) {
            return false;
        }
        if (!fecha) {
            throw new Error("Seleccione una fecha para iniciar la busqueda.");
        }

        let timerInterval;
        Swal.fire({
            title: "Cargando...",
            html: "Buscando Información.",
            timer: 1300,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                cargarInfo(id, fecha);
                timerInterval = setInterval(() => {}, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                /* $("#tablaTemperturas > tbody").empty(); */

                $("#ModalInfoCuarto").modal("show");
            }
        });

        // Aquí puedes continuar con las validaciones o el envío
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message,
            showConfirmButton: false,
            timer: 2000,
        });
    }
});

function limpiarFormulario() {
    document.getElementById("formCuarto").reset();
    document.getElementById("id_cuarto").value = "";
}
function sanitizarCampos(nombre, descripcion) {
    nombre = nombre.trim();
    descripcion = descripcion.trim();
    const regexNombre = /^[a-zA-Z0-9 ]*$/;
    const regexDescripcion = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ ,]+$/;

    if (!regexNombre.test(nombre)) {
        throw new Error(
            "El campo Nombre solo puede contener letras, y espacios."
        );
    }
    if (!regexDescripcion.test(descripcion)) {
        throw new Error(
            "El campo Descripcion solo puede contener letras, y espacios."
        );
    }
    return { nombre, descripcion };
}

async function formCuarto(e) {
    e.preventDefault();
    const id = document.getElementById("id_cuarto").value;
    const cuarto = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
    };

    try {
        const dataCuarto = sanitizarCampos(cuarto.nombre, cuarto.descripcion);
        const action = id
            ? actualizarCuarto(id, dataCuarto)
            : guardarCuarto(dataCuarto);
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
async function guardarCuarto(cuarto) {
    try {
        const response = await fetch("/crear", cuarto, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.ok) {
            alerts.show(response);
        } else {
            alerts.show(response);
        }

        $("#Modaltemperatura").modal("hide");
        await cargarCuartos();
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
async function actualizarCuarto(id, cuarto) {
    try {
        const response = await API_CUARTO.put(`editar/${id}`, cuarto, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
        } else {
            alerts.show(response);
        }

        $("#Modaltemperatura").modal("hide");
        await cargarCuartos();
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
function transformarDatos(json) {
    return json.dias.map((dia) => {
        // Valores por defecto vacíos
        const horarios = {
            I: { Hora: "", Temperatura: "" },
            M: { Hora: "", Temperatura: "" },
            F: { Hora: "", Temperatura: "" },
        };
        dia.horario.forEach((h) => {
            horarios[h.horario] = { Hora: h.Hora, Temperatura: h.Temperatura };
        });
        // Cambia esto si tienes responsable en JSON
        const responsable = dia.responsable;
        return [
            dia.registro,
            horarios.I.Hora,
            `<span class="temp-I">${horarios.I.Temperatura}</span>`,
            horarios.M.Hora,
            `<span class="temp-M">${horarios.M.Temperatura}</span>`,
            horarios.F.Hora,
            `<span class="temp-F">${horarios.F.Temperatura}</span>`,
            responsable,
        ];
    });
}

btnClose.addEventListener("click", (e) => {
    $("#tablaTemperturas > tbody").empty();
});

init();

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};