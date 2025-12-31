import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";
const apiRecepcionOp = new ApiService("http://localhost:3105/data/recepcionop");
const apiProveedores = new ApiService("http://localhost:3105/data/proveedor");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");
let conteo = 0;
let data = [];

const init = async () => {
    await encargo();
    await proveedores();
    await empleados();
};

// Generamos el lote de producción
const inputs = document.querySelector("#nombreProveedor");
document
    .getElementById("fecha_procesamiento")
    .addEventListener("input", generadorLote);
inputs.removeEventListener("input", generadorLote);
inputs.addEventListener("input", generadorLote);
document.getElementById("fecha").addEventListener("input", generadorLote);

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches(".btn-Obtener")) {
            eventObtener();
        }
        if (e.target.matches(".btn-Canastillas")) {
            eventAgregar();
        }
    });
});
document
    .getElementById("tablaRecepcion")
    .addEventListener("click", function (e) {
        // Verificar si el click fue en el botón eliminar o en su icono
        const btnEliminar = e.target.closest("#btnEliminar");
        if (btnEliminar) {
            eliminarFila(btnEliminar);
        }
    });
const eventAgregar = () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se registrara la información, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Registrar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            agregarFila();
        }
    });
};

const eventObtener = () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Confirmar.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerDatosTablaRecepcion();
        }
    });
};

// Función para agregar una fila nueva
function agregarFila() {
    conteo++;
    const canastillas = parseInt(document.querySelector(`#canastillas`).value);
    const peso = parseFloat(document.querySelector(`#pesoKg`).value);
    const campos = [`canastillas`, `pesoKg`];

    if (!validarCamposModal(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });
        return;
    }

    if (!canastillas || canastillas <= 0 || !peso || peso <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El Canastillas o Peso debe ser mayor a 0..",
        });

        return;
    }

    const fila = `
    <tr>
     <td> ${conteo} </td>
     
      <td>
      ${canastillas}
        <input type="hidden" min="0" name="canastillas[]"
            class="canastillas numeric" value="${canastillas}">
      </td>
      
      <td> ${peso}
        <input type="hidden" min="0" step="0.1" name="peso[]" value="${peso}"
               class="peso numeric">
      </td>
      <td style="text-align:center">
        <button type="button" class="btn btn-danger  btn-lg btn-Eliminar" id="btnEliminar">
          <i class="fa-solid fa-ban text-white fs-2"></i>
        </button>
      </td>
    </tr>
  `;
    document
        .querySelector("#tablaRecepcion tbody")
        .insertAdjacentHTML("beforeend", fila);

    limpiarInputs();
    updateTotal();
}

// Función para eliminar una fila
function eliminarFila(btn) {
    btn.closest("tr").remove();
    conteo--;
    updateTotal();
}

function validarCamposModal(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const valor = document.getElementById(id)?.value.trim();
        const input = document.getElementById(id);
        if (!valor) {
            todosLlenos = false;
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }
    });

    return todosLlenos;
}

// Calcula y actualiza los totales
function updateTotal() {
    let totalCanastillas = 0;
    let subTotal = 0;
    let pesoTotal = 0;
    let formulaKg = 0;

    document.querySelectorAll(".canastillas").forEach((input) => {
        totalCanastillas += parseFloat(input.value) || 0;
    });
    document.querySelectorAll(".peso").forEach((input) => {
        subTotal += parseFloat(input.value) || 0;
    });
    formulaKg = totalCanastillas * 2;
    pesoTotal = subTotal - formulaKg;
    document.getElementById("totalCanastilla").value = totalCanastillas;
    document.getElementById("subTotal").value = subTotal.toFixed(1);
    document.getElementById("pesoTotal").value = pesoTotal.toFixed(1);
}
function limpiarInputs() {
    document.getElementById("canastillas").value = "";
    document.getElementById("pesoKg").value = "";
}

function generadorLote() {
    // generamos el nombre del lote de producción con las primeras 3 letras del proveedor y el lote de producción seleccionado.
    let proveedorSele = document.getElementById("nombreProveedor").value.trim();
    let nombre = proveedorSele.replace(/\s+/g, "");
    let fechaSele = document.getElementById("fecha_procesamiento").value || "";

    let fecha = new Date(fechaSele);
    let ano = fecha.getUTCFullYear() % 100;
    const fechaHoy = `${fecha.getUTCDate()}${fecha.getUTCMonth() + 1}-${ano}`;

    if (!proveedorSele) {
        document.getElementById("lote_produccion").value =
            fechaHoy.replace(/-/g, "") ?? "";
        return;
    }
    document.getElementById("lote_produccion").value = `${
        nombre ? nombre.slice(0, 3).toUpperCase() : ""
    }${fechaHoy.replace(/-/g, "")}`;
}

// Función para llenar un datalist con opciones
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

// Metodo para validar que todos los
function validarCamposForm(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const valor = document.getElementById(id)?.value.trim();
        const input = document.getElementById(id);
        if (!valor) {
            todosLlenos = false;
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }
    });

    return todosLlenos;
}

function obtenerDatosTablaRecepcion() {
    const filas = document.querySelectorAll("#tablaRecepcion tbody tr");

    filas.forEach((fila) => {
        const canastilla = fila.querySelector(
            'input[name="canastillas[]"]'
        ).value;
        const peso = fila.querySelector('input[name="peso[]"]').value;
        data.push({
            canastilla,
            peso,
        });
    });

    let timerInterval;

    Swal.fire({
        title: "¡Procesando Información!",
        html: "Terminando en <b></b> milliseconds.",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
    }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
            $("#registroInfo").modal("hide");
        }
    });
}

const inputFields = document.querySelectorAll("input[list]");

inputFields.forEach((input) => {
    input.addEventListener("input", (e) => {
        const dataList = input.list;
        const inputValue = e.target.value;
        const optionValues = Array.prototype.slice
            .call(dataList.options)
            .map((option) => option.value);

        if (!optionValues.includes(inputValue)) {
            e.target.value = "";
        }
    });
});

async function enviarFormulario() {
    const camposObligatorios = [
        "fecha",
        "fecha_procesamiento",
        "id_proveedor",
        "nombreProveedor",
        "lote_produccion",
        "variedad",
        "nombreResponsable",
        "responsableid",
        "idEncargo",
    ];

    // Validar que todos los campos de la tabla estén llenos
    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "Error",
            text: "Por favor, complete todos los campos Obligatorios antes de guardar los registros.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }
    if (!data || data.length == 0) {
        Swal.fire({
            title: "Error",
            text: "Por fovor, debe ingresar los datos de pesaje del proveedor para guardar los registros..",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    const recepcion = {
        id_responsable: document.getElementById("responsableid").value,
        fecha: document.getElementById("fecha").value,
        fecha_procedimiento: document.getElementById("fecha_procesamiento")
            .value,
        variedad: document.getElementById("variedad").value,
        lote: document.getElementById("lote_produccion").value,
        orden: document.getElementById("idEncargo").value,
        id_proveedor: document.getElementById("id_proveedor").value,
        total_canastillas: document.getElementById("totalCanastilla").value,
        sub_total: document.getElementById("subTotal").value,
        peso_total: document.getElementById("pesoTotal").value,
        observaciones:
            document.getElementById("Observaciones").value ||
            "No hay Observaciones",
        recepcion: data,
    };
    console.log(recepcion);

    const respuesta = await apiRecepcionOp.post("/crear", recepcion, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });

    if (!respuesta.success) {
        alerts.show(respuesta);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else {
        alerts.show(respuesta);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

document.getElementById("btnGuardar").addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Enviar información.",
    }).then((result) => {
        if (result.isConfirmed) {
            enviarFormulario();
        }
    });
});

const proveedores = async () => {
    const response = await apiProveedores.get("/obtener-lista", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { proveedores } = response.data;
    const proveedorlist = document.getElementById("proveedorlist");
    fillDatalist(proveedorlist, proveedores);
    handleInput(proveedorlist, "nombreProveedor", "id_proveedor");
};

const encargo = async () => {
    const response = await apiEncargo.get("/leer", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, 3000);
    }
    const { configuracion } = response.data;
    document.getElementById("idEncargo").value = configuracion[0].orden_actual;
};
const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Desgajador", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const cortadorlist = document.getElementById("empleadolist");
    const { responsables } = response.data;
    fillDatalist(cortadorlist, responsables);
    handleInput(cortadorlist, "nombreResponsable", "responsableid");
};
const socket = new WebSocket("ws://localhost:3105");

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }
};
init();
