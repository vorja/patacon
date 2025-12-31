import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";

const apiVerificacion = new ApiService(
    "http://localhost:3105/data/verificacion"
);
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

//Elementos Html
const elements = {
    tableEmpaque: document.querySelector("#tablaEmpaque"),
    inputFecha: document.getElementById("fechaEmpaque"),
    inputTipo: document.getElementById("referencia"),
    inputProducto: document.getElementById("variedad"),
    inputFechaPaquete: document.getElementById("fechaPaquete"),
    inputTipoPaquete: document.getElementById("referenciaPaquete"),
    inputProductoPaquete: document.getElementById("variedadPaquete"),
    btnRegistrarEmpaque: document.getElementById("btnRegistrarEmpaque"),
    btnCerrarEmpaque: document.getElementById("btnObtenerDataEmpaque"),
    btnRegistrarPaquete: document.getElementById("btnRegistrarPaquetes"),
    btnCerrarPaquete: document.getElementById("btnObtenerDataPaquetes"),
};
const dataEmpaque = [];
const dataPaquete = [];

elements.inputFecha.removeEventListener("input", generadorLoteEmpaque);
elements.inputFecha.addEventListener("input", generadorLoteEmpaque);
elements.inputProducto.addEventListener("input", generadorLoteEmpaque);
elements.inputTipo.addEventListener("input", generadorLoteEmpaque);

elements.inputFechaPaquete.addEventListener("input", generadorLotePaquete);
elements.inputProductoPaquete.addEventListener("input", generadorLotePaquete);
elements.inputTipoPaquete.addEventListener("input", generadorLotePaquete);

elements.btnRegistrarPaquete.addEventListener("click", storeDataPaquete);
elements.btnRegistrarEmpaque.addEventListener("click", storeDataEmpaque);

elements.btnCerrarEmpaque.addEventListener("click", () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ea7e25",
        cancelButtonColor: "#85960a",
        confirmButtonText: "Sí, Enviar información.",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerEmpaque();
        }
    });
});

elements.btnCerrarPaquete.addEventListener("click", () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#85960a",
        cancelButtonColor: "#ea7e25",
        confirmButtonText: "Sí, Enviar información.",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerPaquete();
        }
    });
});

const init = async () => {
    await empleados();
    await encargo();
};

function configCalendario() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    // Configurar el mínimo en el input
    document.getElementById("fecha").setAttribute("min", hoy);
}
configCalendario();

function generadorLoteEmpaque() {
    let fechaSele = elements.inputFecha.value;
    let producto = elements.inputProducto.value;
    let tipo = elements.inputTipo.value;
    document.querySelector(
        `#lote`
    ).value = `${producto}${tipo}${fechaSele.replace(/-/g, "")}`;
}

function generadorLotePaquete() {
    let fechaSele = elements.inputFechaPaquete.value;
    let producto = elements.inputProductoPaquete.value;
    let tipo = elements.inputTipoPaquete.value;
    document.querySelector(
        `#loteProduccion`
    ).value = `${producto}${tipo}${fechaSele.replace(/-/g, "")}`;
}
// Eliminar fila
function eliminarFila(btn) {
    btn.closest("tr").remove();
}

function eliminarFila2(btn) {
    btn.closest("tr").remove();
}

// Validador de campos Formulario.
function validarCamposForm(campos) {
    let todosLlenos = true;
    campos.forEach((id) => {
        const valor = document.getElementById(id)?.value.trim();
        const input = document.getElementById(id);
        if (!valor || valor === 0) {
            todosLlenos = false;
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }
    });

    return todosLlenos;
}

function limpiarInputs() {
    document.getElementById("peso").value = 0;
    document.getElementById("pesoPaquete").value = 0;
}

function storeDataPaquete() {
    const loteProduccion = document.querySelector("#loteProduccion").value;
    const pesoPaquete = parseFloat(
        document.getElementById("pesoPaquete").value
    );
    const referencia = document.getElementById("referenciaPaquete").value;
    const campos = [
        "loteProduccion",
        "pesoPaquete",
        "referenciaPaquete",
        "fechaPaquete",
        "variedadPaquete",
    ];

    if (!validarCamposModal(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });

        return;
    }

    if (!pesoPaquete || pesoPaquete === 0) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: "El peso debe ser Mayor a 0..",
        });

        return;
    }
    const newRow = document.createElement("tr");
    /* Generamos Inputs */
    const inputLote = document.createElement("input");
    inputLote.value = loteProduccion;
    inputLote.className = "form-control inputLote";
    inputLote.type = "text";
    inputLote.setAttribute("hidden", "true");
    inputLote.setAttribute("name", "lote_produccion[]");
    inputLote.setAttribute("data-lote", `${loteProduccion}`);
    inputLote.setAttribute("data-tipo", `${referencia}`);

    const inputPeso = document.createElement("input");
    inputPeso.value = pesoPaquete;
    inputPeso.className = "inputPeso";
    inputPeso.type = "text";
    inputPeso.setAttribute("hidden", "true");
    inputPeso.setAttribute("name", "peso_paquete[]");
    inputPeso.setAttribute("data-pesoPaquete", `${pesoPaquete}`);
    inputPeso.setAttribute("data-lote", `${loteProduccion}`);

    const loteProduccionTd = document.createElement("td");
    loteProduccionTd.innerHTML = `${loteProduccion}`;
    loteProduccionTd.className = "text-center";
    loteProduccionTd.appendChild(inputLote);

    const pesoPaqueteTd = document.createElement("td");
    pesoPaqueteTd.innerHTML = `${pesoPaquete}`;
    pesoPaqueteTd.className = "T1 text-center";
    pesoPaqueteTd.appendChild(inputPeso);

    const accion = document.createElement("td");
    accion.className = "text-center";
    accion.innerHTML = `<button type="button" class="btn btn-light btn-sm" id="btnElimiarPa"> <i class="ft-trash-2 text-danger fw-bold fs-3"></i>
                </button>`;

    newRow.appendChild(loteProduccionTd);
    newRow.appendChild(pesoPaqueteTd);
    newRow.appendChild(accion);

    // Añadir la fila a la tabla
    document.querySelector("#tablaPaquetes tbody").appendChild(newRow);
    limpiarInputs();
}

function storeDataEmpaque() {
    const loteEmpaque = document.querySelector("#lote").value;
    const pesoCaja = parseFloat(document.getElementById("peso").value);
    const referencia = document.getElementById("referencia").value;
    const campos = ["lote", "peso", "referencia", "fechaEmpaque", "variedad"];

    if (!validarCamposModal(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });

        return;
    }

    if (!pesoCaja || pesoCaja === 0) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: "El Peso debe ser Mayor a 0..",
        });

        return;
    }
    const newRow = document.createElement("tr");
    /* Generamos Inputs */
    const inputLote = document.createElement("input");
    inputLote.value = loteEmpaque;
    inputLote.className = "form-control inputLote";
    inputLote.type = "text";
    inputLote.setAttribute("hidden", "true");
    inputLote.setAttribute("name", "empaque[]");
    inputLote.setAttribute("data-lote", `${loteEmpaque}`);
    inputLote.setAttribute("data-tipo", `${referencia}`);

    const inputPeso = document.createElement("input");
    inputPeso.value = pesoCaja;
    inputPeso.className = "inputPeso";
    inputPeso.type = "text";
    inputPeso.setAttribute("hidden", "true");
    inputPeso.setAttribute("name", "peso_caja[]");
    inputPeso.setAttribute("data-pesoCaja", `${pesoCaja}`);
    inputPeso.setAttribute("data-lote", `${loteEmpaque}`);

    const loteEmpaqueTd = document.createElement("td");
    loteEmpaqueTd.innerHTML = `${loteEmpaque}`;
    loteEmpaqueTd.className = "text-center";
    loteEmpaqueTd.appendChild(inputLote);

    const pesoCajaTd = document.createElement("td");
    pesoCajaTd.innerHTML = `${pesoCaja}`;
    pesoCajaTd.className = "T1 text-center";
    pesoCajaTd.appendChild(inputPeso);

    const accion = document.createElement("td");
    accion.className = "text-center";
    accion.innerHTML = `<button type="button" class="btn btn-light btn-sm" id="btnEliminarEm" onclick="eliminarFila(this)"><i class="ft-trash-2 text-danger fw-bold fs-3"></i></button>`;

    newRow.appendChild(loteEmpaqueTd);
    newRow.appendChild(pesoCajaTd);
    newRow.appendChild(accion);

    // Añadir la fila a la tabla
    document.querySelector("#tablaEmpaque tbody").appendChild(newRow);
    limpiarInputs();
}
function obtenerFechaHoraLocal() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(fecha.getDate()).padStart(2, "0")}`;
}
function obtenerPaquete() {
    const filas = document.querySelectorAll("#tablaPaquetes tbody tr");
    let lotes = [];
    if (!filas || filas.length == 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No hay Información para registrar.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }

    filas.forEach((fila) => {
        const lote = fila.querySelector('input[name="lote_produccion[]"]');
        const peso = fila.querySelector('input[name="peso_paquete[]"]');
        if (lote && peso) {
            lotes.push(lote.value.trim());
            dataPaquete.push({
                lote_produccion: lote.value.trim(),
                tipo_paquete: lote.getAttribute("data-tipo"),
                peso_paquete: parseFloat(peso.value),
            });
        }
    });
    const lotesUnico = lotes.filter((valor, indice, self) => {
        return self.indexOf(valor) === indice;
    });

    document.querySelector("#conteoLotePaquete").value = lotesUnico.length || 0;
    document.querySelector("#conteoPaquetes").value = lotes.length || 0;

    $("#registroInfoPaquetes").modal("hide");
    limpiarModalPaquete();
}

function obtenerEmpaque() {
    const filas = document.querySelectorAll("#tablaEmpaque tbody tr");
    let lotes = [];
    if (!filas || filas.length <= 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No hay Información para registrar.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    filas.forEach((fila) => {
        const lote = fila.querySelector('input[name="empaque[]"]');
        const peso = fila.querySelector('input[name="peso_caja[]"]');
        if (lote && peso) {
            lotes.push(lote.value.trim());
            dataEmpaque.push({
                lote_empaque: lote.value.trim(),
                tipo_caja: lote.getAttribute("data-tipo"),
                peso_caja: parseFloat(peso.value),
            });
        }
    });
    const lotesUnico = lotes.filter((valor, indice, self) => {
        return self.indexOf(valor) === indice;
    });

    document.querySelector("#conteoLotes").value = lotesUnico.length || 0;
    document.querySelector("#conteoCajas").value = lotes.length || 0;

    $("#registroInfoEmpaque").modal("hide");
    limpiarModal();
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
function limpiarModal() {
    const campos = ["lote", "peso", "referencia", "fechaEmpaque", "variedad"];
    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.classList.remove("is-invalid", "is-valid");

        input.value = "";
    });

    document.querySelector("#tablaEmpaque tbody").innerHTML = "";
}
document.getElementById("tablaEmpaque").addEventListener("click", function (e) {
    // Verificar si el click fue en el botón eliminar o en su icono
    const btnEliminar = e.target.closest("#btnEliminarEm");
    if (btnEliminar) {
        eliminarFila2(btnEliminar);
    }
});
document
    .getElementById("tablaPaquetes")
    .addEventListener("click", function (e) {
        // Verificar si el click fue en el botón eliminar o en su icono
        const btnEliminar = e.target.closest("#btnEliminarPa");
        if (btnEliminar) {
            eliminarFila(btnEliminar);
        }
    });

function limpiarModalPaquete() {
    const campos = [
        "loteProduccion",
        "pesoPaquete",
        "referenciaPaquete",
        "fechaPaquete",
        "variedadPaquete",
    ];
    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.classList.remove("is-invalid", "is-valid");

        input.value = "";
    });

    document.querySelector("#tablaPaquetes tbody").innerHTML = "";
}

async function enviarFormulario() {
    const camposObligatorios = [
        "fecha",
        "responsablenombre",
        "responsableid",
        "idEncargo",
    ];

    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "¡Error!",
            text: "Por favor, llene los campos Obligatorios antes de guardar el registro.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    if (dataEmpaque.length <= 0 || dataPaquete.length <= 0) {
        Swal.fire({
            title: "¡Error!",
            text: "No hay datos de Verificación de Cajas de Empaque.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }
    const datos = {
        fecha_verificacion: document.getElementById("fecha").value,
        id_responsable: document.getElementById("responsableid").value,
        observaciones:
            document.getElementById("Observaciones").value ||
            "No hay Observaciones",
        empaques: dataEmpaque,
        paquetes: dataPaquete,
    };

    console.log(datos);
    try {
        const respuesta = await apiVerificacion.post("/crear", datos, {
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
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, 3000);
    }
}

const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Empacador", {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
    }
    const { responsables } = response.data;

    const empleadolist = document.getElementById("empeladolist");

    fillDatalist(empleadolist, responsables);
    handleInput(empleadolist, "responsablenombre", "responsableid");
};

document.getElementById("btnGuardar").addEventListener("click", function (e) {
    e.preventDefault();
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#85960a",
        cancelButtonColor: "#ea7e25",
        confirmButtonText: "Sí, Enviar información.",
    }).then((result) => {
        if (result.isConfirmed) {
            enviarFormulario();
        }
    });
});

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
        }, "3000");
    }
    const { configuracion } = response.data;
    document.getElementById("idEncargo").value = configuracion[0].orden_actual;
};

init();
