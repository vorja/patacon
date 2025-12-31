import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";

const apiEmpaque = new ApiService("http://localhost:3105/data/empaque");
const apiLotes = new ApiService("http://localhost:3105/data/fritura");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const alerts = new AlertManager();

const Token_API = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

let lotes = [];
let infoEmpaque = [];
let detalle = [];
let cajas = [];

let pesoCaja_kg = 0;

const elements = {
    inputFecha: document.getElementById("fechaProduccion"),
    inputCanastas: document.getElementById("canastas"),
    selecLotes: document.getElementById("lotes"),
    selecProveedores: document.getElementById("proveedores"),
    inputTipo: document.getElementById("tipo"),
    inputCanastillas: document.getElementById("canastasTotal"),
    inputCajas: document.getElementById("totalCajas"),
    inputPesoPromedio: document.getElementById("promedioCajas"),
};

const init = async () => {
    await encargo();
    await empleados();
};

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches(".btn-Obtener")) {
            eventObtener(e.target.dataset.id);
        }
        if (e.target.matches(".btn-Eliminar")) {
            eventEliminar(e.target.dataset.id);
        }
        if (e.target.matches(".btn-Registrar")) {
            eventAgregar(e.target.dataset.id);
        }
    });
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
            obtenerInfoEmpaque();
        }
    });
};

const eventEliminar = () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se eliminara la casilla, sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Eliminar casilla.",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarFila(btnEliminar);
        }
    });
};

elements.inputFecha.addEventListener("change", async () => {
    const fecha = elements.inputFecha.value.trim();
    lotes = [];
    if (!fecha) return;

    try {
        const response = await apiLotes.get(`/obtener-lotes-Day/${fecha}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + Token_API,
            },
        });

        if (!response.success) {
            alerts.show(response);
            elements.selecLotes.innerHTML = "";
            elements.selecProveedores.innerHTML = "";
            /* limpiarInputs() */
            return false;
        }
        const { lotesFritura } = response.data;

        elements.selecLotes.innerHTML = "";
        elements.selecProveedores.innerHTML = "";

        const optionDefault = document.createElement("option");
        optionDefault.textContent = "-- Seleccionar --";
        optionDefault.value = "";
        elements.selecLotes.appendChild(optionDefault);

        lotesFritura.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.tipo;
            option.dataset.lote_produccion = item.lote_produccion;
            option.dataset.tipo = item.tipo;
            option.textContent = item.lote_produccion;
            elements.selecLotes.appendChild(option);
        });

        lotes = lotesFritura;
        /* modalEmpaque(); */
    } catch (err) {
        Swal.fire({
            title: "¡Error!",
            text: err ? err : err.message,
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        console.error("Error cargando lotes:", err);
    }
});

elements.selecLotes.addEventListener("change", async (e) => {
    try {
        const valor = e.target.value;
        if (!valor) return;

        elements.selecProveedores.innerHTML = 0;
        const optionDefault = document.createElement("option");
        optionDefault.textContent = "-- Seleccionar --";
        optionDefault.value = "";

        elements.selecProveedores.appendChild(optionDefault);

        const { proveedores, tipo, lote_produccion } = lotes.find(
            (item) => item.tipo === valor
        );

        console.log("proveedores: ", proveedores);

        proveedores.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.lote_proveedor;
            option.dataset.lote_proveedor = item.lote_proveedor;
            option.dataset.lote_produccion = lote_produccion;
            option.dataset.id = item.id_proveedor;
            option.dataset.tipo = tipo;
            option.dataset.canastas = item.saldoCanastas;
            option.textContent = item.lote_proveedor;
            elements.selecProveedores.appendChild(option);
        });
        
    } catch (err) {
        Swal.fire({
            title: "¡Error!",
            text: err ? err : err.message,
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        console.error("Error cargando lotes:", err);
    }
});

elements.selecProveedores.addEventListener("change", function (e) {
    const valor = e.target.value;
    if (!valor) {
        return;
    }
    console.log(valor);

    const selectedOption = e.target.options[e.target.selectedIndex];
    const loteProduccion = selectedOption.dataset.lote_produccion;
    const maxCanastas = selectedOption.dataset.canastas;

    const canastas = document.querySelector("#canastas");
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");

    canastas.setAttribute("max", `${maxCanastas}`);
    canastas.setAttribute("placeholder", `Maximo : ${maxCanastas}`);
    canastas.setAttribute("canastas", `${maxCanastas}`);
    canastas.setAttribute("data-lote_produccion", `${loteProduccion}`);
    canastas.value = "";
    cajas.value = "";
    canastas.removeAttribute("readonly");
    migas.removeAttribute("readonly");
    cajas.removeAttribute("readonly");
    rechazo.removeAttribute("readonly");
});

elements.inputCanastas.addEventListener("input", (e) => {
    const valor = parseInt(e.target.value);
    if (!valor) {
        return;
    }

    const maxCanastas = parseInt(e.target.getAttribute("max"));
    const migas = document.querySelector("#migas");
    const cajas = document.querySelector("#cajas");
    const rechazo = document.querySelector("#rechazo");
    if (valor > maxCanastas) {
        Swal.fire({
            title: "¡Atención!",
            html: `No puede exceder el total de canastillas. | Maximo :<p class="badge text-danger fw-bold fs-5">${maxCanastas}</p>`,
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });

        migas.setAttribute("readonly", "");
        cajas.setAttribute("readonly", "");
        rechazo.setAttribute("readonly", "");
        migas.value = "";
        cajas.value = "";
        rechazo.value = "";

        e.target.value = "";
        return;
    }

    migas.removeAttribute("readonly");
    cajas.removeAttribute("readonly");
    rechazo.removeAttribute("readonly");
    /* limiteCanastillas(valor, maxCanastas); */
});

function agregarFila() {
    const loteProveedor = document.querySelector(`#proveedores`);
    const selectedProv = loteProveedor.querySelector("option:checked");
    const id_proveedor = selectedProv?.getAttribute("data-id");
    const fechaProduccion = document.querySelector(`#fechaProduccion`).value;

    const select = document.getElementById("lotes");
    const selectedOption = select.querySelector("option:checked");
    const loteProduccion = selectedOption?.getAttribute("data-lote_produccion");
    const tipo = select.value;

    const campos = [`canastas`, `cajas`, `migas`, "rechazo"];

    if (!validarCamposForm(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });
        return;
    }

    const canastas = parseInt(document.querySelector(`#canastas`).value);
    const cajas = parseInt(document.querySelector(`#cajas`).value);
    const migas = parseFloat(document.querySelector(`#migas`).value || 0);
    const rechazo = parseFloat(document.querySelector(`#rechazo`).value || 0);

    if (!canastas || canastas <= 0 || !cajas || cajas <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese datos validos ..",
        });

        return;
    }
    const limiteCanastas = Number(
        selectedProv?.getAttribute("data-canastas") || 0
    );
    const ajuste = limiteCanastas - canastas;
    selectedProv.setAttribute("data-canastas", ajuste);
    console.log(ajuste);

    const tableRows = document.querySelectorAll("#tablaInfo tbody tr");
    let existe = true;

    tableRows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.cells;
        if (cells.length < 4) return;
        if (cells[1].textContent === loteProveedor.value) existe = false;
    });

    if (!existe) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El Lote de Proveedor ya fue seleccionado, elija otro disponible.",
        });
        return;
    }

    const newRow = document.createElement("tr");

    // Celdas

    const tdFechaProduccion = document.createElement("td");
    tdFechaProduccion.textContent = fechaProduccion;

    const tdLoteProveedor = document.createElement("td");
    tdLoteProveedor.textContent = loteProveedor.value;

    const tdTipo = document.createElement("td");
    tdTipo.textContent = tipo;

    const tdCajas = document.createElement("td");
    tdCajas.textContent = cajas;

    const tdCanastas = document.createElement("td");
    tdCanastas.textContent = canastas;

    const tdRechazo = document.createElement("td");
    tdRechazo.textContent = rechazo;

    const tdMigas = document.createElement("td");
    tdMigas.textContent = migas;

    const tdBtnBorrar = document.createElement("td");
    tdBtnBorrar.innerHTML = ` <button type="button" class="btn btn-danger btn-lg btn-Eliminar" id="btnEliminar">
          <i class="fa-solid fa-ban text-white fs-3"></i>
        </button>`;

    // Inputs

    const inpuLoteProduccion = document.createElement("input");
    inpuLoteProduccion.type = "hidden";
    inpuLoteProduccion.value = loteProduccion;
    inpuLoteProduccion.name = "lote_produccion[]";
    inpuLoteProduccion.dataset.loteProduccion = loteProduccion;
    inpuLoteProduccion.dataset.loteProveedor = loteProveedor.value;
    inpuLoteProduccion.dataset.tipo = tipo;

    /*     tdLoteProduccion.appendChild(inpuLoteProduccion); */

    const inputFecha = document.createElement("input");
    inputFecha.type = "hidden";
    inputFecha.value = fechaProduccion;
    inputFecha.name = "fecha_produccion[]";
    inputFecha.dataset.loteProduccion = loteProduccion;
    inputFecha.dataset.loteProveedor = loteProveedor.value;
    inputFecha.dataset.tipo = tipo;

    tdFechaProduccion.appendChild(inputFecha);

    const inpuLoteProveedor = document.createElement("input");
    inpuLoteProveedor.type = "hidden";
    inpuLoteProveedor.value = loteProveedor.value;
    inpuLoteProveedor.name = "lote_proveedor[]";
    inpuLoteProveedor.dataset.loteProduccion = loteProduccion;
    inpuLoteProveedor.dataset.loteProveedor = loteProveedor.value;
    inpuLoteProveedor.dataset.id = id_proveedor;
    inpuLoteProveedor.dataset.tipo = tipo;

    tdLoteProveedor.appendChild(inpuLoteProveedor);
    tdLoteProveedor.appendChild(inpuLoteProduccion);

    const inpuTipo = document.createElement("input");
    inpuTipo.type = "hidden";
    inpuTipo.value = tipo;
    inpuTipo.name = "tipo[]";
    inpuTipo.dataset.loteProduccion = loteProduccion;
    inpuTipo.dataset.tipo = tipo;
    inpuTipo.dataset.loteProveedor = loteProveedor.value;
    tdTipo.appendChild(inpuTipo);

    const inpuCanastas = document.createElement("input");
    inpuCanastas.type = "hidden";
    inpuCanastas.value = canastas;
    inpuCanastas.name = "canastas[]";
    inpuCanastas.dataset.loteProduccion = loteProduccion;
    inpuCanastas.dataset.loteProveedor = loteProveedor.value;
    inpuCanastas.dataset.tipo = tipo;
    inpuCanastas.className = "numeric";
    tdCajas.appendChild(inpuCanastas);

    const inpuCajas = document.createElement("input");
    inpuCajas.type = "hidden";
    inpuCajas.value = cajas;
    inpuCajas.name = "cajas[]";
    inpuCajas.dataset.loteProduccion = loteProduccion;
    inpuCajas.dataset.loteProveedor = loteProveedor.value;
    inpuCajas.dataset.tipo = tipo;
    inpuCajas.className = "numeric";
    tdCajas.appendChild(inpuCajas);

    const inpuRechazo = document.createElement("input");
    inpuRechazo.type = "hidden";
    inpuRechazo.value = rechazo;
    inpuRechazo.name = "rechazo[]";
    inpuRechazo.dataset.loteProduccion = loteProduccion;
    inpuRechazo.dataset.loteProveedor = loteProveedor.value;
    inpuRechazo.dataset.tipo = tipo;
    inpuRechazo.className = "numeric";
    tdRechazo.appendChild(inpuRechazo);

    const inpuMigas = document.createElement("input");
    inpuMigas.type = "hidden";
    inpuMigas.value = migas;
    inpuMigas.name = "migas[]";
    inpuMigas.dataset.loteProduccion = loteProduccion;
    inpuMigas.dataset.loteProveedor = loteProveedor.value;
    inpuMigas.dataset.tipo = tipo;
    inpuMigas.className = "numeric";
    tdMigas.appendChild(inpuMigas);

    // Añadir celdas a la fila
    newRow.appendChild(tdFechaProduccion);
    newRow.appendChild(tdLoteProveedor);
    newRow.appendChild(tdTipo);
    newRow.appendChild(tdCanastas);
    newRow.appendChild(tdCajas);
    newRow.appendChild(tdRechazo);
    newRow.appendChild(tdMigas);
    newRow.appendChild(tdBtnBorrar);

    document.querySelector("#tablaInfo tbody").appendChild(newRow);

    limpiarInputs();
}

function updatePeso() {
    let totalCajas = parseInt(elements.inputCajas.value.trim());
    let pesoPromedio = parseFloat(elements.inputPesoPromedio.value.trim()); //

    if (!pesoPromedio || !totalCajas || pesoPromedio <= 0 || totalCajas <= 0)
        return;

    pesoCaja_kg = totalCajas * pesoPromedio;

    console.log(pesoCaja_kg.toFixed(2));

    return parseFloat(pesoCaja_kg.toFixed(2));
}

function eliminarFila(btn) {
    if (!btn) return;
    btn.closest("tr").remove();
    updateTotal();
}

function configCalendario() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    // Configurar el mínimo en el input
    document.getElementById("fecha").setAttribute("min", hoy);
}

configCalendario();

function limpiarInputs() {
    const inptCanastas = document.querySelector(`#canastas`);
    inptCanastas.value = "";
    inptCanastas.setAttribute("readOnly", true);
    inptCanastas.setAttribute("max", 0);
    inptCanastas.setAttribute("data-lote_produccion", "");
    inptCanastas.setAttribute("canastas", "");

    const inptCajas = document.querySelector(`#cajas`);
    inptCajas.value = "";
    inptCajas.setAttribute("readOnly", true);

    const inptMigas = document.querySelector(`#migas`);
    inptMigas.value = "";
    inptMigas.setAttribute("readOnly", true);

    const inptRechazo = document.querySelector(`#rechazo`);
    inptRechazo.value = "";
    inptRechazo.setAttribute("readOnly", true);

    const mySelect = document.getElementById("proveedores");
    mySelect.selectedIndex = 0;
}

function updateTotal() {
    const contenedor = document.querySelector("#contenedorCantidadCajas");
    const inputs = contenedor.querySelectorAll('input[name="cantidad[]"]');
    let total = 0;
    inputs.forEach((input) => {
        const value = parseFloat(input.value);
        total += isNaN(value) ? 0 : value; // Treat NaN as 0
    });
    document.getElementById("totalCajas").value = total;
}

function validarCajas() {
    const contenedor = document.querySelector("#contenedorCantidadCajas");
    const inputs = contenedor.querySelectorAll('input[name="cantidad[]"]');
    let todosLlenos = true;

    inputs.forEach((input) => {
        const valor = input?.value.trim();
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

// Funcion para obtener toda información de la tabla
function obtenerInfoEmpaque() {
    infoEmpaque = [];
    detalle = [];
    cajas = [];

    const filas = document.querySelectorAll(`#tablaInfo tbody tr`);
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

    // Primero recolectamos todos los datos
    filas.forEach((fila) => {
        const lote = fila.querySelector('input[name="lote_produccion[]"]');
        const fecha = fila.querySelector('input[name="fecha_produccion[]"]');
        const loteProveedor = fila.querySelector(
            'input[name="lote_proveedor[]"]'
        );
        const tipo = fila.querySelector('input[name="tipo[]"]');
        const canastas = fila.querySelector('input[name="canastas[]"]');
        const cajas = fila.querySelector('input[name="cajas[]"]');
        const rechazo = fila.querySelector('input[name="rechazo[]"]');
        const migas = fila.querySelector('input[name="migas[]"]');

        if (lote && loteProveedor) {
            detalle.push({
                fecha_produccion: fecha.value.trim(),
                lote_produccion: lote.value.trim(),
                id_proveedor: parseInt(loteProveedor.getAttribute("data-id")),
                lote_proveedor: loteProveedor.value.trim(),
                tipo: tipo.value.trim(),
                cajas: parseInt(cajas.value.trim()) || 0,
                canastas: parseInt(canastas.value.trim()) || 0,
                rechazo: parseFloat(rechazo.value.trim()) || 0,
                migas: parseFloat(migas.value.trim()) || 0,
            });
        }
    });

    const lotesFinales = detalle.reduce((acc, registro) => {
        const clave = `${registro.lote_produccion}`;

        if (!acc[clave]) {
            acc[clave] = {
                fecha_produccion: registro.fecha_produccion,
                lote_produccion: registro.lote_produccion,
                tipo: registro.tipo,
                numero_canastas: 0,
                migas_empaque: 0,
                total_cajas: 0,
                total_rechazo: 0,
            };
        }

        // Sumamos los totales generales
        acc[clave].numero_canastas += registro.canastas;
        acc[clave].migas_empaque += registro.migas;
        acc[clave].total_cajas += registro.cajas;
        acc[clave].total_rechazo += registro.rechazo;

        return acc;
    }, {});

    const tiposUnicos = [...new Set(detalle.map((d) => d.tipo))];

    const cajasEmpacadas = detalle.reduce((acc, registro) => {
        const clave = `${registro.tipo}`;
        if (!acc[clave]) {
            acc[clave] = {
                caja: registro.tipo,
                cantidad: 0,
            };
        }

        acc[clave].cantidad += registro.cajas;

        return acc;
    }, {});

    updateTotales();

    const lotesArray = Object.values(lotesFinales);
    const cajasArray = Object.values(cajasEmpacadas);

    console.log(JSON.stringify(lotesArray, null, 2));

    console.log(lotesArray);

    infoEmpaque = lotesArray;
    cajas = cajasArray;

    console.log("Lotes agrupados: ", lotesFinales);
    console.log("cajas empacadas: ", cajas);
    console.log("info empacadas: ", infoEmpaque);

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
            $("#ModalEmpaque").modal("hide");
        }
    });
}

function updateTotales() {
    let totalCanastas = 0;
    let totalCajas = 0;
    let totalRechazo = 0;
    let totalMigas = 0;
    const filas = document.querySelectorAll(`#tablaInfo tbody tr`);

    filas.forEach((fila) => {
        const canastas = parseFloat(fila.cells[3]?.textContent || 0);
        const cajas = parseFloat(fila.cells[4]?.textContent || 0);
        const rechazo = parseFloat(fila.cells[5]?.textContent || 0);
        const migas = parseFloat(fila.cells[6]?.textContent || 0);
        totalCanastas += isNaN(canastas) ? 0 : canastas;
        totalCajas += isNaN(cajas) ? 0 : cajas;
        totalRechazo += isNaN(cajas) ? 0 : rechazo;
        totalMigas += isNaN(cajas) ? 0 : migas;
    });

    document.getElementById("totalCajas").value = parseInt(totalCajas);
    document.getElementById("totalCanastas").value = parseInt(totalCanastas);
    document.getElementById("totalRechazo").value =
        parseFloat(totalRechazo).toFixed(1);
    document.getElementById("totalMigas").value =
        parseFloat(totalMigas).toFixed(1);
}

async function enviarFormulario() {
    const camposObligatorios = [
        "fecha",
        "lote_empaque",
        "responsablenombre",
        "responsableid",
        "totalCanastas",
        "totalCajas",
        "totalRechazo",
        "totalMigas",
        "idEncargo",
        "promedioCajas",
    ];

    if (!validarCamposForm(camposObligatorios) || !validarCajas()) {
        Swal.fire({
            title: "¡Error!",
            text: "Por favor, complete la informacíon de los campos Obligatorios antes de guardar el registro.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    if (
        !infoEmpaque ||
        infoEmpaque.length === 0 ||
        !cajas ||
        cajas.length === 0
    ) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay Información de Empaque para guardar.",
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    let promedio_peso = parseFloat(
        document.querySelector("#promedioCajas").value
    );

    infoEmpaque.forEach((item, index) => {
        const kg = item.total_cajas * promedio_peso;
        console.log(kg);
        infoEmpaque[index].peso_kg = kg;
    });

    const empaquetado = {
        fecha_empaque: document.querySelector("#fecha").value,
        lote_empaque: document
            .querySelector("#lote_empaque")
            .value.trim()
            .toUpperCase(),
        id_responsable: document.querySelector("#responsableid").value,
        numero_canastas: parseInt(
            document.querySelector("#totalCanastas").value.trim()
        ),
        total_cajas: parseInt(
            document.querySelector("#totalCajas").value.trim()
        ),
        migas_empaque: parseFloat(
            document.querySelector("#totalMigas").value.trim()
        ),
        rechazo_empaque: parseFloat(
            document.querySelector("#totalRechazo").value.trim()
        ),
        promedio_peso: parseFloat(
            document.querySelector("#promedioCajas").value
        ),
        peso_kg: updatePeso(),
        orden: document.querySelector("#idEncargo").value,
        observaciones:
            document.querySelector("#Observaciones").value ||
            "No hay observaciones.",
        cajas: cajas,
        infoEmpaque: infoEmpaque,
        proveedores: detalle,
    };

    console.log(empaquetado);

    try {
        const respuesta = await apiEmpaque.post("/crear", empaquetado, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + Token_API,
            },
        });
        if (!respuesta.success) {
            alerts.show(respuesta);
            setTimeout(() => {
                window.location.replace("/tablet/home");
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

const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Empacador", {
        headers: {
            Authorization: "Bearer " + Token_API,
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

const encargo = async () => {
    const response = await apiEncargo.get("/leer", {
        headers: {
            Authorization: "Bearer " + Token_API,
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

const socket = new WebSocket("ws://localhost:3105");

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }
};
init();
