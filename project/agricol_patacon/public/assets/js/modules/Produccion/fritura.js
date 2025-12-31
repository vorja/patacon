import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";

const apiFritura = new ApiService("http://localhost:3105/data/fritura");
const apiProveedores = new ApiService("http://localhost:3105/data/recepcion");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const apiReferencias = new ApiService("http://localhost:3105/data/referencias");
const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Variables Globales
const Global_data = {
    tipos: [],
    lotes: [],
    loteProveedores: [],
    producto: [],
};
let conteo = 0;
let tipos = {}; // Referencias Lista de Reerencias A, B, C, A, ETC..
let infoProveedores = [];

const init = async () => {
    await encargo();
    await referencias();
    await empleado();
    await cargarProveedores();
};

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches(".btn-Obtener")) {
            /* console.log("canastillas", e.target.dataset.id); */
            eventObtener(e.target.dataset.id);
        }
        if (e.target.matches(".btn-Eliminar")) {
            /* console.log("canastillas", e.target.dataset.id); */
            eventEliminar(e.target, e.target.dataset.id);
        }
        if (e.target.matches(".btn-Canastillas")) {
            /* console.log("canastillas", e.target.dataset.id); */
            eventAgregar(e.target.dataset.id);
        }
    });
});

const eventObtener = (id) => {
    console.log("obtener: ", id);
    if (!id) {
        return false;
    }
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
            obtenerInfoProvedor(id);
        }
    });
};

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

function safeId(valor) {
    return String(valor)
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "_");
}

function generarLote(id) {
    const tipo = document.querySelector(`#referencias${id}`).value;
    const variedad = document.querySelector(`#variedad${id}`).value;

    if (!tipo) {
        return false;
    }

    let fecha = new Date();
    const fechaHoy = `${fecha.getUTCDate()}${fecha.getUTCMonth() + 1}-${
        fecha.getUTCFullYear() % 100
    }`;

    let lote = `${variedad}${tipo}${fechaHoy.replace(/-/g, "")}`;

    return lote;
}

function generarLoteProv(id) {
    const tipo = document.querySelector(`#referencias${id}`).value;
    const variedad = document.querySelector(`#variedad${id}`).value;
    const lote_recep = document
        .querySelector(`#materiaProcesada${id}`)
        .getAttribute("data-loteR");
    if (!tipo) {
        return false;
    }

    let lote = `${lote_recep}${variedad}${tipo}`;

    return lote;
}

function obtenerFechaHoraLocal() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function agregarFila(id) {
    const lote = generarLote(id); // Lote de Producción
    const loteProveedor = generarLoteProv(id); // Lote de Recepcion + Variedad + Referncia
    const tipo = document.querySelector(`#referencias${id}`).value;
    const producto = document
        .querySelector(`#materiaProcesada${id}`)
        .getAttribute("data-producto");
    const canastillas = parseInt(
        document.querySelector(`#canastillas${id}`).value
    );

    const peso = parseFloat(document.querySelector(`#pesoKg${id}`).value);
    const campos = [`canastillas${id}`, `pesoKg${id}`, `referencias${id}`];

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

     <td>
     ${loteProveedor}
       <input type="hidden" min="0"  name="lote_produccion[]" data-loteProveedor="${loteProveedor}" data-lote="${lote}" value="${lote}" data-producto="${producto}" data-id="${id}" class="lote ">
     </td>

     <td>
      ${tipo}
      <input type="hidden" name="tipo_fritura[]" value="${tipo}" data-id="${id}"
               class="tipo form-control"">
      </td>
      <td> ${peso}
        <input type="hidden" min="0" step="0.1" name="peso_fritura[]" value="${peso}" data-id="${id}"
               class="peso numeric">
      </td>
      <td>
      ${canastillas}
        <input type="hidden" min="0" name="canastilla_fritura[]"
            class="canastillas numeric" data-tipo="${tipo}" data-id="${id}" value="${canastillas}">
      </td>
      <td style="text-align:center">
        <button type="button" class="btn btn-danger btn-lg btn-Eliminar" id="btnEliminar" data-id="${id}">
          <i class="fa-solid fa-ban text-white fs-3"></i>
        </button>
      </td>
    </tr>
  `;

    document
        .getElementById(`tablaInfo${id}`)
        .insertAdjacentHTML("beforeend", fila);

    limpiarInputs(id);
    // Generamos los inputs de Bajadas, canstas, migas, rechazo. por tipo (A,B,C,AF..)eTipo(tipo);
    crearBloqueTipo(tipo, id);
    // Revisamos y los inpust existentes
    syncInputs(id);
    // Actualizamos los totales de los Inputs.
    updateTotal(id);
}

function crearBloqueTipo(tipo, id) {
    const tipoSafe = safeId(tipo);

    const containerVar = document.getElementById(`contenedorVar${id}`);
    if (!containerVar) return;

    const container = containerVar.querySelector(`#contenedor${tipoSafe}`);
    if (container) {
        if (container.querySelectorAll(`#col_Total_${tipoSafe}`)) return;
    }

    const divContenedor = document.createElement("div");
    divContenedor.className = "row d-flex justify-content-center mt-1";
    divContenedor.id = `contenedor${tipoSafe}`;

    const div = document.createElement("div");
    div.className = "mb-3 col-6 col-md-3";
    div.id = `col_Total_${tipoSafe}`;

    const h4 = document.createElement("h5");
    h4.className = "text-titles";
    h4.textContent = `Total - ${tipoSafe}.`;
    h4.setAttribute("data-tipo", `${tipoSafe}`);

    const input = document.createElement("input");
    input.type = "number";
    input.className =
        "inputTotal form-control rounded-pill shadow-sm text-center text-dark fw-semibold";
    input.classList.add("numeric");
    input.placeholder = `Total: ${tipoSafe}`;
    input.id = `input_Total_${tipoSafe}`;
    input.setAttribute("name", "cantidad[]");
    input.setAttribute("data-tipo", tipoSafe);
    input.setAttribute("readOnly", "true");
    input.setAttribute("min", "0");
    input.setAttribute("step", "0.1");

    div.appendChild(h4);
    div.appendChild(input);
    divContenedor.appendChild(div);

    // CREAMOS EL INPUT DE LAS Bajadas.
    const divBajada = document.createElement("div");
    divBajada.className = "mb-3 col-6 col-md-3";
    divBajada.id = `col_Bajada_${tipoSafe}`;

    const h4Bajada = document.createElement("h5");
    h4Bajada.className = "text-titles";
    h4Bajada.textContent = `Bajadas - ${tipoSafe}.`;
    h4Bajada.setAttribute("data-tipo", `${tipoSafe}`);

    const inputBajada = document.createElement("input");
    inputBajada.type = "number";
    inputBajada.className =
        "inputBajadas form-control rounded-pill shadow-sm text-center text-dark fw-semibold";
    inputBajada.classList.add("numeric");

    inputBajada.placeholder = `Bajadas: ${tipoSafe}`;
    inputBajada.id = `input_Bajadas_${tipoSafe}`;
    inputBajada.setAttribute("name", "cantidad[]");
    inputBajada.setAttribute("data-tipo", `${tipoSafe}`);
    inputBajada.setAttribute("data-tipo", `${tipoSafe}`);
    inputBajada.setAttribute("min", "0");
    inputBajada.setAttribute("step", "0.1");

    divBajada.appendChild(h4Bajada);
    divBajada.appendChild(inputBajada);
    divContenedor.appendChild(divBajada);

    const inputPeso = document.createElement("input");
    inputPeso.type = "hidden";
    inputPeso.className =
        "inputKg form-control rounded-pill shadow-sm text-center text-dark fw-semibold";
    inputPeso.classList.add("numeric");
    inputPeso.id = `input_Kg_${tipoSafe}`;
    inputPeso.setAttribute("name", "peso[]");
    inputPeso.setAttribute("data-tipo", `${tipoSafe}`);
    inputPeso.setAttribute("readOnly", "true");
    inputPeso.setAttribute("min", "0");

    // CREAMOS EL INPUT DE LAS Bajadas.
    const divMigas = document.createElement("div");
    divMigas.className = "mb-3 col-6 col-md-3";
    divMigas.id = `col_Migas_${tipoSafe}`;

    const h4Migas = document.createElement("h5");
    h4Migas.className = "text-titles";
    h4Migas.textContent = `Migas - ${tipoSafe}.`;
    h4Migas.setAttribute("data-tipo", `${tipoSafe}`);

    const inputMigas = document.createElement("input");
    inputMigas.type = "number";
    inputMigas.placeholder = `Migas: ${tipoSafe}`;
    inputMigas.className =
        "inputMigas form-control rounded-pill shadow-sm text-center text-dark fw-semibold";
    inputMigas.classList.add("numeric");
    inputMigas.id = `input_Migas_${tipoSafe}`;
    inputMigas.setAttribute("name", "mgias[]");
    inputMigas.setAttribute("data-tipo", `${tipoSafe}`);
    inputMigas.setAttribute("min", "0");

    divMigas.appendChild(h4Migas);
    divMigas.appendChild(inputMigas);
    divMigas.appendChild(inputPeso);
    divContenedor.appendChild(divMigas);

    // CREAMOS EL INPUT DE LAS RECHAZO.
    const divRechazo = document.createElement("div");
    divRechazo.className = "mb-3 col-6 col-md-3";
    divRechazo.id = `col_Rechazo_${tipoSafe}`;

    const h4Rechazo = document.createElement("h5");
    h4Rechazo.className = "text-titles";
    h4Rechazo.textContent = `Rechazo - ${tipoSafe}.`;
    h4Rechazo.setAttribute("data-tipo", `${tipoSafe}`);

    const inputRechazo = document.createElement("input");
    inputRechazo.type = "number";
    inputRechazo.className =
        "inputRechazo form-control rounded-pill shadow-sm text-center text-dark fw-semibold";
    inputRechazo.classList.add("numeric");
    inputRechazo.placeholder = `Cantidad kg`;
    inputRechazo.id = `input_Rechazo_${tipoSafe}`;
    inputRechazo.setAttribute("name", "rechazo[]");
    inputRechazo.setAttribute("data-tipo", `${tipoSafe}`);
    inputRechazo.setAttribute("min", "0");
    inputRechazo.setAttribute("step", "0.1");

    divRechazo.appendChild(h4Rechazo);
    divRechazo.appendChild(inputRechazo);

    divContenedor.appendChild(divRechazo);
    containerVar.appendChild(divContenedor);
}

function syncInputs(id) {
    const tableRows = document.querySelectorAll(`#tablaInfo${id} tbody tr`);
    const tiposElegidos = [];

    if (tableRows.length > 0) {
        tableRows.forEach((row, index) => {
            const cells = row.cells;
            tiposElegidos[index] = cells[1].textContent.trim();
        });
    }

    const setElegidos = new Set(tiposElegidos);
    setElegidos.forEach((ref) => {
        const container = document.getElementById(`contenedor${ref}`);
        if (!container) return;

        if (!setElegidos.has(ref)) {
            container.remove();
        }
    });
}

function validarProceso(id) {
    let todosLlenos = true;
    const tableRows = document.querySelectorAll(`#tablaInfo${id} tbody tr`);
    const tiposElegidos = [];

    if (tableRows.length > 0) {
        tableRows.forEach((row, index) => {
            const cells = row.cells;
            tiposElegidos[index] = cells[1].textContent.trim();
        });
    }

    const setElegidos = new Set(tiposElegidos);

    setElegidos.forEach((ref) => {
        const container = document.getElementById(`contenedor${ref}`);
        if (!container) return;
        const migas = container.querySelector(`#input_Migas_${ref}`);
        const rechazo = container.querySelector(`#input_Rechazo_${ref}`);
        const bajadas = container.querySelector(`#input_Bajadas_${ref}`);

        if (!migas || migas.value.trim() === 0 || migas.value.trim() == "") {
            todosLlenos = false;
            migas.classList.add("is-invalid");
        } else {
            migas.classList.remove("is-invalid");
            migas.classList.add("is-valid");
        }

        if (
            !bajadas ||
            bajadas.value.trim() === 0 ||
            bajadas.value.trim() == ""
        ) {
            todosLlenos = false;
            bajadas.classList.add("is-invalid");
        } else {
            bajadas.classList.remove("is-invalid");
            bajadas.classList.add("is-valid");
        }

        if (
            !rechazo ||
            rechazo.value.trim() === 0 ||
            rechazo.value.trim() == ""
        ) {
            todosLlenos = false;
            rechazo.classList.add("is-invalid");
        } else {
            rechazo.classList.remove("is-invalid");
            rechazo.classList.add("is-valid");
        }
    });

    return todosLlenos;
}

// Proveedor
function variableProcesoProv(id) {
    let migas = 0;
    let rechazo = 0;
    const tableRows = document.querySelectorAll(`#tablaInfo${id} tbody tr`);
    const tiposElegidos = [];

    if (tableRows.length > 0) {
        tableRows.forEach((row, index) => {
            const cells = row.cells;
            tiposElegidos[index] = cells[1].textContent.trim();
        });
    }

    const setElegidos = new Set(tiposElegidos);

    setElegidos.forEach((ref) => {
        const container = document.getElementById(`contenedor${ref}`);
        if (!container) return;

        migas += parseFloat(
            container.querySelector(`#input_Migas_${ref}`).value
        );
        rechazo += parseFloat(
            container.querySelector(`#input_Rechazo_${ref}`).value
        );
    });

    return { migas, rechazo };
}

function updateTotal(id) {
    const totalesPorTipo = {};
    const totalesPesoPorTipo = {};
    const valorRestarPorTipo = {};
    let totalCanastilllas = 0;
    let totalPeso = 0;

    if (!id) return false;

    const containerVar = document.getElementById(`contenedorVar${id}`);
    if (!containerVar) return false;

    document.querySelectorAll(`#tablaInfo${id} tbody tr`).forEach((fila) => {
        const tipo = fila.querySelector(".tipo")?.value;
        const valor =
            parseFloat(fila.querySelector(".canastillas")?.value) || 0;
        const valorPeso = parseFloat(fila.querySelector(".peso")?.value) || 0;

        if (tipo) {
            totalesPorTipo[tipo] = (totalesPorTipo[tipo] || 0) + valor;
            totalCanastilllas += valor;
        }

        if (tipo) {
            totalesPesoPorTipo[tipo] =
                (totalesPesoPorTipo[tipo] || 0) + valorPeso;
        }
    });

    // Actualizamos cada input de totales según su data-tipo

    for (const tipo in totalesPorTipo) {
        const container = containerVar.querySelector(
            `#contenedor${safeId(tipo)}`
        );
        const inputTotal = container.querySelector(
            `#input_Total_${safeId(tipo)}`
        );

        if (inputTotal) {
            inputTotal.value = totalesPorTipo[tipo];
            valorRestarPorTipo[tipo] = totalesPorTipo[tipo] * 1.5;
        }
    }

    for (const tipo in totalesPesoPorTipo) {
        const container = containerVar.querySelector(
            `#contenedor${safeId(tipo)}`
        );

        const inputKg = container.querySelector(`#input_Kg_${safeId(tipo)}`);

        if (inputKg) {
            inputKg.value =
                Number(totalesPesoPorTipo[tipo]).toFixed(2) -
                Number(valorRestarPorTipo[tipo]);
            totalPeso +=
                Number(totalesPesoPorTipo[tipo]).toFixed(2) -
                Number(valorRestarPorTipo[tipo]);
        }
    }

    // Sumamos el total de canastillas
    document.querySelector(`#canastillasProd${id}`).textContent =
        totalCanastilllas;

    document.querySelector(
        `#materiaProcesada${id}`
    ).textContent = `${totalPeso.toFixed(1)} Kg`;
}

function limpiarInputs(id) {
    document.querySelector(
        `input[id="canastillas${id}"][data-id="${id}"]`
    ).value = "";

    document.querySelector(`input[id="pesoKg${id}"][data-id="${id}"]`).value =
        "";
}

function eliminarFila(btn, id) {
    if (!btn) return;
    btn.closest("tr").remove();
    updateTotal(id);
    syncInputs(id);
    conteo--;
}

// Validador de campos Formulario.
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

function obtenerInfoProvedor(id) {
    const camposObligatorios = [
        `tiempoInicio${id}`,
        `tiempoFinal${id}`,
        `tiempo${id}`,
        `temperatura${id}`,
    ];

    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "¡Error!",
            text: "Debe llenar toda la información del proveedor.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }

    if (!validarProceso(id)) {
        Swal.fire({
            title: "¡Error!",
            text: "Debe llenar la Información de Detalles de Fritura.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }
    const { migas, rechazo } = variableProcesoProv(id);
    let dataProveedor = {
        proveedor: document.querySelector(`#proveedorNombre${id}`).textContent,
        info: {
            id_recepcion: document
                .querySelector(`#materiaProcesada${id}`)
                .getAttribute("data-recepcion"),
            id_proveedor: id,
            canastas: parseInt(
                document
                    .querySelector(`#canastillasProd${id}`)
                    .textContent.trim()
            ),
            rechazo: parseFloat(rechazo),
            migas: parseFloat(migas),
            materia_kg: parseFloat(
                document
                    .querySelector(`#materiaProcesada${id}`)
                    .textContent.trim()
            ),
            inicio_fritura: document.querySelector(`#tiempoInicio${id}`).value,
            fin_fritura: document.querySelector(`#tiempoFinal${id}`).value,
            tiempo_fritura: document.querySelector(`#tiempo${id}`).value,
            temperatura_fritura: document.querySelector(`#temperatura${id}`)
                .value,
        },
        detalle: [],
        variables: [],
    };

    const { detalles, variables } = obtenerDetaleProveeedor(id);
    dataProveedor.detalle = detalles;
    dataProveedor.variables = variables;

    // Buscar si ya existe un registro para este id_recepcion
    const indiceExistente = infoProveedores.findIndex(
        (p) => p.info.id_proveedor === id
    );

    if (indiceExistente !== -1) {
        // Si existe, actualizar el registro
        infoProveedores[indiceExistente] = dataProveedor;
    } else {
        // Si no existe, agregar nuevo registro
        infoProveedores.push(dataProveedor);
    }
    let timerInterval;
    Swal.fire({
        title: "¡Procesando Información!",
        timer: 1700,
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
            $(`#registroInfo${id}`).modal("hide");
        }
    });
    updateProceso();
    console.log(infoProveedores);

    return true;
}

function obtenerRecepciones() {
    let proveedores = document.querySelectorAll(".infoProveedor ");
    let datos = [];
    proveedores.forEach((input) => {
        datos.push(parseInt(input.getAttribute("data-recepcion")));
    });
    return datos;
}

function obtenerDetaleProveeedor(id) {
    const tiposElegidos = [];
    let lotes = [];
    let productoEligido = [];
    let lotesProveedor = [];
    let detalles = [];

    const filas = document.querySelectorAll(`#tablaInfo${id} tbody tr`);
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
        const loteProveedor = lote.getAttribute("data-loteProveedor");
        const tipo = fila.querySelector('input[name="tipo_fritura[]"]');
        const peso = fila.querySelector('input[name="peso_fritura[]"]');
        const cantidad = fila.querySelector(
            'input[name="canastilla_fritura[]"]'
        );
        if (lote && cantidad) {
            lotes.push(lote.value.trim());
            lotesProveedor.push(loteProveedor);
            tiposElegidos.push(tipo.value.trim());
            productoEligido.push(lote.getAttribute("data-producto"));

            detalles.push({
                lote_produccion: lote.value.trim(),
                lote_proveedor: loteProveedor,
                id_proveedor: id,
                tipo: tipo.value.trim(),
                peso: parseFloat(peso.value.trim()),
                canastas: parseFloat(cantidad.value.trim()),
            });
        }
    });

    const lotesEligidos = new Set(lotes);
    const lotesProveedorSet = new Set(lotesProveedor);
    const setElegidos = new Set(tiposElegidos);
    const producto = new Set(productoEligido);
    let lotesUnicos = Array.from(lotesEligidos);
    let lotesUnicosProveedor = Array.from(lotesProveedorSet);

    // Agregar solo valores únicos a Global_data
    // Convertir arrays existentes a Set, agregar nuevos valores, y volver a convertir a Array.
    Global_data.lotes = Array.from(
        new Set([...Global_data.lotes.flat(), ...lotesUnicos])
    );

    Global_data.loteProveedores = Array.from(
        new Set([
            ...Global_data.loteProveedores.flat(),
            ...lotesUnicosProveedor,
        ])
    );

    Global_data.tipos = Array.from(
        new Set([...Global_data.tipos.flat(), ...Array.from(setElegidos)])
    );

    Global_data.producto = Array.from(
        new Set([...Global_data.producto.flat(), ...Array.from(producto)])
    );

    const containerVar = document.getElementById(`contenedorVar${id}`);
    if (!containerVar) return false;

    const variables = [];

    let index = 0;
    setElegidos.forEach((tipo) => {
        const contenedor = containerVar.querySelector(
            `#contenedor${safeId(tipo)}`
        );
        if (!contenedor) return;

        let valido = true;
        const inputTotales = contenedor.querySelector(".inputTotal");
        const inputKg = contenedor.querySelector(".inputKg");

        if (valido) {
            variables.push({
                lote_produccion: lotesUnicos[index] ?? "",
                lote_proveedor: lotesUnicosProveedor[index] ?? "",
                id_proveedor: id,
                tipo: tipo,
                canastas: inputTotales?.value.trim(),
                cantidad_kg: parseFloat(inputKg?.value.trim()).toFixed(1),
            });
        }
        index++;
    });
    console.log(Global_data.loteProveedores);
    console.log(lotesUnicos);

    return { detalles, variables };
}

function obtenerLotes() {
    let index = 0;
    const lotes = [];
    Global_data.tipos.forEach((ref) => {
        const contenedores = document.querySelectorAll(`#contenedor${ref}`);
        if (!contenedores || contenedores.length === 0) return;

        let canastillas = 0;
        let peso_kg = 0;

        /* datos =  */
        contenedores.forEach((contenedor) => {
            const inputTotales = contenedor.querySelector(".inputTotal");
            const inputKg = contenedor.querySelector(".inputKg");
            canastillas += parseInt(inputTotales?.value.trim());
            peso_kg += parseFloat(inputKg?.value.trim());
        });

        lotes.push({
            lote_produccion: Global_data.lotes[index]
                ? Global_data.lotes[index]
                : "",
            tipo: ref,
            canastas: canastillas,
            cantidad_kg: parseFloat(peso_kg).toFixed(2),
        });

        console.log("map: ", lotes);
        index++;
    });

    return lotes;
}

// Actualiza y Obtiene los datos de produccion.
function updateProceso() {
    let totalCanastas = 0;
    let totalKg = 0;
    let totalRechazo = 0;
    let totalMigas = 0;

    let inutsTOTAL = document.querySelectorAll(".totalCanastas");
    let inutsMIGAS = document.querySelectorAll(".inputMigas");
    let inutsRECHAZO = document.querySelectorAll(".inputRechazo");
    let inutsKG = document.querySelectorAll(".inputPatKg");

    inutsTOTAL.forEach((input) => {
        totalCanastas += parseInt(input.textContent.trim());
    });
    inutsMIGAS.forEach((input) => {
        totalMigas += parseFloat(input.value.trim());
    });
    inutsRECHAZO.forEach((input) => {
        totalRechazo += parseFloat(input.value.trim());
    });
    inutsKG.forEach((input) => {
        totalKg += parseFloat(input.textContent.trim());
    });
    document.querySelector("#totalCanastillas").value = totalCanastas || 0;
    document.querySelector("#totalMigas").value = totalMigas.toFixed(1) || 0;
    document.querySelector("#totalRechazo").value =
        totalRechazo.toFixed(1) || 0;
    document.querySelector("#totalPatacon").value = totalKg.toFixed(1) || 0;
    /*    return datos; */
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

async function enviarFormulario() {
    const dataLotes = obtenerLotes();

    const camposObligatorios = [
        "aforo_aceite",
        "inventario_aceite",
        "lote_aceite",
        "nombreResponsable",
        "inicio_fritura",
        "fin_fritura",
        "gas_inicio",
        "gas_final",
        "totalCanastillas",
        "totalRechazo",
        "totalPatacon",
        "totalMigas",
        "idEncargo",
    ];

    // Validar que todos los campos de la tabla estén llenos
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

    if (!dataLotes || dataLotes.length == 0) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay Información de fritura para Guardar.. ",
            icon: "warning",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }
    const dataRecepciones = obtenerRecepciones();
    let fecha = obtenerFechaHoraLocal();

    const datos = {
        fecha: fecha,
        orden: document.getElementById("idEncargo").value,
        lote_aceite: document.getElementById("lote_aceite").value,
        aforo_aceite: document.getElementById("aforo_aceite").value,
        inventario_aceite: document.getElementById("inventario_aceite").value,
        inicio_fritura: document.getElementById("inicio_fritura").value,
        fin_fritura: document.getElementById("fin_fritura").value,
        producto: Global_data.producto[0],
        gas_inicio: parseInt(document.getElementById("gas_inicio").value),
        gas_final: parseInt(document.getElementById("gas_final").value),
        id_responsable: document.querySelector("#id_responsable").value,
        canastillas: parseInt(
            document.getElementById("totalCanastillas").value
        ),
        rechazo_fritura: parseFloat(
            document.getElementById("totalRechazo").value
        ),
        materia_fritura: parseFloat(
            document.getElementById("totalPatacon").value
        ),
        migas_fritura: parseFloat(document.getElementById("totalMigas").value), // kilos de materia producida
        observaciones:
            document.getElementById("Observaciones").value ||
            "No hay Observaciones",
        recepciones: dataRecepciones,
        infoProveedores,
        lotes: dataLotes,
    };

    /* let data = estructurarDatos(datos); */
    console.log(datos);
    try {
        const respuesta = await apiFritura.post("/crear", datos, {
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

document.getElementById("btnGuardar").addEventListener("click", function (e) {
    e.preventDefault();
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#699c2fff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Enviar información.",
        cancelButtonText: "Volver",
    }).then((result) => {
        if (result.isConfirmed) {
            enviarFormulario();
        }
    });
});

const eventAgregar = (id) => {
    if (!id) return;

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
            agregarFila(id);
        }
    });
};

const eventEliminar = (btnEliminar, id) => {
    if (!id) return;
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
            eliminarFila(btnEliminar, id);
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
};

const empleado = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Fritador", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const fritadorList = document.getElementById("empleadolist");
    const { responsables } = response.data;
    fillDatalist(fritadorList, responsables);
    handleInput(fritadorList, "nombreResponsable", "id_responsable");
};

const rendereizarProveedores = (proveedores) => {
    const contenedor = document.querySelector("#contenedorProveedor");

    if (!contenedor) {
        return false;
    }

    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion";
    accordionContainer.id = "accordionProveedores";

    proveedores.forEach((item, index) => {
        const conteo = index + 1;

        // Crear el item del accordion
        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";

        // Header del accordion
        const accordionHeader = document.createElement("h2");
        accordionHeader.className = "accordion-header";
        accordionHeader.id = `heading${conteo}`;

        const accordionButton = document.createElement("button");
        accordionButton.className = `accordion-button shadow-sm ${
            conteo === 1 ? "" : "collapsed"
        }`;
        accordionButton.type = "button";
        accordionButton.setAttribute("data-bs-toggle", "collapse");
        accordionButton.setAttribute("data-bs-target", `#collapse${conteo}`);
        accordionButton.setAttribute(
            "aria-expanded",
            conteo === 1 ? "true" : "false"
        );
        accordionButton.setAttribute("aria-controls", `collapse${conteo}`);
        accordionButton.innerHTML = `
            <div class="d-flex justify-content-between align-items-center w-100 pe-3">
                <span class="fw-semibold"><span class="badge  ms-2 rounded-pill" style="background-color: #6c780d;" data-loteR="${item.lote}" data-producto=${item.producto} >${conteo}</span> ${item.proveedor}</span>
                <span class="badge fs-6 ms-2 producto rounded-pill" style="background-color: #ec6704; "  >${item.producto}</span>
                
            </div>
        `;

        accordionHeader.appendChild(accordionButton);

        // Body del accordion
        const accordionCollapse = document.createElement("div");
        accordionCollapse.id = `collapse${conteo}`;
        accordionCollapse.className = `accordion-collapse collapse  ${
            conteo === 1 ? "show" : ""
        }`;
        accordionCollapse.setAttribute("aria-labelledby", `heading${conteo}`);
        accordionCollapse.setAttribute(
            "data-bs-parent",
            "#accordionProveedores"
        );

        const accordionBody = document.createElement("div");
        accordionBody.className = "accordion-body border-0";

        // Contenido del accordion
        const row = document.createElement("div");
        row.className = "row g-3";

        // Campo Materia Prima
        const colMateria = document.createElement("div");
        colMateria.className = "col-12 col-md-6 col-lg-4 text-center";
        colMateria.innerHTML = `
             <span class="badge fs-5 ms-2 fw-medium text-dark" style="background-color: #d2eaf1;">Materia Procesada</span>
              <p class="text-center mt-4 fw-bold fs-5 inputPatKg infoProveedor" id="materiaProcesada${item.id_proveedor}" data-producto=${item.producto} data-id="${item.id_proveedor}" data-recepcion="${item.id}" data-loteR="${item.lote}" >0 Kg</p>
            <div class="border-bottom mb-3"></div>
        `;

        const colBtn = document.createElement("div");
        colBtn.className = "col-12 col-md-6 col-lg-4";
        colBtn.innerHTML = `
            <label for="cantidad_${conteo}_kg" class="form-label fw-bold">Registrar Información</label>
            <button type="button" class="btn btn- w-100 shadow-sm fw-bold fs-5 text-white mt-4" style="background-color: #6c780d;" data-bs-toggle="modal" data-recepcion="${item.id} data-loteR="${item.lote}" data-bs-target="#registroInfo${item.id_proveedor}" ><i class="fa-regular fa-clipboard fs-5"></i> Fritura</button>
        `;

        // Campo Canastillas
        const colCanastillas = document.createElement("div");
        colCanastillas.className = "col-12 col-md-6 col-lg-4 text-center";
        colCanastillas.innerHTML = `
            <span class="badge fs-5 ms-2 fw-medium text-dark" style="background-color: #d2eaf1;">Canastillas</span>
            <p class="text-center mt-4 fw-bold fs-5 totalCanastas" id="canastillasProd${item.id_proveedor}" data-id="${item.id_proveedor}"  data-recepcion="${item.id}" data-loteR="${item.lote}">0</p>
            <div class="border-bottom mb-3"></div>  
        `;

        // Input hidden
        const inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.value = item.id_proveedor;
        inputHidden.id = `id_proveedor_${conteo}`;
        inputHidden.setAttribute("name", "id_proveedor[]");
        inputHidden.setAttribute("data-recepcion", `${item.id_proveedor}`);
        inputHidden.setAttribute("data-loteR", `${item.lote}`);

        createModal(item.proveedor, item.id_proveedor);
        row.appendChild(colBtn);
        row.appendChild(colMateria);
        row.appendChild(colCanastillas);

        accordionBody.appendChild(row);
        accordionBody.appendChild(inputHidden);

        accordionCollapse.appendChild(accordionBody);

        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);

        accordionContainer.appendChild(accordionItem);
    });

    /*  contenedor.appendChild(accordionContainer); */
    contenedor.appendChild(accordionContainer);
};

async function cargarProveedores() {
    let fecha = new Date();
    const fechaHoy = `${fecha.getFullYear()}-${
        fecha.getMonth() + 1
    }-${fecha.getDate()}`;
    let ide = document.getElementById("idEncargo").value;
    const response = await apiProveedores.get(
        `/obtener-proveedor-recepcion-Day/${fechaHoy}/${ide}/Fritura`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        }
    );

    if (!response.success) {
        alerts.show(response);
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, "3000");
    }

    const { proveedores } = response.data;
    rendereizarProveedores(proveedores);
    referenciasList(tipos, proveedores);
}

const referencias = async () => {
    const response = await apiReferencias.get("/obtener", {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { referencias } = response.data;
    tipos = {};
    tipos = referencias;
};

const referenciasList = (referencias, proveedores) => {
    proveedores.forEach((item) => {
        let selectReferencias = document.querySelector(
            `#referencias${item.id_proveedor}`
        );
        referencias.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.Nombre;
            option.dataset.id = item.id;
            option.textContent = item.Nombre;
            selectReferencias.appendChild(option);
        });
    });
};

const createModal = (proveedor, id) => {
    const contenedor = document.querySelector("#contenedorModals");
    if (!contenedor) {
        console.warn("No existe el contenedor");
        return false;
    }

    const modal = `
<div class="modal fade" id="registroInfo${id}" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 modal-dialog-scrollable shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #6c780d;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0" style="font-family: Arial, Helvetica, sans-serif">REGISTRO DE
                        INFORMACIÓN FRITURA -  <span class="badge text-white fs-5 p-2 fw-bold" style="background-color: #ec6704 ;">${proveedor.toUpperCase()}</span>   </h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">

                <nav>
                    <div  class="nav nav-tabs justify-content-end" id="myTab" role="tablist">

                       <button class="nav-link show active" id="tiempo-tab${id}" data-bs-toggle="tab"
                                data-bs-target="#tiempo-tab-pane${id}" type="button" role="tab" aria-controls="tiempo-tab-pane${id}" aria-selected="false"> Tiempos
                        </button>

                            <button class="nav-link" id="fritura-tab${id}" data-bs-toggle="tab"
                                data-bs-target="#fritura-tab-pane${id}" type="button" role="tab"
                                aria-controls="fritura-tab-pane${id}" aria-selected="false">Fritura
                            </button>
                        
                        
                            <button class="nav-link" id="variable-tab${id}" data-bs-toggle="tab"
                                data-bs-target="#variable-tab-pane${id}" type="button" role="tab"
                                aria-controls="variable-tab-pane${id}" aria-selected="false">Proceso
                            </button>
                        </div>

                    </nav>

                    <div class="tab-content" id="myTabContent${id}">
                        <div class="tab-pane fade" id="fritura-tab-pane${id}" role="tabpanel" aria-labelledby="fritura-tab${id}"
                            tabindex="0">
                            <div class="row mt-1 d-flex justify-content-center p-2">
                            <div class="row text-center mt-1 p-2">
                                  <div class="col">
                                        <h3  class="fw-semibold text-uppercase" style="color:#24243c;">
                                            <i class="fa-solid fa-fire me-2" style="color:#ec6704;"></i> INFORMACIÓN DE PROCESO FRITURA
                                        </h3>
                                         <div class="border-bottom mb-3"></div>
                                   </div>
                               </div>
                                <div class="row d-flex justify-content-between p-3 mt-4">
                                <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Variedad
                                        </h5>
                                        <select class="variedad form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                            id="variedad${id}">
                                             <option value="">-- Seleccionar --</option>
                                             <option value="C">Comino</option>
                                             <option value="H">Harton</option>
                                             <option value="HW">Hawaiano</option>
                                        </select>

                                          <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                           </div>

                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Tipo
                                        </h5>
                                        <select class="tipo form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                            id="referencias${id}">
                                             <option value="">-- Seleccionar --</option>
                                        </select>
                                          <div class="invalid-feedback">
                                           Este campo es obligatorio.
                                            </div>

                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-table-cells me-2" style="color:#ec6704;"></i>
                                            Canastillas
                                        </h5>
                                        <input type="number"
                                            class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric" min="0"
                                            placeholder="# Canastillas" id="canastillas${id}" data-id="${id}" required>

                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>

                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                            <i class="fa-solid fa-scale-unbalanced-flip me-2" style="color:#ec6704;"></i> Peso
                                        </h5>
                                        <input type="number"
                                            class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric" min="0"
                                            placeholder="Peso Patacón Kg" id="pesoKg${id}" data-id="${id}" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                            </div>
                                    </div>
                                    <div class="col">
                                        <button type="button" class="btn fs-6 shadow-lg fw-semibold text-white mt-5 p-2 btn-Canastillas"
                                             style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c;"  id="btnRegistrarFritura${id}" data-id="${id}">
                                            <i class="fa-solid fa-circle-check me-1"></i> REGISTRAR 
                                        </button>
                                    </div>
                                </div>
                                    <div class="row mt-1 p-1">
                                        <div class="col-12">
                                            <div class="card-body">
                                                <div class="card-body table-responsive">
                                                    <table class="table tabla-personalized p-3"
                                                        id="tablaInfo${id}">
                                                        <thead>
                                                            <tr>
                                                                <th class="A text-center;">LOTE</th>
                                                                <th class="M text-center;">TIPO</th>
                                                                <th class="M text-center;">PESO</th>
                                                                <th class="M text-center;">CANASTILLAS</th>
                                                                <th style="text-align: center;">ACCION</th>
                                                            </tr>

                                                        </thead>
                                                        <tbody>

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                        </div>
                        <div class="tab-pane fade mb-3" id="variable-tab-pane${id}" role="tabpanel" aria-labelledby="variable-tab${id}" tabindex="0">
                            <div class="row mt-1 d-flex justify-content-center p-2">
                              <div class="row text-center mt-1 p-2">
                                <div class="col">
                                       <h3  class="fw-semibold text-uppercase" style="color:#24243c;">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> INFORMACIÓN DETALLES DE PROCESO
                                        </h3>
                                         <div class="border-bottom mb-3"></div>
                                </div>
                               </div>

                              <div class="row d-flex justify-content-center mt-2 p-3" id="contenedorVar${id}">
                                
                                
                               </div>
                                <input type="hidden"
                                            class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" min="0"
                                            placeholder="" id="rechazo${id}" data-id="${id}" required>
                                             <input type="hidden"
                                            class="form-control rounded shadow-sm fs-5 text-center numeric" min="0"
                                            placeholder="P" id="migas${id}" data-id="${id}" required>
                           </div>
                        </div>
                        <div class="tab-pane fade active show" id="tiempo-tab-pane${id}" role="tabpanel" aria-labelledby="tiempo-tab${id}"
                            tabindex="0">
                            <div class="row mt-1 justify-content-center">
                               <div class="row text-center mt-1 p-3">
                                  <div class="col">
                                        <h3  class="fw-semibold text-uppercase" style="color:#24243c;">
                                            <i class="fa-solid fa-stopwatch me-2" style="color:#ec6704;"></i> INFORMACIÓN DE TIEMPO DE FRITURA
                                        </h3>
                                         <div class="border-bottom mb-3"></div>
                                   </div>
                               </div>
                                <div class="row d-flex justify-content-between mt-1 p-3">
                                <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-2 mb-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-clock me-2" style="color:#ec6704;"></i>
                                            Inicio Fritura
                                        </h5>
                                        <input 
                                        type="time"
                                            class="form-control form-contro-lg rounded shadow-sm fs-5 text-center" 
                                            placeholder="Tiempo Fritura" id="tiempoInicio${id}" name="tiempoInicio[] data-id="${id}"  required>

                                        <div class="invalid-feedback">
                                            Este campo es obligatorio,
                                        </div>
                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-2 mb-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-clock me-2" style="color:#ec6704;"></i>  Final Fritura
                                        </h5>
                                        <input type="time"
                                            class="form-control form-contro-lg rounded shadow-sm fs-5 text-center" 
                                             placeholder="Tiempo Fritura" id="tiempoFinal${id}" name="tiempoFinal[]" data-id="${id}" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>
                                </div>
                                <div class="row d-flex justify-content-between mt-4 p-3">
                                    <div class="col-3">
                                        <h5 class="fw-semibold text-uppercase mt-2"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-user me-2" style="color:#ec6704;"></i>
                                            Proveedor
                                        </h5>
                                      <p class="proveedor mt-2 text-justify p-2 fs-5 fw-semibold" id="proveedorNombre${id}"  data-id="${id}">${proveedor.toUpperCase()}</p>
                                      <div class="border-bottom"></div>
                                    </div>
                                    <div class="col-3">
                                        <h5 class="fw-semibold text-uppercase mt-2"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-clock-rotate-left me-2" style="color:#ec6704;"></i> Tiempo FRITURA
                                        </h5>
                                        <input type="number" class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" min="0"
                                            step="0.1" placeholder="Tiempo Friura" id="tiempo${id}" name="tiempo[]" data-id="${id}" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>

                                    <div class="col-3">
                                        <h5 class="fw-semibold text-uppercase mt-2"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-temperature-high me-2" style="color:#ec6704;"></i>
                                            Temperatura
                                        </h5>
                                        <input type="number"
                                            class="form-control form-contro-lg rounded shadow-sm fs-5 text-center numeric" min="0"
                                            step="0.1" placeholder="Temperatura °" id="temperatura${id}" name="temperatura[]" data-id="${id}" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

         <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-lg p-3 px-4 fs-3 btn-danger text-white" data-bs-dismiss="modal" id="btnCloseModal" data-id="${id}">
                <i class="fa-solid fa-xmark fs-4"></i>
                </button>
                <button type="button" class="btn btn-lg p-3 px-4 fs-3 text-white btn-Obtener" style="background-color: #6c780d;" id="btnObtenerCanastillas${id}" data-id="${id}">
                <i class="fa-solid fa-circle-check fs-4 btn-Obtener"></i>
                </button>
        </div>
    </div>
`;

    contenedor.innerHTML += modal;
};
const socket = new WebSocket("ws://localhost:3105");

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "nuevoProveedor") {
        cargarProveedores();
    }
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }
};

setTimeout(() => {
    init();
}, "1000");
