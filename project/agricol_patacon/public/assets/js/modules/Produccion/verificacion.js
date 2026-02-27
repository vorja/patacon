import { ApiService, AlertManager, Url } from "../../helpers/ApiUseManager.js";

const apiVerificacion = new ApiService(Url + "/data/verificacion");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");
const apiLotesFritura = new ApiService(Url + "/data/lotes-fritura");

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
    inputLotePaquete: document.getElementById("loteProduccion"),
    inputPesoPaquete: document.getElementById("pesoPaquete"),
    selectLotePaquete: document.getElementById("selectLotePaquete"),
    btnRegistrarEmpaque: document.getElementById("btnRegistrarEmpaque"),
    btnCerrarEmpaque: document.getElementById("btnObtenerDataEmpaque"),
    btnRegistrarPaquete: document.getElementById("btnRegistrarPaquetes"),
    btnCerrarPaquete: document.getElementById("btnObtenerDataPaquetes"),
};
const dataEmpaque = [];
const dataPaquete = [];

// Variable global para almacenar lotes
let lotesDisponibles = [];

// Constante para localStorage
const STORAGE_KEY = "paquetesRegistrados";

// Función para obtener registros del localStorage
function getRegistrosPaquetes() {
    const registros = localStorage.getItem(STORAGE_KEY);
    return registros ? JSON.parse(registros) : [];
}

// Función para guardar registros en localStorage
function guardarRegistroPaquete(registro) {
    const registros = getRegistrosPaquetes();
    registros.push(registro);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

// Función para eliminar un registro del localStorage
function eliminarRegistroPaquete(index) {
    const registros = getRegistrosPaquetes();
    registros.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

// Función para verificar si un lote ya está registrado (solo para información)
function loteYaRegistrado(loteProduccion) {
    const registros = getRegistrosPaquetes();
    return registros.some(
        (registro) => registro.lote_produccion === loteProduccion,
    );
}

// Función para cargar registros en la tabla desde localStorage
function cargarRegistrosEnTabla() {
    const registros = getRegistrosPaquetes();
    const tbody = document.querySelector("#tablaPaquetes tbody");
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpiar tabla

    registros.forEach((registro, index) => {
        const newRow = document.createElement("tr");

        // Input ocultos
        const inputLote = document.createElement("input");
        inputLote.value = registro.lote_produccion;
        inputLote.className = "form-control inputLote";
        inputLote.type = "text";
        inputLote.setAttribute("hidden", "true");
        inputLote.setAttribute("name", "lote_produccion[]");
        inputLote.setAttribute("data-lote", registro.lote_produccion);
        inputLote.setAttribute("data-tipo", registro.tipo);
        inputLote.setAttribute("data-id_fritura", registro.id_fritura);
        inputLote.setAttribute("data-index", index);

        const inputPeso = document.createElement("input");
        inputPeso.value = registro.peso_paquete;
        inputPeso.className = "inputPeso";
        inputPeso.type = "text";
        inputPeso.setAttribute("hidden", "true");
        inputPeso.setAttribute("name", "peso_paquete[]");
        inputPeso.setAttribute("data-pesoPaquete", registro.peso_paquete);
        inputPeso.setAttribute("data-lote", registro.lote_produccion);
        inputPeso.setAttribute("data-index", index);

        // Celdas visibles
        const loteProduccionTd = document.createElement("td");
        loteProduccionTd.innerHTML = `
            <div class="fw-bold fs-5">${registro.lote_produccion}</div>
        `;
        loteProduccionTd.className = "text-center";
        loteProduccionTd.appendChild(inputLote);

        const pesoPaqueteTd = document.createElement("td");
        pesoPaqueteTd.innerHTML = `<div class="fw-bold fs-5">${registro.peso_paquete} kg</div>`;
        pesoPaqueteTd.className = "T1 text-center";
        pesoPaqueteTd.appendChild(inputPeso);

        const accion = document.createElement("td");
        accion.className = "text-center";

        // Crear botón de eliminar
        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-light btn-sm btnEliminarPaquete";
        btnEliminar.setAttribute("data-index", index);
        btnEliminar.innerHTML =
            '<i class="ft-trash-2 text-danger fw-bold fs-3"></i>';

        // Añadir evento directamente al botón
        btnEliminar.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            eliminarRegistroPaqueteDesdeTabla(index);
        });

        accion.appendChild(btnEliminar);

        newRow.appendChild(loteProduccionTd);
        newRow.appendChild(pesoPaqueteTd);
        newRow.appendChild(accion);
        tbody.appendChild(newRow);
    });

    // Actualizar contadores después de cargar
    actualizarContadoresPaquetes();
}

// Función para manejar la eliminación desde la tabla
function eliminarRegistroPaqueteDesdeTabla(index) {
    if (index === null) return;

    // Confirmar eliminación
    Swal.fire({
        title: "¿Eliminar registro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar del localStorage
            eliminarRegistroPaquete(parseInt(index));

            // Recargar tabla
            cargarRegistrosEnTabla();

            Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "Registro eliminado correctamente",
                timer: 1000,
                showConfirmButton: false,
            });
        }
    });
}

// Inicializar eventos
function inicializarEventos() {
    elements.inputFecha.removeEventListener("input", generadorLoteEmpaque);
    elements.inputFecha.addEventListener("input", generadorLoteEmpaque);
    elements.inputProducto.addEventListener("input", generadorLoteEmpaque);
    elements.inputTipo.addEventListener("input", generadorLoteEmpaque);

    // Para paquetes, solo la fecha dispara la carga de lotes
    elements.inputFechaPaquete.addEventListener("change", async function () {
        await cargarLotesPorFecha(this.value);
    });

    // Quitar eventos de input para variedad y referencia en paquetes
    elements.inputProductoPaquete.removeEventListener(
        "input",
        generadorLotePaquete,
    );
    elements.inputTipoPaquete.removeEventListener(
        "input",
        generadorLotePaquete,
    );

    // Agregar evento al select de lotes
    if (elements.selectLotePaquete) {
        elements.selectLotePaquete.addEventListener("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.dataset.loteData) {
                const loteData = JSON.parse(selectedOption.dataset.loteData);
                autocompletarCamposPaquete(loteData);

                // QUITADO: Ya no se verifica si el lote está registrado
                // Siempre habilitar los campos para nuevo registro
                if (elements.inputPesoPaquete) {
                    elements.inputPesoPaquete.disabled = false;
                    elements.inputPesoPaquete.value = ""; // Limpiar peso automático
                    elements.inputPesoPaquete.focus(); // Poner foco en el peso
                }
                if (elements.btnRegistrarPaquete) {
                    elements.btnRegistrarPaquete.disabled = false;
                }
            }
        });
    }

    // Asegurar que los botones tengan sus eventos
    if (elements.btnRegistrarPaquete) {
        elements.btnRegistrarPaquete.removeEventListener(
            "click",
            storeDataPaquete,
        );
        elements.btnRegistrarPaquete.addEventListener(
            "click",
            storeDataPaquete,
        );
    } else {
        console.error("Botón btnRegistrarPaquetes no encontrado");
    }

    if (elements.btnRegistrarEmpaque) {
        elements.btnRegistrarEmpaque.removeEventListener(
            "click",
            storeDataEmpaque,
        );
        elements.btnRegistrarEmpaque.addEventListener(
            "click",
            storeDataEmpaque,
        );
    }

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

    // Cargar registros existentes al inicializar
    cargarRegistrosEnTabla();

    // Cargar registros cuando se muestre el modal
    const modalPaquetes = document.getElementById("registroInfoPaquetes");
    if (modalPaquetes) {
        modalPaquetes.addEventListener("shown.bs.modal", function () {
            cargarRegistrosEnTabla();
        });

        // Resetear campos cuando se cierra el modal
        modalPaquetes.addEventListener("hidden.bs.modal", function () {
            // Limpiar campos de entrada
            const campos = ["pesoPaquete"];
            campos.forEach((id) => {
                const input = document.getElementById(id);
                if (input) {
                    input.value = "";
                    input.disabled = false;
                    input.classList.remove("is-invalid", "is-valid");
                }
            });

            if (elements.selectLotePaquete) {
                elements.selectLotePaquete.selectedIndex = 0;
            }
        });
    }

    // Configurar event listeners para eliminar
    setupEventListenersEliminar();
}

// Configurar event listeners para eliminar registros
function setupEventListenersEliminar() {
    // Usar event delegation para manejar clicks dinámicos
    document.addEventListener("click", function (e) {
        // Verificar si el click fue en el botón eliminar de paquetes
        let btnEliminar;

        if (e.target.classList.contains("btnEliminarPaquete")) {
            btnEliminar = e.target;
        } else if (e.target.closest(".btnEliminarPaquete")) {
            btnEliminar = e.target.closest(".btnEliminarPaquete");
        } else if (
            e.target.classList.contains("ft-trash-2") &&
            e.target.closest(".btnEliminarPaquete")
        ) {
            btnEliminar = e.target.closest(".btnEliminarPaquete");
        }

        if (btnEliminar) {
            const index = btnEliminar.getAttribute("data-index");
            if (index !== null) {
                e.preventDefault();
                e.stopPropagation();

                eliminarRegistroPaqueteDesdeTabla(index);
            }
        }

        // Verificar si el click fue en el botón eliminar de empaque
        if (e.target.closest("#btnEliminarEm")) {
            eliminarFila2(e.target.closest("#btnEliminarEm"));
        }
    });
}

const init = async () => {
    await empleados();
    await encargo();
    inicializarEventos(); // Inicializar eventos después de cargar elementos
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
    document.querySelector(`#lote`).value =
        `${producto}${tipo}${fechaSele.replace(/-/g, "")}`;
}

function generadorLotePaquete() {
    let fechaSele = elements.inputFechaPaquete.value;
    let producto = elements.inputProductoPaquete.value;
    let tipo = elements.inputTipoPaquete.value;
    document.querySelector(`#loteProduccion`).value =
        `${producto}${tipo}${fechaSele.replace(/-/g, "")}`;
}

// Eliminar fila - CORREGIDO
function eliminarFila(btn) {
    // Obtener el índice desde el atributo data-index del botón
    const index = btn.getAttribute("data-index");

    if (index !== null) {
        eliminarRegistroPaqueteDesdeTabla(index);
    }
}

function eliminarFila2(btn) {
    const row = btn.closest("tr");
    if (row) {
        row.remove();
        // Actualizar contadores de empaque
        actualizarContadoresEmpaque();
    }
}

// Función para actualizar contadores de empaque
function actualizarContadoresEmpaque() {
    const filas = document.querySelectorAll("#tablaEmpaque tbody tr");
    let lotes = [];

    filas.forEach((fila) => {
        const lote = fila.querySelector('input[name="empaque[]"]');
        if (lote) {
            lotes.push(lote.value.trim());
        }
    });

    const lotesUnico = [...new Set(lotes)];

    document.querySelector("#conteoLotes").value = lotesUnico.length || 0;
    document.querySelector("#conteoCajas").value = lotes.length || 0;
}

// Función para actualizar contadores de paquetes
function actualizarContadoresPaquetes() {
    const registros = getRegistrosPaquetes();
    const lotesUnico = [...new Set(registros.map((r) => r.lote_produccion))];

    document.querySelector("#conteoLotePaquete").value = lotesUnico.length || 0;
    document.querySelector("#conteoPaquetes").value = registros.length || 0;
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

// MODIFICADO: storeDataPaquete - Ahora permite múltiples registros del mismo lote
function storeDataPaquete() {
    console.log("storeDataPaquete ejecutado");

    // Validar que se haya seleccionado un lote
    if (!elements.selectLotePaquete || !elements.selectLotePaquete.value) {
        Swal.fire({
            icon: "warning",
            title: "Lote requerido",
            text: "Por favor, seleccione un lote del día.",
        });
        return;
    }

    const selectedOption =
        elements.selectLotePaquete.options[
            elements.selectLotePaquete.selectedIndex
        ];
    const loteData = JSON.parse(selectedOption.dataset.loteData);

    const loteProduccion = loteData.lote_produccion;
    const pesoPaquete = parseFloat(elements.inputPesoPaquete.value);
    const referencia = loteData.tipo;
    const idFritura = loteData.id_fritura;

    // QUITADO: Ya no se verifica si el lote ya está registrado
    // Se permiten múltiples registros del mismo lote

    // Validar peso (requerido y mayor a 0)
    const pesoIngresado = parseFloat(elements.inputPesoPaquete.value);
    if (!pesoIngresado || pesoIngresado === 0 || isNaN(pesoIngresado)) {
        Swal.fire({
            icon: "warning",
            title: "Peso inválido",
            text: "Por favor ingrese un peso válido mayor a 0.",
        });
        return;
    }

    // Crear objeto del registro
    const nuevoRegistro = {
        lote_produccion: loteProduccion,
        peso_paquete: pesoPaquete,
        tipo: referencia,
        id_fritura: idFritura,
        fecha_registro: new Date().toISOString(),
    };

    // Guardar en localStorage
    guardarRegistroPaquete(nuevoRegistro);

    // Recargar la tabla con todos los registros
    cargarRegistrosEnTabla();

    // Actualizar contadores
    actualizarContadoresPaquetes();

    // Mostrar confirmación
    Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: `Paquete registrado correctamente para el lote ${loteProduccion}`,
        timer: 1000,
        showConfirmButton: false,
    });

    // Limpiar solo el campo de peso para siguiente registro
    if (elements.inputPesoPaquete) {
        elements.inputPesoPaquete.value = "";
        elements.inputPesoPaquete.classList.remove("is-valid");
        elements.inputPesoPaquete.focus();
    }

    // El select mantiene su selección para poder registrar otro paquete del mismo lote
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
    accion.innerHTML = `<button type="button" class="btn btn-light btn-sm" id="btnEliminarEm"><i class="ft-trash-2 text-danger fw-bold fs-3"></i></button>`;

    newRow.appendChild(loteEmpaqueTd);
    newRow.appendChild(pesoCajaTd);
    newRow.appendChild(accion);

    // Añadir la fila a la tabla
    document.querySelector("#tablaEmpaque tbody").appendChild(newRow);
    limpiarInputs();

    // Actualizar contadores
    actualizarContadoresEmpaque();
}

function obtenerFechaHoraLocal() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function obtenerPaquete() {
    const registros = getRegistrosPaquetes();

    if (!registros || registros.length === 0) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay paquetes registrados para esta verificación.",
            icon: "info",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return false;
    }

    const lotesUnico = [...new Set(registros.map((r) => r.lote_produccion))];

    // Actualizar contadores (solo visual)
    document.querySelector("#conteoLotePaquete").value = lotesUnico.length || 0;
    document.querySelector("#conteoPaquetes").value = registros.length || 0;

    $("#registroInfoPaquetes").modal("hide");

    // Mostrar confirmación
    Swal.fire({
        icon: "success",
        title: "Paquetes registrados",
        text: `Se han registrado ${registros.length} paquetes de ${lotesUnico.length} lotes diferentes`,
        timer: 1000,
        showConfirmButton: false,
    });

    return true;
}

function obtenerEmpaque() {
    const filas = document.querySelectorAll("#tablaEmpaque tbody tr");
    let lotes = [];

    if (!filas || filas.length <= 0) {
        Swal.fire({
            title: "¡Atención!",
            text: "No hay empaques registrados para esta verificación.",
            icon: "info",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    // Limpiar dataEmpaque antes de agregar nuevos
    dataEmpaque.length = 0;

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

    const lotesUnico = [...new Set(lotes)];

    document.querySelector("#conteoLotes").value = lotesUnico.length || 0;
    document.querySelector("#conteoCajas").value = lotes.length || 0;

    $("#registroInfoEmpaque").modal("hide");

    // Mostrar confirmación
    Swal.fire({
        icon: "success",
        title: "Empaques registrados",
        text: `Se han registrado ${lotes.length} cajas de ${lotesUnico.length} lotes diferentes`,
        timer: 1000,
        showConfirmButton: false,
    });
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
            `option[value="${e.target.value}"]`,
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

// MODIFICADO: limpiarModalPaquete
function limpiarModalPaquete() {
    const campos = [
        "variedadPaquete",
        "referenciaPaquete",
        "loteProduccion",
        "fechaPaquete",
        "pesoPaquete",
    ];

    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.classList.remove("is-invalid", "is-valid");
        input.value = "";
    });

    // Resetear select
    resetSelectLotes();

    // NO limpiar la tabla aquí, se mantienen los registros
    // Solo recargar la tabla para mostrar registros persistentes
    cargarRegistrosEnTabla();
}

// MODIFICADO: Función para cargar lotes por fecha
async function cargarLotesPorFecha(fecha) {
    if (!fecha) {
        resetSelectLotes();
        return;
    }

    try {
        // Mostrar loading en el select
        if (elements.selectLotePaquete) {
            elements.selectLotePaquete.innerHTML =
                '<option value="" selected disabled>Cargando lotes...</option>';
            elements.selectLotePaquete.disabled = true;
        }

        const response = await apiLotesFritura.get(`/obtener?fecha=${fecha}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (response.success && response.data && response.data.length > 0) {
            // Guardar los lotes en variable global
            lotesDisponibles = response.data;

            // Llenar el dropdown con los lotes (solo el código del lote, sin agrupar por tipo)
            llenarSelectLotes(response.data);

            // Habilitar el select
            if (elements.selectLotePaquete) {
                elements.selectLotePaquete.disabled = false;
            }
        } else {
            resetSelectLotes();
            if (elements.selectLotePaquete) {
                elements.selectLotePaquete.innerHTML =
                    '<option value="" selected disabled>No hay lotes para esta fecha</option>';
                elements.selectLotePaquete.disabled = false;
            }

            Swal.fire({
                icon: "info",
                title: "Sin datos",
                text: "No se encontraron lotes de fritura para esta fecha.",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    } catch (error) {
        console.error("Error al cargar lotes:", error);
        resetSelectLotes();
        if (elements.selectLotePaquete) {
            elements.selectLotePaquete.innerHTML =
                '<option value="" selected disabled>Error al cargar</option>';
            elements.selectLotePaquete.disabled = false;
        }

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los lotes de fritura.",
            timer: 1200,
            showConfirmButton: false,
        });
    }
}

// MODIFICADO: Función para llenar el dropdown con lotes (solo código, sin agrupar por tipo)
function llenarSelectLotes(lotes) {
    if (!elements.selectLotePaquete) return;

    // Limpiar el select
    elements.selectLotePaquete.innerHTML =
        '<option value="" selected disabled>Seleccione un lote</option>';

    // Crear opciones simples (sin agrupar por tipo)
    lotes.forEach((lote) => {
        const option = document.createElement("option");
        option.value = lote.lote_produccion;
        option.textContent = lote.lote_produccion;
        option.dataset.loteData = JSON.stringify(lote);
        elements.selectLotePaquete.appendChild(option);
    });
}

// MODIFICADO: Función para autocompletar campos cuando se selecciona un lote
function autocompletarCamposPaquete(loteData) {
    console.log("Autocompletando con lote:", loteData);

    // 2. REFERENCIA = tipo
    if (elements.inputTipoPaquete) {
        elements.inputTipoPaquete.value = loteData.tipo;
        elements.inputTipoPaquete.classList.remove("is-invalid");
        elements.inputTipoPaquete.classList.add("is-valid");
    }

    // 3. LOTE = lote_produccion
    if (elements.inputLotePaquete) {
        elements.inputLotePaquete.value = loteData.lote_produccion;
        elements.inputLotePaquete.classList.remove("is-invalid");
        elements.inputLotePaquete.classList.add("is-valid");
    }

    // 4. PESO = DEBE QUEDAR VACÍO para que el usuario lo ingrese manualmente
    if (elements.inputPesoPaquete) {
        // QUITADO: No poner peso automático
        elements.inputPesoPaquete.value = ""; // Campo vacío
        elements.inputPesoPaquete.placeholder = "Ingrese peso del paquete"; // Placeholder indicativo
        elements.inputPesoPaquete.classList.remove("is-invalid");
        console.log("Peso listo para ingreso manual");
    }
}

// Función para resetear el select
function resetSelectLotes() {
    if (elements.selectLotePaquete) {
        elements.selectLotePaquete.innerHTML =
            '<option value="" selected disabled>Seleccione una fecha primero</option>';
        elements.selectLotePaquete.disabled = false;
    }
    lotesDisponibles = [];
}

// Función para limpiar campos después de registrar
function limpiarCamposParaNuevoRegistro() {
    // Limpiar solo el peso para que el usuario pueda ingresar uno nuevo
    if (elements.inputPesoPaquete) {
        elements.inputPesoPaquete.value = "";
        elements.inputPesoPaquete.classList.remove("is-valid");
        elements.inputPesoPaquete.focus();
    }
}

// CORREGIDO: Función enviarFormulario
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

    // IMPORTANTE: Obtener los datos actuales directamente
    const registrosPaquetes = getRegistrosPaquetes();
    const filasEmpaque = document.querySelectorAll("#tablaEmpaque tbody tr");

    // Verificar que haya datos
    if (filasEmpaque.length <= 0 || registrosPaquetes.length <= 0) {
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

    // Preparar datos de EMPAQUE desde la tabla actual
    const empaquesData = [];
    filasEmpaque.forEach((fila) => {
        const lote = fila.querySelector('input[name="empaque[]"]');
        const peso = fila.querySelector('input[name="peso_caja[]"]');
        if (lote && peso) {
            empaquesData.push({
                lote_empaque: lote.value.trim(),
                tipo_caja: lote.getAttribute("data-tipo"),
                peso_caja: parseFloat(peso.value),
            });
        }
    });

    // Preparar datos de PAQUETES desde localStorage
    const paquetesData = [];
    registrosPaquetes.forEach((registro) => {
        paquetesData.push({
            lote_produccion: registro.lote_produccion,
            tipo_paquete: registro.tipo,
            peso_paquete: registro.peso_paquete,
            id_fritura: registro.id_fritura || null,
        });
    });

    const datos = {
        fecha_verificacion: document.getElementById("fecha").value,
        id_responsable: document.getElementById("responsableid").value,
        observaciones:
            document.getElementById("Observaciones").value ||
            "No hay Observaciones",
        empaques: empaquesData,
        paquetes: paquetesData,
    };

    console.log("Datos a enviar:", datos);

    try {
        const respuesta = await apiVerificacion.post("/crear", datos, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (respuesta.success) {
            // MOSTRAR ÉXITO Y LIMPIAR TODO PARA NUEVO REGISTRO
            Swal.fire({
                title: "¡Éxito!",
                text: "Verificación registrada correctamente",
                icon: "success",
                confirmButtonText: "Aceptar",
            });

            // LIMPIAR TODO para nueva verificación
            limpiarTodoParaNuevaVerificacion();
        } else {
            alerts.show(respuesta);
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message || "Error al enviar los datos",
            icon: "error",
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
    }
}

// Función para limpiar todo después de guardar
function limpiarTodoParaNuevaVerificacion() {
    console.log("Limpiando todo para nueva verificación...");

    // 1. Limpiar variables globales
    dataEmpaque.length = 0;
    dataPaquete.length = 0;

    // 2. Limpiar localStorage
    localStorage.removeItem(STORAGE_KEY);

    // 3. Limpiar tablas
    const tbodyEmpaque = document.querySelector("#tablaEmpaque tbody");
    const tbodyPaquetes = document.querySelector("#tablaPaquetes tbody");

    if (tbodyEmpaque) tbodyEmpaque.innerHTML = "";
    if (tbodyPaquetes) tbodyPaquetes.innerHTML = "";

    // 4. Resetear contadores
    document.querySelector("#conteoLotes").value = "0";
    document.querySelector("#conteoCajas").value = "0";
    document.querySelector("#conteoLotePaquete").value = "0";
    document.querySelector("#conteoPaquetes").value = "0";

    // 5. Limpiar campos del formulario principal
    document.getElementById("fecha").value = "";
    document.getElementById("responsablenombre").value = "";
    document.getElementById("responsableid").value = "";
    document.getElementById("Observaciones").value = "";

    // 6. Quitar clases de validación
    const campos = [
        "fecha",
        "responsablenombre",
        "responsableid",
        "idEncargo",
        "Observaciones",
    ];
    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.classList.remove("is-invalid", "is-valid");
        }
    });

    // 7. Limpiar modales
    limpiarModal();
    limpiarModalPaquete();

    // 8. Cerrar modales si están abiertos
    $("#registroInfoEmpaque").modal("hide");
    $("#registroInfoPaquetes").modal("hide");

    // 9. Actualizar encargo (si es necesario)
    encargo();

    console.log("Todo limpiado, listo para nueva verificación");
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

// Inicializar
init();
