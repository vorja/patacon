import { ApiService, AlertManager, Url } from "../../helpers/ApiUseManager.js";

const apiRecepcionOp = new ApiService(Url + "/data/recepcionop");
const apiProveedores = new ApiService(Url + "/data/proveedor");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");

const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");
let conteo = 0;
let data = [];

// Funciones para persistencia de datos
const STORAGE_KEY = "recepcion_op_data";
const FORM_STORAGE_KEY = "recepcion_op_form_data";

// Guardar datos de la tabla
const saveTableData = () => {
    const filas = document.querySelectorAll("#tablaRecepcion tbody tr");
    const tableData = [];

    filas.forEach((fila) => {
        const canastilla = fila.querySelector(
            'input[name="canastillas[]"]',
        ).value;
        const peso = fila.querySelector('input[name="peso[]"]').value;
        tableData.push({
            canastilla,
            peso,
            conteo: fila.cells[0].textContent.trim(),
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tableData));
};

// Función para agregar fila desde almacenamiento
const agregarFilaDesdeStorage = (item) => {
    conteo = parseInt(item.conteo);
    const fila = `
    <tr>
     <td> ${conteo} </td>
     
      <td>
      ${item.canastilla}
        <input type="hidden" min="0" name="canastillas[]"
            class="canastillas numeric" value="${item.canastilla}">
      </td>
      
      <td> ${item.peso}
        <input type="hidden" min="0" step="0.1" name="peso[]" value="${item.peso}"
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

    updateTotal();
};

// Cargar datos de la tabla
const loadTableData = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const tableData = JSON.parse(savedData);
        // Limpiar tabla existente primero
        document.querySelector("#tablaRecepcion tbody").innerHTML = "";
        conteo = 0;
        tableData.forEach((item) => {
            agregarFilaDesdeStorage(item);
        });
    }
};

// Guardar datos del formulario
const saveFormData = () => {
    const formData = {
        fecha: document.getElementById("fecha").value,
        fecha_procesamiento: document.getElementById("fecha_procesamiento")
            .value,
        id_proveedor: document.getElementById("id_proveedor").value,
        nombreProveedor: document.getElementById("nombreProveedor").value,
        lote_produccion: document.getElementById("lote_produccion").value,
        variedad: document.getElementById("variedad").value,
        nombreResponsable: document.getElementById("nombreResponsable").value,
        responsableid: document.getElementById("responsableid").value,
        idEncargo: document.getElementById("idEncargo").value,
        observaciones: document.getElementById("Observaciones").value,
        totalCanastilla: document.getElementById("totalCanastilla").value,
        subTotal: document.getElementById("subTotal").value,
        pesoTotal: document.getElementById("pesoTotal").value,
    };

    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
};

// Cargar datos del formulario
const loadFormData = () => {
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedFormData) {
        const formData = JSON.parse(savedFormData);

        // Restaurar valores del formulario
        Object.keys(formData).forEach((key) => {
            const element = document.getElementById(key);
            if (
                element &&
                formData[key] !== null &&
                formData[key] !== undefined
            ) {
                element.value = formData[key];

                // Disparar eventos de cambio para campos importantes
                if (
                    [
                        "fecha_procesamiento",
                        "fecha",
                        "nombreProveedor",
                    ].includes(key)
                ) {
                    setTimeout(() => {
                        const event = new Event("input", { bubbles: true });
                        element.dispatchEvent(event);
                    }, 100);
                }
            }
        });
    }
};

// Limpiar datos guardados - FUNCIÓN CORREGIDA
const clearSavedData = () => {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);

    // También limpiar sessionStorage por si acaso
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(FORM_STORAGE_KEY);

    console.log("Datos limpiados de localStorage");

    // Opcional: limpiar también los campos del formulario
    const camposALimpiar = [
        "fecha",
        "fecha_procesamiento",
        "id_proveedor",
        "nombreProveedor",
        "lote_produccion",
        "variedad",
        "nombreResponsable",
        "responsableid",
        "observaciones",
        "totalCanastilla",
        "subTotal",
        "pesoTotal",
        "canastillas",
        "pesoKg",
    ];

    camposALimpiar.forEach((campoId) => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = "";
            campo.classList.remove("is-valid", "is-invalid");
        }
    });

    // Limpiar la tabla
    document.querySelector("#tablaRecepcion tbody").innerHTML = "";
    conteo = 0;

    // Limpiar el array de datos
    data = [];

    // Actualizar totales
    updateTotal();
};

// Configurar listeners para guardar automáticamente
const setupAutoSave = () => {
    // Guardar cuando se cambian campos del formulario
    const formFields = [
        "fecha",
        "fecha_procesamiento",
        "nombreProveedor",
        "variedad",
        "nombreResponsable",
        "Observaciones",
    ];

    formFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener("input", () => {
                saveFormData();
            });
            field.addEventListener("change", () => {
                saveFormData();
            });
        }
    });

    // Guardar cuando se modifican los inputs de canastillas y peso
    document
        .getElementById("canastillas")
        ?.addEventListener("input", saveFormData);
    document.getElementById("pesoKg")?.addEventListener("input", saveFormData);
};

// Función para configurar el botón de limpiar
const setupClearButton = () => {
    const clearButton = document.getElementById("clearButton");
    if (clearButton) {
        // Remover listeners previos para evitar duplicados
        const newClearButton = clearButton.cloneNode(true);
        clearButton.parentNode.replaceChild(newClearButton, clearButton);

        // Agregar el nuevo listener
        newClearButton.addEventListener("click", function () {
            Swal.fire({
                title: "¿Limpiar datos temporales?",
                text: "Se eliminarán todos los datos no guardados.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, limpiar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
            }).then((result) => {
                if (result.isConfirmed) {
                    clearSavedData();
                    // Mostrar confirmación
                    Swal.fire({
                        title: "¡Datos limpiados!",
                        text: "Los datos temporales han sido eliminados.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                }
            });
        });
    }
};

const init = async () => {
    await encargo();
    await proveedores();
    await empleados();

    // Cargar datos guardados
    loadFormData();
    loadTableData();

    // Configurar autoguardado
    setupAutoSave();

    // Configurar botón de limpiar
    setupClearButton();

    // Disparar evento de generación de lote si hay datos cargados
    if (
        document.getElementById("nombreProveedor").value ||
        document.getElementById("fecha_procesamiento").value
    ) {
        generadorLote();
    }
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
            agregarFila();
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

    // Guardar datos de la tabla
    saveTableData();
}

// Función para eliminar una fila
function eliminarFila(btn) {
    btn.closest("tr").remove();
    conteo--;
    updateTotal();

    // Actualizar números de fila
    const filas = document.querySelectorAll("#tablaRecepcion tbody tr");
    filas.forEach((fila, index) => {
        fila.cells[0].textContent = index + 1;
    });

    // Guardar datos de la tabla actualizados
    saveTableData();
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

    // Guardar datos del formulario
    saveFormData();
}
function limpiarInputs() {
    document.getElementById("canastillas").value = "";
    document.getElementById("pesoKg").value = "";

    // Guardar datos del formulario
    saveFormData();
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

    // Guardar datos del formulario
    saveFormData();
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
            `option[value="${e.target.value}"]`,
        );
        if (selectedOption) {
            document.getElementById(idFieldId).value =
                selectedOption.dataset.id;
        }
        // Guardar datos del formulario
        saveFormData();
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
    data = []; // Limpiar array de datos
    const filas = document.querySelectorAll("#tablaRecepcion tbody tr");

    filas.forEach((fila) => {
        const canastilla = fila.querySelector(
            'input[name="canastillas[]"]',
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
        timer: 500,
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
        // Guardar datos del formulario
        saveFormData();
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
        // Limpiar datos guardados después de enviar exitosamente
        clearSavedData();
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

let proveedoresData = [];

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

    proveedoresData = response.data.proveedores;
    setupAutocomplete();
};

const setupAutocomplete = () => {
    const input = document.getElementById("nombreProveedor");
    const suggestionsDiv = document.getElementById("suggestions");

    input.addEventListener("input", function (e) {
        const value = this.value.toLowerCase();

        if (value.length < 1) {
            suggestionsDiv.style.display = "none";
            document.getElementById("id_proveedor").value = "";
            return;
        }

        // Filtrar proveedores
        const filtered = proveedoresData.filter((p) =>
            p.nombre.toLowerCase().includes(value),
        );

        // Mostrar sugerencias
        if (filtered.length > 0) {
            suggestionsDiv.innerHTML = filtered
                .map(
                    (p) => `
                <a href="#" class="list-group-item list-group-item-action" 
                   data-id="${p.id}" data-nombre="${p.nombre}">
                    ${p.nombre}
                </a>
            `,
                )
                .join("");
            suggestionsDiv.style.display = "block";
        } else {
            suggestionsDiv.style.display = "none";
        }
    });

    // Manejar clic en sugerencias
    suggestionsDiv.addEventListener("click", function (e) {
        e.preventDefault();
        const target = e.target.closest(".list-group-item");
        if (target) {
            input.value = target.dataset.nombre;
            document.getElementById("id_proveedor").value = target.dataset.id;
            suggestionsDiv.style.display = "none";

            generadorLote();
            saveFormData();
        }
    });

    // Ocultar sugerencias al hacer clic fuera
    document.addEventListener("click", function (e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = "none";
        }
    });

    // Teclas especiales
    input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            suggestionsDiv.style.display = "none";
        }
    });
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
    saveFormData(); // Guardar el valor del encargo
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

let x = Url.replace("http:", "");

const socket = new WebSocket("ws:" + x);

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }
};

// Guardar datos antes de recargar la página
window.addEventListener("beforeunload", function (e) {
    // Opcional: preguntar al usuario si quiere guardar antes de salir
    if (document.querySelectorAll("#tablaRecepcion tbody tr").length > 0) {
        saveTableData();
        saveFormData();
    }
});

// Agregar también un listener para cuando se cierra la pestaña/ventana
window.addEventListener("unload", function () {
    saveTableData();
    saveFormData();
});

init();
