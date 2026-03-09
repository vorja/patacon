import {
    ApiService,
    AlertManager,
    Url,
    fechaHoy,
} from "../../helpers/ApiUseManager.js";
import { AlertSystem } from "../../helpers/AlertasManger.js";

const apiAlistamiento = new ApiService(Url + "/data/alistamiento");
const apiProveedores = new ApiService(Url + "/data/recepcion");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");
const apiRecepcion = new ApiService(Url + "/data/recepcion"); 

const alerts = new AlertManager();
const token = document.querySelector('meta[name="jwt"]').getAttribute("content");

const rechazoPro = [];

// Constantes para almacenamiento
const STORAGE_KEY = "alistamiento_data";
const RECHAZO_STORAGE_KEY = "rechazo_proveedores_data";

// Variable global para almacenar los proveedores cargados
let proveedoresData = [];

// Función para obtener datos almacenados
const getStoredData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
};

// Función para guardar datos
const saveDataToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Función para obtener datos de rechazo almacenados
const getStoredRechazoData = () => {
    const stored = sessionStorage.getItem(RECHAZO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// Función para guardar datos de rechazo
const saveRechazoDataToStorage = (data) => {
    sessionStorage.setItem(RECHAZO_STORAGE_KEY, JSON.stringify(data));
};

// Función para limpiar datos almacenados
const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(RECHAZO_STORAGE_KEY);
};

// Función para obtener el proveedor completo (nombre + fecha) del option seleccionado
function obtenerProveedorCompleto() {
    const proveedorSelect = document.getElementById("listProveedores");
    const selectedOption =
        proveedorSelect.options[proveedorSelect.selectedIndex];

    if (selectedOption && selectedOption.value !== "") {
        return {
            textoCompleto: selectedOption.textContent,
            nombre: selectedOption.value,
            id: selectedOption.dataset.id,
            fecha: selectedOption.dataset.fecha || "",
            lote: selectedOption.dataset.lote || "",
            recepcionId: selectedOption.dataset.recepcion || "",
        };
    }
    return null;
}

// Función para comparar si dos proveedores son el mismo (mismo ID y misma recepción)
function sonProveedoresIguales(proveedor1, proveedor2) {
    if (!proveedor1 || !proveedor2) return false;

    // Comparar por ID de proveedor y ID de recepción (para diferenciar por fecha)
    return (
        proveedor1.id === proveedor2.id &&
        proveedor1.recepcionId === proveedor2.recepcionId
    );
}

// Función para cargar las cantidades asignadas de rechazo/maduro
function cargarCantidadesAsignadas(peladorId, proveedorInfo) {
    if (!proveedorInfo) return false;

    // Buscar si ya existe asignación para este pelador y proveedor específico
    const asignacionExistente = rechazoPro.find(
        (item) =>
            item.pelador === peladorId &&
            item.id_proveedor === proveedorInfo.id &&
            item.recepcion_id === proveedorInfo.recepcionId,
    );

    if (asignacionExistente) {
        // Si existe asignación, cargar los valores
        document.getElementById("cantidadRechazo").value =
            asignacionExistente.rechazo || 0;
        document.getElementById("cantidadMaduro").value =
            asignacionExistente.maduro || 0;

        // Actualizar totales
        updateTotalRechazo();
        updateTotalMaduro();

        return true;
    }

    return false;
}

// Función para actualizar totales de un pelador específico
function actualizarTotalesPelador(indice) {
    // Filtrar asignaciones para este pelador
    const asignacionesPelador = rechazoPro.filter(
        (item) => item.indexTable === indice,
    );

    // Calcular totales
    const totalRechazo = asignacionesPelador.reduce(
        (acc, item) => acc + Number(item.rechazo || 0),
        0,
    );
    const totalMaduro = asignacionesPelador.reduce(
        (acc, item) => acc + Number(item.maduro || 0),
        0,
    );

    // Actualizar en la tabla
    const tableRows = document.querySelector("#tabla-peladores tbody");
    const trSelection = tableRows.rows[indice];

    if (trSelection && trSelection.cells.length >= 6) {
        trSelection.cells[4].textContent = totalRechazo;
        trSelection.cells[5].textContent = totalMaduro;
    }

    // Actualizar en el datalist
    const peladorId = document.getElementById("idpelador").value;
    const optionPelador = document.querySelector(
        `option[data-id="${peladorId}"]`,
    );
    if (optionPelador) {
        optionPelador.setAttribute("data-rechazo", totalRechazo);
        optionPelador.setAttribute("data-maduro", totalMaduro);
    }

    // Actualizar totales generales
    updateTotalesTable();
}

// Función para mostrar resumen de asignaciones por proveedor
function mostrarResumenAsignaciones() {
    const resumenDiv =
        document.getElementById("resumenAsignaciones") || crearResumenDiv();

    if (rechazoPro.length === 0) {
        resumenDiv.innerHTML =
            '<p class="text-muted">No hay asignaciones de rechazo/maduro registradas.</p>';
        return;
    }

    let html = '<h6 class="mb-3">Asignaciones de Rechazo/Maduro:</h6>';
    const agrupado = {};

    // Agrupar por proveedor (incluyendo fecha)
    rechazoPro.forEach((asignacion) => {
        const key = `${asignacion.proveedor} (${asignacion.fecha || "Sin fecha"})`;
        if (!agrupado[key]) {
            agrupado[key] = [];
        }
        agrupado[key].push(asignacion);
    });

    // Generar HTML para cada proveedor
    Object.entries(agrupado).forEach(([proveedor, asignaciones]) => {
        html += `
            <div class="card mb-2">
                <div class="card-header py-2 bg-light">
                    <strong>${proveedor}</strong>
                </div>
                <div class="card-body py-2">
        `;

        asignaciones.forEach((asignacion) => {
            html += `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span>Pelador ID: ${asignacion.pelador}</span>
                    <span class="badge bg-danger">R: ${asignacion.rechazo}</span>
                    <span class="badge bg-warning text-dark">M: ${asignacion.maduro}</span>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    resumenDiv.innerHTML = html;
}

// Crear div para resumen si no existe
function crearResumenDiv() {
    const div = document.createElement("div");
    div.id = "resumenAsignaciones";
    div.className = "mt-4 p-3 border rounded";
    document.querySelector(".container").appendChild(div);
    return div;
}

// Variable para trackear el proveedor actualmente seleccionado
let proveedorActual = null;

const init = async () => {
    // Cargar datos almacenados si existen
    const storedData = getStoredData();
    const storedRechazoData = getStoredRechazoData();

    // Cargar datos de rechazo
    if (storedRechazoData.length > 0) {
        rechazoPro.push(...storedRechazoData);
        console.log("Datos de rechazo restaurados:", rechazoPro);
    }

    await encargo();
    await empleados();
    await respsonsables();
    await cargarProveedores();

    // Si hay datos almacenados, restaurarlos
    if (storedData) {
        await restoreStoredData(storedData);
    }

    document
        .getElementById("btnCloseModal")
        .addEventListener("click", limpiarInputs);

    document.getElementById("btnDetalle").addEventListener("click", () => {
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
                storeData();
            }
        });
    });

    // Agregar botón para limpiar datos manualmente
    addClearDataButton();

    // Mostrar notificación si hay datos pendientes
    if (storedData || rechazoPro.length > 0) {
        setTimeout(() => {
            Toastify({
                text: "Se han restaurado datos pendientes de guardar.",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50",
                stopOnFocus: true,
            }).showToast();
        }, 1000);
    }

    // Mostrar resumen de asignaciones
    mostrarResumenAsignaciones();
};

// Función para restaurar datos almacenados
async function restoreStoredData(data) {
    try {
        console.log("Restaurando datos almacenados...", data);

        // Restaurar totales
        if (data.totales) {
            document.getElementById("total").value = data.totales.total || 0;
            document.getElementById("rechazo").value =
                data.totales.rechazo || 0;
            document.getElementById("maduro").value = data.totales.maduro || 0;
            document.getElementById("conteo").value = data.totales.conteo || 0;
        }

        // Restaurar encargado si existe
        if (data.encargado && data.encargado.nombre) {
            document.getElementById("nombreEncargardo").value =
                data.encargado.nombre;
            document.getElementById("id_responsable").value = data.encargado.id;

            // Marcar como válido
            const input = document.getElementById("nombreEncargardo");
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }

        // Restaurar observaciones
        if (data.observaciones) {
            document.getElementById("Observaciones").value = data.observaciones;
        }

        // Restaurar recipientes desinfectados
        if (data.recipientes_desinf) {
            document.getElementById("recipientes_desinf").value =
                data.recipientes_desinf;

            // Marcar como válido
            const input = document.getElementById("recipientes_desinf");
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }

        // Restaurar tabla de peladores
        if (data.peladores && data.peladores.length > 0) {
            await restorePeladoresTable(data.peladores);
        }

        console.log("Datos restaurados exitosamente");
    } catch (error) {
        console.error("Error restaurando datos:", error);
    }
}

// Función para restaurar la tabla de peladores
async function restorePeladoresTable(peladoresData) {
    try {
        // Esperar a que se carguen los empleados
        await new Promise((resolve) => setTimeout(resolve, 500));

        peladoresData.forEach((pelador) => {
            // Buscar la fila correspondiente
            const filas = document.querySelectorAll(
                "#tabla-peladores tbody tr",
            );
            filas.forEach((fila) => {
                const nombreCelda = fila.cells[1];
                if (
                    nombreCelda &&
                    nombreCelda.textContent === pelador.pelador
                ) {
                    // Restaurar valores
                    fila.cells[2].textContent = pelador.cantidades || "0/0/0/0/0/0";
                    fila.cells[3].textContent = pelador.totales || 0;
                    fila.cells[4].textContent = pelador.rechazo || 0;
                    fila.cells[5].textContent = pelador.maduro || 0;

                    // Actualizar datalist
                    const option = document.querySelector(
                        `option[data-id="${pelador.id_pelador}"]`,
                    );
                    if (option) {
                        option.dataset.asignacion = pelador.cantidades || "0/0/0/0/0/0";
                        option.dataset.rechazo = pelador.rechazo || 0;
                        option.dataset.maduro = pelador.maduro || 0;
                    }
                }
            });
        });

        // Actualizar totales
        updateTotalesTable();
    } catch (error) {
        console.error("Error restaurando tabla de peladores:", error);
    }
}

document.getElementById("pelador").addEventListener("input", (e) => {
    const selectedOption = document.querySelector(
        `option[value="${e.target.value}"]`,
    );
    if (!selectedOption) {
        // Deshabilitamos y Limpiamos los campos de la modal.
        limpiarInputs();
        return;
    }

    // Quitamos el atributo disable para hablilitar la edicion o asignacion.
    for (let index = 0; index < 6; index++) {
        document.querySelector(`#cantidadDetalle${index + 1}`).removeAttribute("disabled");
    }

    document.getElementById("listProveedores").removeAttribute("disabled");

    let pelador = document.getElementById("idpelador");
    pelador.value = selectedOption.dataset.id;
    pelador.setAttribute("data-index-table", selectedOption.dataset.indexTable);
    pelador.setAttribute("data-asignacion", selectedOption.dataset.asignacion);

    const inputs = document.querySelectorAll(".inputCantidad");
    let asignadas = selectedOption.dataset.asignacion.split("/");

    inputs.forEach((input, index) => {
        input.value = asignadas[index] || 0;
    });

    // Cargar valores de rechazo/maduro del pelador (totales generales)
    const inputRechazo = document.querySelector(".inputCantidadRechazo");
    const inputMaduro = document.querySelector(".inputCantidadMaduro");

    inputRechazo.value = selectedOption.dataset.rechazo || 0;
    inputMaduro.value = selectedOption.dataset.maduro || 0;

    // actulizamos los campos.
    updateTotalDetalle();
    updateTotalMaduro();
    updateTotalRechazo();
    validarCanastillas();
});

document.getElementById("listProveedores").addEventListener("input", (e) => {
    const proveedorSelect = e.target;
    const nuevoProveedor = obtenerProveedorCompleto();

    if (!nuevoProveedor || nuevoProveedor.nombre === "") {
        document.getElementById("cantidadRechazo").setAttribute("disabled", true);
        document.getElementById("cantidadMaduro").setAttribute("disabled", true);
        document.getElementById("btnInfoProve").setAttribute("disabled", true);
        proveedorActual = null;
        return;
    }

    // Si cambiamos a un proveedor diferente, limpiar los inputs
    if (
        proveedorActual &&
        !sonProveedoresIguales(proveedorActual, nuevoProveedor)
    ) {
        limpiarInputsProveedor();
    }

    proveedorActual = nuevoProveedor;

    const peladorId = document.getElementById("idpelador").value;

    // Habilitar campos
    document.getElementById("cantidadRechazo").removeAttribute("disabled");
    document.getElementById("cantidadMaduro").removeAttribute("disabled");
    document.getElementById("btnInfoProve").removeAttribute("disabled");

    // Cambiar texto del botón según si ya existe asignación
    const btnInfoProve = document.getElementById("btnInfoProve");
    const asignacionExistente = rechazoPro.find(
        (item) =>
            item.pelador === peladorId &&
            item.id_proveedor === nuevoProveedor.id &&
            item.recepcion_id === nuevoProveedor.recepcionId,
    );

    if (asignacionExistente) {
        btnInfoProve.textContent = "Actualizar Asignación";
        btnInfoProve.classList.remove("btn-primary");
        btnInfoProve.classList.add("btn-warning");

        // Cargar cantidades asignadas si existen
        cargarCantidadesAsignadas(peladorId, nuevoProveedor);
    } else {
        btnInfoProve.textContent = "Asignar";
        btnInfoProve.classList.remove("btn-warning");
        btnInfoProve.classList.add("btn-primary");

        // Limpiar los inputs si es un proveedor nuevo
        document.getElementById("cantidadRechazo").value = 0;
        document.getElementById("cantidadMaduro").value = 0;
        updateTotalRechazo();
        updateTotalMaduro();
    }
});

document.getElementById("btnInfoProve").addEventListener("click", async (e) => {
    const proveedorInfo = obtenerProveedorCompleto();

    if (!proveedorInfo || proveedorInfo.nombre === "") {
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, seleccione un proveedor válido.",
        });
        return;
    }

    const peladorId = document.getElementById("idpelador");
    const indice = peladorId.getAttribute("data-index-table");
    const totalRechazo = parseFloat(document.getElementById("totalRechazo").value.trim()) || 0;
    const totalMaduro = parseFloat(document.getElementById("totalMaduro").value.trim()) || 0;

    // Verificar si ya existe asignación para este pelador y proveedor específico
    const indexExistente = rechazoPro.findIndex(
        (item) =>
            item.proveedor === proveedorInfo.nombre &&
            item.id_proveedor === proveedorInfo.id &&
            item.recepcion_id === proveedorInfo.recepcionId &&
            item.indexTable === indice,
    );

    const esActualizacion = indexExistente !== -1;
    const titulo = esActualizacion? "¿Actualizar asignación?": "¿Estás seguro?";
    const texto = esActualizacion? "¡Se actualizará la información del proveedor!": "¡Se asignará está información al proveedor sin vuelta atrás!";
    const textoConfirmacion = esActualizacion? "Sí, Actualizar": "Sí, Asignar";

    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: textoConfirmacion,
        cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
        title: "Procesando Información...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    // Crear o actualizar el objeto de asignación
    const asignacion = {
        proveedor: proveedorInfo.nombre,
        id_proveedor: proveedorInfo.id,
        recepcion_id: proveedorInfo.recepcionId,
        fecha: proveedorInfo.fecha,
        pelador: peladorId.value,
        indexTable: indice,
        maduro: totalMaduro,
        rechazo: totalRechazo,
        fecha_asignacion: fechaHoy,
    };

    if (esActualizacion) {
        // Actualizar asignación existente
        rechazoPro[indexExistente] = asignacion;
    } else {
        // Agregar nueva asignación
        rechazoPro.push(asignacion);
    }

    // Guardar rechazoPro en sessionStorage
    saveRechazoDataToStorage(rechazoPro);

    Swal.close();

    await Swal.fire({
        icon: "success",
        title: esActualizacion? "Información Actualizada": "Información Asignada",
        html: `Se ha ${esActualizacion ? "actualizado" : "asignado"} la información del proveedor:<br>
               <p class="badge text-danger fw-bold fs-5">${proveedorInfo.textoCompleto}</p>
               <br>Rechazo: <strong>${totalRechazo}</strong> | Maduro: <strong>${totalMaduro}</strong>`,
        timer: 1200,
        showConfirmButton: false,
    });

    console.log("acumulado Prov: ", rechazoPro);

    // Actualizar la tabla de peladores con los totales
    actualizarTotalesPelador(indice);

    // Mostrar resumen actualizado
    mostrarResumenAsignaciones();

    limpiarInputsProveedor();
    proveedorActual = null;
});

function limpiarInputsProveedor() {
    document.getElementById("btnInfoProve").setAttribute("disabled", true);
    document.getElementById("btnInfoProve").textContent = "Asignar";
    document.getElementById("btnInfoProve").classList.remove("btn-warning");
    document.getElementById("btnInfoProve").classList.add("btn-primary");

    const cantidadRechazo = document.querySelector(`#cantidadRechazo`);
    const cantidadMaduro = document.querySelector(`#cantidadMaduro`);
    const totalRecahazo = document.getElementById("totalRechazo");
    const totalMaduro = document.getElementById("totalMaduro");
    const selectProveedor = document.getElementById("listProveedores");

    // No reiniciar el select, solo los valores de rechazo/maduro
    cantidadRechazo.value = 0;
    cantidadMaduro.value = 0;
    totalRecahazo.value = 0;
    totalMaduro.value = 0;
    cantidadRechazo.setAttribute("disabled", true);
    cantidadMaduro.setAttribute("disabled", true);
}

function limpiarInputs() {
    const cortadorName = (document.getElementById("pelador").value = "");
    const cantidadRechazo = document.querySelector(`#cantidadRechazo`);
    const cantidadMaduro = document.querySelector(`#cantidadMaduro`);
    const totalcortes = (document.getElementById("totalcortes").value = 0);
    const totalRecahazo = (document.getElementById("totalRechazo").value = 0);
    const totalMaduro = (document.getElementById("totalMaduro").value = 0);

    const selectProveedor = document.getElementById("listProveedores");
    selectProveedor.setAttribute("disabled", true);
    selectProveedor.selectedIndex = 0;

    document.getElementById("btnInfoProve").setAttribute("disabled", true);
    document.getElementById("btnInfoProve").textContent = "Asignar";
    document.getElementById("btnInfoProve").classList.remove("btn-warning");
    document.getElementById("btnInfoProve").classList.add("btn-primary");

    for (let index = 0; index < 6; index++) {
        let elemento = document.querySelector(`#cantidadDetalle${index + 1}`);
        elemento.value = 0;
        elemento.setAttribute("disabled", true);
        elemento.classList.remove("is-invalid", "is-valid");
    }
    cantidadRechazo.value = 0;
    cantidadMaduro.value = 0;
    cantidadRechazo.setAttribute("disabled", true);
    cantidadMaduro.setAttribute("disabled", true);

    proveedorActual = null;
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

function validarCanastillas() {
    let totalDetalle = parseInt(document.getElementById("totalcortes").value.trim()) || 0;
    let btnGuardarInfo = document.getElementById("btnDetalle");
    let limite = parseInt(document.getElementById("limite").value.trim()) || 0;
    let totalGeneral = parseInt(document.getElementById("total").value.trim()) || 0;

    const indice = document.getElementById("idpelador").getAttribute("data-index-table");
    const fila = document.querySelector(`#tabla-peladores tbody tr:nth-child(${parseInt(indice) + 1})`,);

    const valorAnteriorFila = fila? parseInt(fila.cells[3].textContent) || 0: 0;

    const totalAjustado = totalGeneral - valorAnteriorFila + totalDetalle;

    if (totalDetalle > limite) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Las cantidades no deben sobrepasar el límite de canastillas.",
        });
        btnGuardarInfo.setAttribute("disabled", "");
        return false;
    }

    if (totalAjustado > limite) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Está sobrepasando el límite de canastillas asignadas.",
        });
        btnGuardarInfo.setAttribute("disabled", "");
        return false;
    }

    btnGuardarInfo.removeAttribute("disabled");
    return true;
}

let resta = false;
let valorRestar = 0;

function limiteCanastillas() {
    let total = 0;
    let totalSinRedondear = 0;
    let inputs = document.querySelectorAll('input[name="cantidad[]"]');
    let limite = document.querySelector("#limite");
    let redondeos = 0;

    inputs.forEach((input) => {
        const value = parseFloat(input.value.trim());
        if (!isNaN(value)) {
            totalSinRedondear += value;
            const redondeado = Math.round(value);
            total += redondeado;

            // Si el valor redondeado es mayor que el original, hubo redondeo hacia arriba
            if (redondeado > value) {
                redondeos++;
            }
        }
    });

    limite.value = Math.round(total);

    // Actualizar variables globales
    valorRestar = redondeos;
    resta = redondeos > 0;

    console.log(`Redondeos hacia arriba: ${redondeos}`);
    console.log(
        `Total sin redondear: ${totalSinRedondear}, Total redondeado: ${total}, Diferencia: ${total - totalSinRedondear}`,
    );

    return redondeos;
}

function validarNumeroNegativo(inputElement) {
    const valor = parseFloat(inputElement.value); // Convierte el valor a número

    if (isNaN(valor)) {
        // Si no es un número (NaN)
        inputElement.classList.add("is-invalid");
        inputElement.value = "";
        return;
    }

    if (valor < 0) {
        // Si el valor es negativo
        inputElement.classList.add("is-invalid");
        inputElement.value = "";
        return;
    }

    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");
}

function obtenerProveedores() {
    let proveedores = document.querySelectorAll('input[name="id_proveedor[]"]');
    let datos = [];

    for (let i = 0; i < proveedores.length; i++) {
        let index = i + 1;
        let id = proveedores[i].value;
        let recepcionId = proveedores[i].getAttribute("data-recepcion");

        const proveedorData = proveedoresData.find(
            (p) => p.id == recepcionId && p.id_proveedor == id,
        );

        // 🔴 LOG PARA VER QUÉ ESTÁ TRAYENDO
        console.log("Proveedor encontrado en obtenerProveedores:", {
            id_proveedor: id,
            recepcionId: recepcionId,
            proveedorData: proveedorData,
            cantidad_usada: proveedorData? proveedorData.cantidad: "no encontrado",
            canastillas_usadas: proveedorData ? proveedorData.cantidad / 20 : 0,
        });

        const resultado = rechazoPro.filter(
            (item) =>
                item.id_proveedor === id && item.recepcion_id === recepcionId,
        );

        const totalRechazo = resultado.reduce(
            (acc, item) => acc + Number(item.rechazo || 0),
            0,
        );

        const totalMaduro = resultado.reduce(
            (acc, d) => acc + Number(d.maduro || 0),
            0,
        );

        datos.push({
            id_proveedor: id,
            cantidad: proveedorData ? proveedorData.cantidad / 20 : 0,
            id_recepcion: parseInt(recepcionId),
            lote_proveedor: proveedores[i].getAttribute("data-lote"),
            producto: proveedores[i].getAttribute("data-producto"),
            materia: proveedorData ? proveedorData.cantidad : 0,
            rechazo: parseFloat(totalRechazo || 0),
            maduro: parseFloat(totalMaduro || 0),
        });
    }

    // 🔴 LOG DE LO QUE SE VA A ENVIAR
    console.log("📤 Datos a enviar en proveedores:", datos);

    return datos;
}

function obtenerAsiganciones() {
    const totalCells = document.querySelectorAll("#tabla-peladores tbody tr");
    let contador = 0;

    if (totalCells.length == 0) {
        return 0;
    }

    // validamos que al menos 1 o más peladores tenga canastillas asginadas.
    totalCells.forEach((row) => {
        let valor = 0;
        const cells = row.cells;
        if (cells.length == 0) return;
        valor = parseInt(cells[2].textContent);

        if (valor > 0) {
            contador++;
        }
    });

    if (contador == 0) {
        return false;
    }
    const detalles = [];
    totalCells.forEach((row, index) => {
        const cells = row.cells;
        if (cells.length == 0) return;
        const detalle = {};
        detalle["pelador"] = cells[1].textContent;
        detalle["cantidades"] = cells[3].textContent;
        detalle["totales"] = cells[2].textContent;
        detalle["rechazo"] = cells[4].textContent;
        detalle["maduro"] = cells[5].textContent;
        detalle["id_pelador"] = cells[1].getAttribute("data-id");
        detalles.push(detalle);
    });

    return detalles;
}

function obtenerRecepciones() {
    return recepcionesIds;;
}

// Función para obtener datos de peladores de la tabla (para almacenamiento)
function obtenerDatosPeladores() {
    const detalles = [];
    const rows = document.querySelectorAll("#tabla-peladores tbody tr");

    rows.forEach((row) => {
        const cells = row.cells;
        if (cells.length < 6) return;

        const detalle = {
            pelador: cells[1].textContent,
            cantidades: cells[2].textContent,
            totales: cells[3].textContent,
            rechazo: cells[4].textContent,
            maduro: cells[5].textContent,
            id_pelador: cells[1].getAttribute("data-id"),
        };
        detalles.push(detalle);
    });

    return detalles;
}

// Función para guardar el estado actual en localStorage
function saveCurrentState() {
    try {
        const data = {
            fecha: fechaHoy,
            totales: {
                total: document.getElementById("total").value,
                rechazo: document.getElementById("rechazo").value,
                maduro: document.getElementById("maduro").value,
                conteo: document.getElementById("conteo").value,
            },
            encargado: {
                nombre: document.getElementById("nombreEncargardo").value,
                id: document.getElementById("id_responsable").value,
            },
            observaciones: document.getElementById("Observaciones").value,
            recipientes_desinf:
                document.getElementById("recipientes_desinf").value,
            peladores: obtenerDatosPeladores(),
            timestamp: new Date().toISOString(),
        };

        saveDataToStorage(data);
        console.log("Estado guardado en localStorage");
    } catch (error) {
        console.error("Error guardando estado:", error);
    }
}

// Función para actualizar totales de la tabla
function updateTotalesTable() {
    let totalgeneral = 0;
    let totalgeneralRechazo = 0;
    let totalGeneralMaduro = 0;

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(4)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalgeneral += isNaN(n) ? 0 : n;
        });

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(5)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalgeneralRechazo += isNaN(n) ? 0 : n;
        });

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(6)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalGeneralMaduro += isNaN(n) ? 0 : n;
        });

    document.getElementById("total").value = totalgeneral;
    document.getElementById("rechazo").value = totalgeneralRechazo;
    document.getElementById("maduro").value = totalGeneralMaduro;
    document.getElementById("conteo").value = totalgeneral;
}

function storeData() {
    let limite = parseInt(document.getElementById("limite").value.trim()) || 0;
    let total = parseInt(document.getElementById("total").value.trim()) || 0;
    const peladorId = document.getElementById("idpelador");
    const pelador = document.getElementById("pelador");
    if (peladorId.value === "" || pelador.value === "") {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, ingresar los datos requeridos en la asignación del pelador.",
        });
        limpiarInputs();
        return;
    }

    const cantidad1 = document.getElementById("cantidadDetalle1").value;
    const cantidad2 = document.getElementById("cantidadDetalle2").value;
    const cantidad3 = document.getElementById("cantidadDetalle3").value;
    const cantidad4 = document.getElementById("cantidadDetalle4").value;
    const cantidad5 = document.getElementById("cantidadDetalle5").value;
    const cantidad6 = document.getElementById("cantidadDetalle6").value;

    const totalcortes = parseInt(document.getElementById("totalcortes").value.trim()) || 0;
    const indice = peladorId.getAttribute("data-index-table");
    const fila = document.querySelector(`#tabla-peladores tbody tr:nth-child(${parseInt(indice) + 1})`,);
    const valorAnteriorFila = fila? parseInt(fila.cells[3].textContent) || 0: 0;

    const totalAjustado = total - valorAnteriorFila + totalcortes;

    if (totalcortes > limite) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Las cantidades no deben sobrepasar el límite de canastillas.",
        });

        return false;
    }

    if (totalAjustado > limite) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Está sobrepasando el límite de canastillas asignadas.",
        });

        return false;
    }

    if (rechazoPro.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Debe Asignarle alguna información, a proveedor(es).",
        });

        return false;
    }

    const resultado = rechazoPro.filter((item) => item.indexTable === indice);
    //
    console.log(resultado);

    const totalRechazo = resultado.reduce(
        (acc, item) => acc + Number(item.rechazo || 0),
        0,
    );

    const totalMaduro = resultado.reduce(
        (acc, d) => acc + Number(d.maduro || 0),
        0,
    );

    const tableRows = document.querySelector("#tabla-peladores tbody");
    const trSelection = tableRows.rows[indice];

    // Actualizamos asignación
    let asignadas = peladorId.getAttribute("data-asignacion").split("/");
    asignadas[0] = cantidad1;
    asignadas[1] = cantidad2;
    asignadas[2] = cantidad3;
    asignadas[3] = cantidad4;
    asignadas[4] = cantidad5;
    asignadas[5] = cantidad6;

    const canastillas = asignadas.join("/");
    const optionPelador = document.querySelector(`option[data-id="${peladorId.value}"]`,);

    optionPelador.setAttribute("data-asignacion", canastillas);
    optionPelador.setAttribute("data-rechazo", totalRechazo);
    optionPelador.setAttribute("data-maduro", totalMaduro);

    trSelection.cells[2].textContent = canastillas;
    trSelection.cells[3].textContent = totalcortes;
    trSelection.cells[4].textContent = totalRechazo;
    trSelection.cells[5].textContent = totalMaduro;

    let totalgeneral = 0;
    let totalgeneralRechazo = 0;
    let totalGeneralMaduro = 0;

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(4)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalgeneral += isNaN(n) ? 0 : n;
        });

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(5)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalgeneralRechazo += isNaN(n) ? 0 : n;
        });

    document
        .querySelectorAll("#tabla-peladores tbody tr td:nth-child(6)")
        .forEach((cell) => {
            const n = parseFloat(cell.textContent);
            totalGeneralMaduro += isNaN(n) ? 0 : n;
        });

    document.getElementById("total").value = totalgeneral;
    document.getElementById("rechazo").value = totalgeneralRechazo;
    document.getElementById("maduro").value = totalGeneralMaduro;
    document.getElementById("conteo").value = totalgeneral;

    // Guardar datos en localStorage después de actualizar
    saveCurrentState();

    Swal.fire({
        title: "Correcto",
        html: `Información de Pelador Asignada Correctamente :<p class="badge fw-bold fs-5" style="color: #074c8dff" >${pelador.value}</p> `,
        icon: "success",
        timer: 800,
        showConfirmButton: false,
    });
    limpiarInputs();
}

const cantidadInputsDetalle = Array.from(
    document.querySelectorAll('input[id^="cantidad"]'),
).filter((input) => /^cantidadDetalle[1-6]$/.test(input.id));

// Recalcular y validar en tiempo real
cantidadInputsDetalle.forEach((input) => {
    input.addEventListener("input", () => {
        updateTotalDetalle();
        validarCanastillas();
        validarNumeroNegativo(input);
    });
});

document.querySelector("#cantidadRechazo").addEventListener("input", updateTotalRechazo);

document.querySelector("#cantidadMaduro").addEventListener("input", updateTotalMaduro);

function updateTotalDetalle() {
    let total = 0;
    cantidadInputsDetalle.forEach((input) => {
        let value = parseFloat(input.value);
        if (value < 0) {
            value = 0;
        }
        total += isNaN(value) ? 0 : value;
    });
    document.getElementById("totalcortes").value = total;
}

function updateTotalRechazo() {
    let total = 0;
    let rechazo = document.getElementById("cantidadRechazo");
    if (!rechazo) {
        return false;
    }
    total = isNaN(parseFloat(rechazo.value)) ? 0 : parseFloat(rechazo.value);
    document.getElementById("totalRechazo").value = total;
}

function updateTotalMaduro() {
    let total = 0;
    let rechazo = document.getElementById("cantidadMaduro");
    if (!rechazo) {
        return false;
    }
    total = isNaN(parseFloat(rechazo.value)) ? 0 : parseFloat(rechazo.value);
    document.getElementById("totalMaduro").value = total;
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
            `option[value="${e.target.value}"]`,
        );
        if (selectedOption) {
            document.getElementById(idFieldId).value =
                selectedOption.dataset.id;
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

const guardarRegistroButton = document.querySelector('button[type="submit"]');

guardarRegistroButton.addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Enviar información.",
    }).then(async (result) => {
        if (result.isConfirmed) {

            let limite = parseFloat(document.getElementById("limite").value)-valorRestar;
            const dataProveedores = obtenerProveedores();
            const dataRecepciones = obtenerRecepciones();
            const dataDetalle = obtenerAsiganciones();

            if (!dataDetalle || dataDetalle.length == 0 || dataDetalle == 0) {
                Swal.fire({
                    title: "¡Error!",
                    text: "Por favor, asigne las canastillas a los peladores.",
                    icon: "error",
                    showConfirmButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                });
                return;
            }

            const principalData = {
                fecha: fechaHoy,
                maduro: parseFloat(document.getElementById("maduro").value),
                rechazo: parseFloat(document.getElementById("rechazo").value),
                recipientes_desinf: document.getElementById("recipientes_desinf").value,
                orden: document.getElementById("idEncargo").value,
                id_responsable: document.getElementById("id_responsable").value,
                total: document.getElementById("total").value,
                observaciones: document.getElementById("Observaciones").value || "No hay Observaciones",
                proveedores: dataProveedores,
                detalles: dataDetalle,
                recepciones: dataRecepciones,
            };

            // Validate principalData
            const camposObligatorios = [
                "nombreEncargardo",
                "id_responsable",
                "maduro",
                "rechazo",
                "recipientes_desinf",
                "total",
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

            if (Number(principalData.total) === 0 || !principalData.total) {
                Swal.fire({
                    title: "¡Error!",
                    text: "No hay Información de Canastillas asignadas.",
                    icon: "error",
                    showConfirmButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                });
                return;
            }

            // MODIFICACIÓN AQUÍ: Verificar si el total es menor que el límite
            if (Number(principalData.total) < limite) {
                // Mostrar modal de confirmación
                const confirmacion = await Swal.fire({
                    title: "¡Atención!",
                    html: `
                        <div class="text-center">
                            <i class="fa-solid fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                            <h5>No todas las canastillas fueron asignadas</h5>
                            <p>Total asignado: <strong>${principalData.total}</strong> de <strong>${limite}</strong> canastillas</p>
                            <p class="text-danger">Restan: <strong>${limite - principalData.total}</strong> canastillas</p>
                            <p>¿Desea asignarlas o crear un registro para el día siguiente?</p>
                        </div>
                    `,
                    icon: "warning",
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Asignar Ahora",
                    denyButtonText: "Crear para Mañana",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#3085d6",
                    denyButtonColor: "#28a745",
                    cancelButtonColor: "#d33",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });

                if (confirmacion.isConfirmed) {
                    // Si elige asignar ahora, mostrar mensaje y no proceder
                    Swal.fire({
                        title: "Continuar asignación",
                        text: "Por favor, asigne las canastillas restantes antes de guardar.",
                        icon: "info",
                        confirmButtonColor: "#3085d6",
                    });
                    return;
                } else if (confirmacion.isDenied) {
                    // Si elige crear para mañana, abrir modal con formulario
                    await mostrarModalCrearParaManana(principalData);
                    return;
                } else {
                    // Si cancela, no hacer nada
                    return;
                }
            }

            // Si pasa todas las validaciones, continuar con el envío normal
            const cleanedData = removeEmptyFields(principalData);

            // Mostrar loading mientras se envía
            Swal.fire({
                title: "Enviando información...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            
            const response = await apiAlistamiento.post("/crear", cleanedData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });
            
            console.log("lo que se esta creando : ",cleanedData)

            Swal.close();

            if (!response.success) {
                alerts.show(response);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Limpiar datos almacenados al enviar exitosamente
                clearStoredData();
                alerts.show(response);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    });
});

// ============================================================
// FUNCIONES PARA EL MODAL DE CREAR REGISTRO PARA MAÑANA
// ============================================================

// Función para obtener proveedores del formulario actual
function obtenerProveedoresDelFormulario() {
    // Usar los datos de proveedoresData que se cargan en cargarProveedores()
    if (proveedoresData && proveedoresData.length > 0) {
        return proveedoresData;
    }

    // Si no están disponibles en proveedoresData, intentar obtenerlos de los inputs
    const proveedores = [];
    const proveedoresInputs = document.querySelectorAll('input[name="id_proveedor[]"]',);

    proveedoresInputs.forEach((input, index) => {
        const nombreInput = document.querySelector(`#proveedor_${index + 1}`);
        const cantidadInput = document.querySelector(`#cantidad_${index + 1}`);
        const producto = input.getAttribute("data-producto");
        const lote = input.getAttribute("data-lote");

        if (nombreInput && cantidadInput) {
            const cantidad = parseFloat(cantidadInput.getAttribute("data-canastillas")) || 0;
            const materia = parseFloat(cantidadInput.getAttribute("data-kg")) || 0;

            proveedores.push({
                id: input.getAttribute("data-recepcion"),
                id_proveedor: input.value,
                fecha: fechaHoy,
                fecha_procesamiento: fechaHoy,
                lote: lote,
                cantidad: materia,
                producto: producto,
                proveedor: nombreInput.value,
                canastillas: cantidad,
            });
        }
    });

    return proveedores;
}

// ============================================================
// FUNCIÓN MODIFICADA: Mostrar modal de creación para el día siguiente
// ============================================================
async function mostrarModalCrearParaManana(principalData) {
    // Obtener proveedores del formulario actual
    const proveedores = obtenerProveedoresDelFormulario();

    if (proveedores.length === 0) {
        Swal.fire({
            title: "Error",
            text: "No hay proveedores disponibles en el formulario actual",
            icon: "error",
            confirmButtonColor: "#3085d6",
        });
        return;
    }

    // Calcular cantidad de canastillas restantes
    const limite = parseFloat(document.getElementById("limite").value) - valorRestar;
    const total = parseFloat(principalData.total);
    const canastillasRestantes = limite - total;
    const kgRestantes = canastillasRestantes * 20;

    // Crear HTML del modal
    const { value: formValues } = await Swal.fire({
        title: "Crear Registro para el Día Siguiente",
        html: `
            <div class="container-fluid">
                <div class="mb-3">
                    <label for="swal-fecha" class="form-label">Fecha para el día siguiente *</label>
                    <input type="date" id="swal-fecha" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="swal-id_proveedor" class="form-label">Proveedor con Sobrantes *</label>
                    <select id="swal-id_proveedor" class="form-select" required>
                        <option value="">Seleccionar proveedor</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="swal-fecha_procesamiento" class="form-label">Fecha de Procesamiento *</label>
                    <input type="date" id="swal-fecha_procesamiento" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="swal-producto" class="form-label">Producto *</label>
                    <input type="text" id="swal-producto" class="form-control" required>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="swal-cantidad" class="form-label">Cantidad (Kg) *</label>
                        <input type="number" id="swal-cantidad" class="form-control" step="0.01" required 
                               value="${kgRestantes}">
                        <small class="text-muted">Equivalente a ${canastillasRestantes} canastillas (20 kg/canastilla)</small>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="swal-materia_recep" class="form-label">Materia Prima (Kg) *</label>
                        <input type="number" id="swal-materia_recep" class="form-control" step="0.01" required 
                               value="${kgRestantes}" readonly>
                        <small class="text-muted">Mismo valor que Cantidad (requerido por el sistema)</small>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="swal-canastillas" class="form-label">Canastillas (solo referencia)</label>
                    <input type="text" id="swal-canastillas" class="form-control" 
                           value="${canastillasRestantes}" readonly>
                </div>
                <div class="mb-3">
                    <label for="swal-lote" class="form-label">Lote de Producción *</label>
                    <input type="text" id="swal-lote" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="swal-cant_defectos" class="form-label">Cantidad de Defectos</label>
                    <input type="number" id="swal-cant_defectos" class="form-control" value="0">
                </div>
                <div class="mb-3">
                    <label for="swal-id_responsable" class="form-label">Responsable *</label>
                    <select id="swal-id_responsable" class="form-select" required>
                        <option value="">Seleccionar responsable</option>
                    </select>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="form-check">
                            <input type="checkbox" id="swal-color" class="form-check-input">
                            <label for="swal-color" class="form-check-label">Color</label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check">
                            <input type="checkbox" id="swal-olor" class="form-check-input">
                            <label for="swal-olor" class="form-check-label">Olor</label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-check">
                            <input type="checkbox" id="swal-estado_fisico" class="form-check-input">
                            <label for="swal-estado_fisico" class="form-check-label">Estado Físico</label>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input type="checkbox" id="swal-cumple" class="form-check-input" checked>
                        <label for="swal-cumple" class="form-check-label">Cumple con especificaciones</label>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="swal-observaciones" class="form-label">Observaciones</label>
                    <textarea id="swal-observaciones" class="form-control" rows="3">Canastillas restantes del día anterior</textarea>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Crear Registro",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        width: "800px",
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: () => {
            // Validar campos antes de enviar
            const fecha = document.getElementById("swal-fecha").value;
            const id_proveedor = document.getElementById("swal-id_proveedor").value;
            const fecha_procesamiento = document.getElementById("swal-fecha_procesamiento").value;
            const producto = document.getElementById("swal-producto").value;
            const cantidad = document.getElementById("swal-cantidad").value;
            const materia_recep = document.getElementById("swal-materia_recep").value;
            const lote = document.getElementById("swal-lote").value;
            const id_responsable = document.getElementById("swal-id_responsable").value;

            if (!fecha || !id_proveedor || !fecha_procesamiento || !producto || !cantidad || !materia_recep || !lote || !id_responsable) {
                Swal.showValidationMessage("Por favor complete todos los campos obligatorios (*)");
                return false;
            }

            if (parseFloat(cantidad) !== parseFloat(materia_recep)) {
                Swal.showValidationMessage("Los campos Cantidad y Materia Prima deben tener el mismo valor");
                return false;
            }

            const select = document.getElementById("swal-id_proveedor");
            const selectedOption = select.options[select.selectedIndex];
            
            return {
                fecha,
                id_proveedor,
                fecha_procesamiento,
                producto,
                cantidad: cantidad,
                materia_recep: materia_recep,
                lote,
                cant_defectos: document.getElementById("swal-cant_defectos").value || 0,
                id_responsable,
                color: document.getElementById("swal-color").checked ? "Si" : "No",
                olor: document.getElementById("swal-olor").checked ? "Si" : "No",
                estado_fisico: document.getElementById("swal-estado_fisico").checked ? "En condiciones" : "Mal estado",
                cumple: document.getElementById("swal-cumple").checked ? "Si Cumple" : "No Cumple",
                orden: document.getElementById("idEncargo").value,
                observaciones: document.getElementById("swal-observaciones").value || "Canastillas restantes del día anterior",
                proveedor_info: {
                    nombre: selectedOption.textContent,
                    recepcion_id: selectedOption.getAttribute("data-recepcion"),
                    lote_original: selectedOption.getAttribute("data-lote"),
                    producto_original: selectedOption.getAttribute("data-producto"),
                    canastillas: cantidad / 20
                }
            };
        },
        didOpen: async () => {
            cargarProveedoresSwal(proveedores);
            await cargarResponsablesSwal();

            const tomorrow = new Date(fechaHoy);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];
            document.getElementById("swal-fecha").value = tomorrowStr;
            document.getElementById("swal-fecha_procesamiento").value = fechaHoy;

            const cantidadInput = document.getElementById("swal-cantidad");
            const materiaInput = document.getElementById("swal-materia_recep");
            const canastillasInput = document.getElementById("swal-canastillas");
            
            cantidadInput.addEventListener("input", function() {
                const kg = parseFloat(this.value) || 0;
                materiaInput.value = kg;
                const canastillas = kg / 20;
                canastillasInput.value = canastillas.toFixed(2);
            });

            document.getElementById("swal-color").checked = true;
            document.getElementById("swal-olor").checked = true;
            document.getElementById("swal-estado_fisico").checked = true;
            document.getElementById("swal-cumple").checked = true;
        },
    });

    if (formValues) {
        Swal.fire({
            title: "Creando registro para mañana...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await apiRecepcion.post("/crear/sobrante", formValues, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            Swal.close();

            if (!response.success) {
                Swal.fire({
                    title: "Error",
                    text: "No se pudo crear el registro para mañana",
                    icon: "error",
                    confirmButtonColor: "#3085d6",
                });
                alerts.show(response);
            } else {
                await restarSobrantesDeProveedorEspecifico(formValues);

                Swal.fire({
                    title: "¡Éxito!",
                    html: `
                        <div class="text-center">
                            <i class="fa-solid fa-check-circle text-success fa-3x mb-3"></i>
                            <p>Registro creado exitosamente para el día siguiente</p>
                            <p class="text-muted">Proveedor: <strong>${formValues.proveedor_info.nombre}</strong></p>
                            <p class="text-muted">Cantidad registrada: <strong>${formValues.cantidad}</strong> kg</p>
                            <p class="text-muted">Materia Prima: <strong>${formValues.materia_recep}</strong> kg</p>
                            <p class="text-muted">Equivalente a: <strong>${formValues.cantidad / 20}</strong> canastillas</p>
                        </div>
                    `,
                    icon: "success",
                    confirmButtonColor: "#28a745",
                });

                // Simplemente usar proveedoresData que ya está actualizado
                const principalDataActualizado = {
                    ...principalData,
                    proveedores: obtenerProveedores(), // Esto ahora usará proveedoresData actualizado
                };
                console.log(
                    "📤 Enviando registro actual con datos actualizados:",
                    principalDataActualizado,
                );

                Swal.fire({
                    title: "Enviando registro actual...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });

                const responseActual = await apiAlistamiento.post(
                    "/crear",
                    principalDataActualizado,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                    },
                );

                Swal.close();

                if (!responseActual.success) {
                    alerts.show(responseActual);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    clearStoredData();
                    alerts.show(responseActual);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Ocurrió un error al crear el registro",
                icon: "error",
                confirmButtonColor: "#3085d6",
            });
            console.error("Error creando registro:", error);
        }
    }
}

// ============================================================
// FUNCIÓN MODIFICADA: Cargar proveedores en el modal con datos completos
// ============================================================
function cargarProveedoresSwal(proveedores) {
    const select = document.getElementById("swal-id_proveedor");
    select.innerHTML = '<option value="">Seleccionar proveedor con sobrantes</option>';

    proveedores.forEach((proveedor, index) => {
        const option = document.createElement("option");
        option.value = proveedor.id_proveedor;
        option.textContent = `${proveedor.proveedor} - ${proveedor.producto || 'Producto'} (${proveedor.lote || 'Sin lote'}) - ${proveedor.cantidad} Kg`;
        
        // Agregar datos adicionales como atributos
        option.setAttribute("data-recepcion", proveedor.id);
        option.setAttribute("data-producto", proveedor.producto || "");
        option.setAttribute("data-lote", proveedor.lote || "");
        option.setAttribute("data-cantidad", proveedor.cantidad);
        option.setAttribute("data-canastillas", proveedor.canastillas || (proveedor.cantidad / 20));
        
        select.appendChild(option);
    });

    // Event listener para autocompletar cuando se selecciona un proveedor
    select.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.value !== "") {
            // Autocompletar producto y lote
            const producto = selectedOption.getAttribute("data-producto");
            const lote = selectedOption.getAttribute("data-lote");
            const cantidad = selectedOption.getAttribute("data-cantidad");
            const canastillas = selectedOption.getAttribute("data-canastillas");

            if (producto) {
                document.getElementById("swal-producto").value = producto;
            }
            
            // Generar nuevo lote para mañana basado en el lote original
            if (lote) {
                const tomorrow = new Date(fechaHoy);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const day = String(tomorrow.getDate()).padStart(2, "0");
                const month = String(tomorrow.getMonth() + 1); // Sin padStart para evitar el cero inicial
                const year = String(tomorrow.getFullYear()).slice(-2);

                // Mantener los primeros caracteres del lote original y agregar fecha
                const loteBase = lote.substring(0, Math.min(3, lote.length));
                document.getElementById("swal-lote").value = `${loteBase}${day}${month}${year}`;
            }   
            // Mostrar información de disponibilidad
            console.log('Proveedor seleccionado:', {
                producto,
                lote,
                cantidad_disponible: cantidad,
                canastillas_disponibles: canastillas
            });
        }
    });

    // Seleccionar el primer proveedor por defecto (opcional)
    if (proveedores.length > 0) {
        select.value = proveedores[0].id_proveedor;
        // Disparar el evento change para autocompletar
        select.dispatchEvent(new Event("change"));
    }
}

// ============================================================
// FUNCIÓN MODIFICADA: Actualizar cantidad del proveedor en el backend
// ============================================================
async function actualizarCantidadProveedorBackend(datos) {
    try {
        const response = await apiAlistamiento.put(
            `/restar-cantidad/${datos.recepcion_id}`,
            {
                cantidad_restar_kg: datos.cantidad_restar_kg,
                id_proveedor: datos.id_proveedor,
                motivo: "Restado por sobrantes para día siguiente",
                fecha_resta: fechaHoy,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            },
        );

        if (!response.success) {
            console.warn("Error en backend:", response.message);
        }

        return response;
    } catch (error) {
        console.error("Error:", error);
        return { success: false };
    }
}

// ============================================================
// FUNCIÓN MODIFICADA: Restar sobrantes del proveedor específico seleccionado
// ============================================================
async function restarSobrantesDeProveedorEspecifico(formValues) {
    try {
        const kgARestar = parseFloat(formValues.cantidad);
        const canastillasARestar = kgARestar / 20;

        const idProveedor = formValues.id_proveedor;
        const recepcionId = formValues.proveedor_info.recepcion_id;

        console.log("Restando sobrantes:", {
            id_proveedor: idProveedor,
            recepcionId: recepcionId,
            kg_a_restar: kgARestar,
            canastillas_a_restar: canastillasARestar
        });

        // Buscar el proveedor en los inputs del formulario
        const proveedoresInputs = document.querySelectorAll('input[name="id_proveedor[]"]');

        for (let i = 0; i < proveedoresInputs.length; i++) {
            const input = proveedoresInputs[i];
            const index = i + 1;

            if (
                input.value === idProveedor &&
                input.getAttribute("data-recepcion") === recepcionId
            ) {
                const cantidadInput = document.querySelector(`#cantidad_${index}`);
                const materiaInput = document.querySelector(`#cantidad_${index}_kg`);

                if (cantidadInput && materiaInput) {
                    // Obtener valores actuales
                    const canastillasActuales = parseFloat(
                        cantidadInput.getAttribute("data-canastillas") || 0,
                    );
                    const kgActuales = parseFloat(
                        materiaInput.getAttribute("data-kg") || 0,
                    );

                    // Calcular nuevas cantidades
                    const nuevosKg = kgActuales - kgARestar;
                    const nuevasCanastillas = canastillasActuales - canastillasARestar;

                    // Actualizar inputs VISUALES
                    cantidadInput.value = nuevasCanastillas.toFixed(2);
                    materiaInput.value = `${nuevosKg.toFixed(2)} Kg`;

                    // Actualizar atributos DATA
                    cantidadInput.setAttribute("data-canastillas", nuevasCanastillas);
                    materiaInput.setAttribute("data-kg", nuevosKg);

                    console.log("Inputs actualizados:", {
                        index: index,
                        nuevosKg: nuevosKg,
                        nuevasCanastillas: nuevasCanastillas
                    });
                }
                break;
            }
        }

        // 🔴 RECONSTRUIR COMPLETAMENTE proveedoresData 🔴
        const nuevoProveedoresData = [];

        // Recorrer todos los inputs para reconstruir proveedoresData
        for (let i = 0; i < proveedoresInputs.length; i++) {
            const input = proveedoresInputs[i];
            const index = i + 1;
            const id = input.value;
            const recepcionIdActual = input.getAttribute("data-recepcion");
            
            // Obtener los valores actuales de los inputs
            const cantidadInput = document.querySelector(`#cantidad_${index}`);
            const materiaInput = document.querySelector(`#cantidad_${index}_kg`);
            
            if (cantidadInput && materiaInput) {
                const kgActuales = parseFloat(materiaInput.getAttribute("data-kg") || 0);
                
                // Buscar el proveedor original en proveedoresData
                const proveedorOriginal = proveedoresData.find(
                    p => p.id == recepcionIdActual && p.id_proveedor == id
                );
                
                if (proveedorOriginal) {
                    // Crear una copia actualizada del proveedor
                    const proveedorActualizado = {
                        ...proveedorOriginal,
                        cantidad: kgActuales,  // Actualizar los kg
                    };
                    
                    nuevoProveedoresData.push(proveedorActualizado);
                    console.log(`Proveedor ${id} actualizado: ${proveedorOriginal.cantidad} kg → ${kgActuales} kg`);
                } else {
                    console.warn(`Proveedor no encontrado en proveedoresData:`, {
                        id: id,
                        recepcionId: recepcionIdActual
                    });
                }
            }
        }

        // Reemplazar proveedoresData con el nuevo array
        proveedoresData = nuevoProveedoresData;
        
        console.log("✅ proveedoresData RECONSTRUIDO:", proveedoresData.map(p => ({
            id_proveedor: p.id_proveedor,
            kg: p.cantidad,
            canastillas: p.cantidad / 20
        })));

        // Actualizar en el backend
        await actualizarCantidadProveedorBackend({
            id_proveedor: idProveedor,
            recepcion_id: recepcionId,
            cantidad_restar_kg: kgARestar,
        });

        // Recalcular totales
        limiteCanastillas();
        updateTotalesTable();
        saveCurrentState();

    } catch (error) {
        console.error("Error en restarSobrantesDeProveedorEspecifico:", error);
        throw error;
    }
}
// Función para cargar responsables en el modal SweetAlert2
async function cargarResponsablesSwal() {
    try {
        // Usar el responsable que ya está seleccionado en el formulario principal
        const responsableId = document.getElementById("id_responsable").value;
        const responsableNombre =
            document.getElementById("nombreEncargardo").value;

        const select = document.getElementById("swal-id_responsable");
        select.innerHTML = '<option value="">Seleccionar responsable</option>';

        // Si ya hay un responsable seleccionado en el formulario principal
        if (responsableId && responsableNombre) {
            const option = document.createElement("option");
            option.value = responsableId;
            option.textContent = responsableNombre;
            option.selected = true;
            select.appendChild(option);
        } else {
            // Si no hay responsable seleccionado, cargar todos los patinadores
            const response = await apiEmpleados.get(
                "/obtener-by-rol/Patinador",
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                },
            );

            if (response.success && response.data.responsables) {
                response.data.responsables.forEach((responsable) => {
                    const option = document.createElement("option");
                    option.value = responsable.id;
                    option.textContent = responsable.nombre;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error cargando responsables:", error);
    }
}

function removeEmptyFields(obj) {
    for (var prop in obj) {
        if (obj[prop] === null || obj[prop] === undefined || obj[prop] === "") {
            delete obj[prop];
        } else if (typeof obj[prop] === "object") {
            removeEmptyFields(obj[prop]);
        }
    }
    return obj;
}

const encargo = async () => {
    const response = await apiEncargo.get("/leer", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        window.location.replace("/tablet/home");
    }
    const { configuracion } = response.data;
    document.getElementById("idEncargo").value = configuracion[0].orden_actual;
};

const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Pelador", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { responsables } = response.data;

    const tablePeladores = document.querySelector("#tabla-peladores tbody");

    responsables.forEach((pelador, index) => {
        const newTr = document.createElement("tr");
        const newTdNum = document.createElement("td");
        newTdNum.textContent = index + 1;

        const newTdPelador = document.createElement("td");
        newTdPelador.textContent = pelador.nombre;
        newTdPelador.setAttribute("data-id", `${pelador.id}`);

        const newTdCantidad = document.createElement("td");
        newTdCantidad.textContent = `0/0/0/0/0/0`;

        const newTdTotal = document.createElement("td");
        newTdTotal.textContent = 0;

        const newTdTotalRechazo = document.createElement("td");
        newTdTotalRechazo.textContent = 0;

        const newTdTotalMaduro = document.createElement("td");
        newTdTotalMaduro.textContent = 0;

        const newTdId = document.createElement("td");
        newTdId.textContent = "";

        newTr.appendChild(newTdNum);
        newTr.appendChild(newTdPelador);
        newTr.appendChild(newTdCantidad);
        newTr.appendChild(newTdTotal);
        newTr.appendChild(newTdTotalRechazo);
        newTr.appendChild(newTdTotalMaduro);

        tablePeladores.appendChild(newTr);
    });

    // LLenamos la lissta desplegable en la Modal.
    const peladorlist = document.getElementById("empeladolist");
    responsables.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = `${item.nombre}`;
        option.dataset.indexTable = index;
        option.dataset.asignacion = "0/0/0/0/0/0";
        option.dataset.rechazo = 0;
        option.dataset.maduro = 0;
        option.dataset.id = item.id;
        peladorlist.appendChild(option);
    });
};

const respsonsables = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Patinador", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);

        return false;
    }
    const { responsables } = response.data;

    const empleadolist = document.getElementById("encargadolist");

    fillDatalist(empleadolist, responsables);
    handleInput(empleadolist, "nombreEncargardo", "id_responsable");
};

const rendereizarProveedores = (proveedores) => {
    // Guardar los proveedores en la variable global
    proveedoresData = proveedores;

    const contenedor = document.querySelector("#contenedorProveedor");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Card principal
    const card = document.createElement("div");
    card.className = "card mb-3 border-0 rounded-4 shadow-sm";

    const cardHead = document.createElement("div");
    cardHead.className = "card mb-3 shadow-sm fw-bold text-white";
    cardHead.style.backgroundColor = "#ec6704";

    // Collapse container
    const collapseDiv = document.createElement("div");
    collapseDiv.className = "collapse";
    collapseDiv.id = "collapseProveedores";

    // Card body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Botón para cerrar
    const closeButtonContainer = document.createElement("div");
    closeButtonContainer.className = "text-end mb-3";
    closeButtonContainer.innerHTML = `
        <button class="btn btn-lg btn-danger text-white fs-5" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapseProveedores">
             <i class="fa-solid fa-xmark fs-5"></i>
        </button>
    `;

    // Contenedor principal
    const proveedoresContainer = document.createElement("div");
    proveedoresContainer.className = "row g-3";

    cardBody.appendChild(closeButtonContainer);

    document.querySelector("#cantidadProv").innerHTML = `${proveedores.length}`;
    // Iterar sobre cada proveedor
    proveedores.forEach((item, index) => {
        const conteo = index + 1;
        // Columna para cada proveedor
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        col.innerHTML = `
       <div class="card border-1 rounded-4 shadow-sm ">
  <div
    class="card-header fw-bold text-white"
    style="background-color: #ec6704"
  >
    PROVEEDOR
    <span class="badge rounded-pill fw-bold" style="background-color: #6b7713">
      #${conteo}
    </span>
  </div>
  <div class="card-body">
    <div class="container-fluid">
      <div class="row">
        <div class="col-4">
          <div class="text-center">
            <img
              src="/assets/images/logo-clean.png"
              class="img-fluid img-thumbnail"
              alt="Logo"
              style="max-height: 120px; object-fit: contain;"
            />
          </div>
        </div>
        <div class="col-8">
          <ul class="list-group list-group-flush">
            <li class="list-group-item px-2 py-2">
              <div class="d-flex align-items-center">
                <i class="fa-solid fa-user me-2" style="width: 20px; text-align: center;"></i>
                <span class="fw-semibold text-truncate">${item.proveedor}</span>
              </div>
            </li>
             <li class="list-group-item px-2 py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center flex-shrink-0">
                  <i class="fa-solid fa-tag me-2" style="width: 20px; text-align: center;"></i>
                  <span class="fw-semibold">Lote</span>
                </div>
                <span
                  class="badge rounded-pill ms-2 flex-shrink-0"
                  style="background-color: #24243c">
                  ${item.lote}
                </span>
              </div>
            </li>
            <li class="list-group-item px-2 py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center flex-shrink-0">
                  <i class="fa-solid fa-plant-wilt me-2" style="width: 20px; text-align: center;"></i>
                  <span class="fw-semibold">Materia</span>
                </div>
                <span
                  class="badge rounded-pill ms-2 flex-shrink-0"
                  style="background-color: #6c780d">
                  ${item.cantidad} Kg
                </span>
              </div>
            </li>
            <li class="list-group-item px-2 py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center flex-shrink-0">
                  <i class="fa-solid fa-kaaba me-2" style="width: 20px; text-align: center;"></i>
                  <span class="fw-semibold">Canastas</span>
                </div>
                <span
                  class="badge rounded-pill ms-2 flex-shrink-0"
                  style="background-color: #ec6704">
                  ${item.cantidad / 20}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
        <input type="hidden" class="nombreProveedor form-control form-control-sm"  value="${
            item.proveedor
        }" id="proveedor_${conteo}" readonly data-id="${
            item.id_proveedor
        }" data-recepcion="${item.id}">
        
                   <input 
                        type="hidden" 
                        class="form-control form-control-sm text-center" 
                        id="cantidad_${conteo}_kg"
                        value="${item.cantidad} Kg"
                        name="cantidadKg[]"
                        data-kg="${item.cantidad}"
                        readonly>
            
                    <input 
                        type="hidden" 
                        class="form-control form-control-sm text-center" 
                        id="cantidad_${conteo}"
                        value="${item.cantidad / 20}"
                        name="cantidad[]"
                        data-kg="${item.cantidad}"
                        data-canastillas="${item.cantidad / 20}" readonly>

                <input 
                    type="hidden" 
                    value="${item.id_proveedor}"
                    id="id_proveedor_${conteo}"
                    name="id_proveedor[]"
                    data-lote="${item.lote}"
                    data-producto="${item.producto}"
                    data-recepcion="${item.id}"
                    data-id="${item.id_proveedor}">

                <input 
                    type="hidden" value="${0}"
                    data-id="${item.id_proveedor}"
                    id="rechazoPro${item.id_proveedor}"
                    name="rechazoPro[]">

                <input 
                    type="hidden" value="${0}"
                    data-id="${item.id_proveedor}"
                    id="materiaPro${item.id_proveedor}"
                    name="materiaPro[]">
            </div>
        `;
        proveedoresContainer.appendChild(col);
    });

    cardBody.appendChild(proveedoresContainer);
    collapseDiv.appendChild(cardBody);

    card.appendChild(collapseDiv);

    contenedor.appendChild(card);

    /*   */
    // Una vez se termine de renderizar la información del proveedor, calculamos el limite de Canastillas que debe registrarse.
    limiteCanastillas();
};

let recepcionesIds = [];

async function cargarProveedores() {
    let idOrden = document.getElementById("idEncargo").value;

    const response = await apiProveedores.get(
        `/obtener-proveedor-recepcion-Day/${fechaHoy}/${idOrden}/Alistamiento`,
        {
            headers: {
                Authorization: "Bearer " + token,
            },
        },
    );

    if (!response.success) {
        alerts.show(response);
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, 2000);
    }
    const { proveedores } = response.data;

    recepcionesIds = proveedores.flatMap((proveedor) => proveedor.ids || []);

    const selecProveedores = document.getElementById("listProveedores");

    selecProveedores.innerHTML = "";

    const optionDefault = document.createElement("option");
    optionDefault.textContent = "-- Seleccionar --";
    optionDefault.value = "";

    selecProveedores.appendChild(optionDefault);

    proveedores.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.proveedor;
        option.textContent = `${item.proveedor} (${item.fecha_procesamiento})`;
        option.dataset.id = item.id_proveedor;
        option.dataset.lote = item.lote;
        option.dataset.fecha = item.fecha_procesamiento;
        option.dataset.recepcion = item.id;
        option.dataset.rechazo = "0";
        option.dataset.maduro = "0";
        selecProveedores.appendChild(option);
    });

    rendereizarProveedores(proveedores);
}

// Agregar botón para limpiar datos manualmente
function addClearDataButton() {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "btn btn-danger btn-sm ms-2";
    clearButton.innerHTML = '<i class="fa-solid fa-trash"></i> Limpiar Datos';
    clearButton.addEventListener("click", () => {
        Swal.fire({
            title: "¿Limpiar todos los datos?",
            text: "Esta acción eliminará todas las asignaciones pendientes.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, limpiar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                clearStoredData();
                window.location.reload();
            }
        });
    });

    // Insertar cerca del botón de guardar
    const form = document.querySelector("form");
    if (form) {
        const submitContainer = form.querySelector(".d-grid");
        if (submitContainer) {
            submitContainer.appendChild(clearButton);
        } else {
            // Si no hay contenedor, insertar al final del formulario
            const buttonContainer = document.createElement("div");
            buttonContainer.className =
                "d-grid gap-2 d-md-flex justify-content-md-end mt-3";
            buttonContainer.appendChild(clearButton);
            form.appendChild(buttonContainer);
        }
    }
}

let x = Url.replace("http:", "");

const socket = new WebSocket("ws:" + x);

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "nuevoProveedor") {
        console.log("nuevo proveedor.");
        cargarProveedores();
    }
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }
};

setTimeout(() => {
    cargarProveedores();
}, "1000");

init();
