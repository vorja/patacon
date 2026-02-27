import {
    ApiService,
    AlertManager,
    Url,
    fechaHoy,
} from "../../helpers/ApiUseManager.js";

const apiCorte = new ApiService(Url + "/data/corte");
const apiProveedores = new ApiService(Url + "/data/recepcion");
const apiEncargo = new ApiService(Url + "/config/encargo");
const apiEmpleados = new ApiService(Url + "/data/empleados");
const apiReferencias = new ApiService(Url + "/data/referencias");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

// Variable global para almacenar los datos de proveedores
let datosRecepcionesCorte = [];

const init = async () => {
    await encargo();
    await empleados();
    await referencias();
    await cargarProveedores();
    await eventCheck();

    document
        .getElementById("btnDetalleCorte")
        .addEventListener("click", storeData);
};

document.getElementById("nombreProveedor").addEventListener("input", (e) => {
    const selectedOption = document.querySelector(
        `option[value="${e.target.value}"]`,
    );

    if (!selectedOption) {
        limpiarInputs();
        return;
    }

    document.getElementById("dropdownTipos").removeAttribute("disabled");
    document.getElementById("rechazoProveedor").removeAttribute("disabled");
    document
        .getElementById("rechazoProveedor")
        .setAttribute("data-id", selectedOption.getAttribute("data-id"));

    // Guardar también el ID de recepción
    document
        .getElementById("rechazoProveedor")
        .setAttribute(
            "data-recepcion-id",
            selectedOption.getAttribute("data-recepcion-id"),
        );

    // Cargar datos del proveedor si ya tiene registros en la tabla
    cargarDatosProveedorDeTabla(
        selectedOption.getAttribute("data-id"),
        selectedOption.getAttribute("data-recepcion-id"),
    );
});

// Reemplaza la función cargarDatosProveedorDeTabla con esta versión mejorada:

function cargarDatosProveedorDeTabla(proveedorId, recepcionId) {
    // Buscar en la tabla SOLO los registros de esta recepción específica
    const tableRows = document.querySelectorAll("#InfoCorte tbody tr");
    const cortesRecepcion = [];
    
    console.log("Buscando cortes para recepción ID:", recepcionId); // Para debugging

    tableRows.forEach((row, index) => {
        if (index === 0) return; // Saltar el encabezado si existe
        
        const cells = row.cells;
        if (cells.length < 5) return;

        const idProveedorCelda = cells[3]?.textContent;
        const idRecepcionCelda = cells[4]?.textContent;

        // Comparar con el ID de recepción específico (NO solo con proveedorId)
        if (idRecepcionCelda === recepcionId) {
            cortesRecepcion.push({
                tipo: cells[1].textContent,
                materia: parseFloat(cells[2].textContent || 0),
                idProveedor: idProveedorCelda,
                idRecepcion: idRecepcionCelda
            });
        }
    });

    console.log("Cortes encontrados para esta recepción:", cortesRecepcion); // Para debugging

    // Si esta recepción ya tiene registros en la tabla
    if (cortesRecepcion.length > 0) {
        // Buscar el rechazo de esta recepción específica
        const rechazoElement = document.querySelector(
            `span.rechazoProv[data-recepcion-id="${recepcionId}"]`
        );
        
        if (rechazoElement) {
            const rechazoValue = rechazoElement.textContent
                .replace(" Kg", "")
                .trim();
            document.getElementById("rechazoProveedor").value = rechazoValue;
            
            // También actualizar el atributo data-rechazo del input hidden
            const inputHidden = document.querySelector(
                `input.nombreProveedor[data-recepcion="${recepcionId}"]`
            );
            if (inputHidden) {
                inputHidden.setAttribute("data-rechazo", rechazoValue);
            }
        }

        // Limpiar contenedor de tipos
        const container = document.getElementById("contenedorTipos");
        container.innerHTML = "";

        // Agrupar por tipo (en caso de que haya múltiples registros del mismo tipo)
        const cortesPorTipo = {};
        cortesRecepcion.forEach((corte) => {
            if (!cortesPorTipo[corte.tipo]) {
                cortesPorTipo[corte.tipo] = 0;
            }
            cortesPorTipo[corte.tipo] += parseFloat(corte.materia);
        });

        // Marcar checkboxes y crear inputs con valores existentes
        const checkboxes = document.querySelectorAll(
            '.dropdown-menu input[type="checkbox"]'
        );

        // Primero, desmarcar todos los checkboxes
        checkboxes.forEach((cb) => {
            cb.checked = false;
        });

        // Luego marcar solo los que corresponden
        Object.keys(cortesPorTipo).forEach((tipo) => {
            const checkbox = Array.from(checkboxes).find(
                (cb) => cb.value === tipo
            );
            
            if (checkbox) {
                checkbox.checked = true;
                
                // Crear el input para este tipo
                const uniqueId = `${proveedorId}_${recepcionId}_${tipo.replace(/\s+/g, "_")}`;
                
                const div = document.createElement("div");
                div.className = "mb-3 col-6 col-md-3 mt-3";
                div.id = `col_${uniqueId}`;

                const h4 = document.createElement("h5");
                h4.className = "text-dark fw-bold fw-semibold border border-light";
                h4.textContent = `Corte Tipo - ${tipo}`;

                const input = document.createElement("input");
                input.type = "number";
                input.className = "form-control rounded shadow-sm text-center fs-6 text-dark numeric";
                input.placeholder = `Cantidad Kg: ${tipo}`;
                input.id = `input_${uniqueId}`;
                input.value = cortesPorTipo[tipo];

                input.setAttribute("name", "cantidad[]");
                input.setAttribute("data-tipo", tipo);
                input.setAttribute(
                    "data-proveedor",
                    document.getElementById("nombreProveedor").value
                );
                input.setAttribute("data-idProveedor", proveedorId);
                input.setAttribute("data-idRecepcion", recepcionId);
                input.setAttribute("data-unique-id", uniqueId);
                input.setAttribute("min", "0");
                input.setAttribute("step", "0.1");

                div.appendChild(h4);
                div.appendChild(input);
                container.appendChild(div);
            }
        });

        // Ocultar alerta de información
        document.getElementById("alertInfo").setAttribute("hidden", true);
        
        console.log("Datos cargados exitosamente para la recepción:", recepcionId);
    } else {
        // No hay registros previos, establecer rechazo en 0
        document.getElementById("rechazoProveedor").value = "0";
        
        // Limpiar contenedor de tipos
        document.getElementById("contenedorTipos").innerHTML = "";
        
        // Desmarcar todos los checkboxes
        const checkboxes = document.querySelectorAll(
            '.dropdown-menu input[type="checkbox"]'
        );
        checkboxes.forEach((cb) => {
            cb.checked = false;
        });
        
        // Mostrar alerta de información
        document.getElementById("alertInfo").removeAttribute("hidden");
    }
}

// También mejora el event listener del input del proveedor:

document.getElementById("nombreProveedor").addEventListener("input", (e) => {
    const selectedOption = document.querySelector(
        `option[value="${e.target.value}"]`,
    );

    if (!selectedOption) {
        limpiarInputs();
        return;
    }

    const proveedorId = selectedOption.getAttribute("data-id");
    const recepcionId = selectedOption.getAttribute("data-recepcion-id");
    const lote = selectedOption.getAttribute("data-lote");
    const materia = selectedOption.getAttribute("data-materia");

    // Guardar datos en los atributos del input
    e.target.setAttribute("data-proveedor-id", proveedorId);
    e.target.setAttribute("data-recepcion-id", recepcionId);
    e.target.setAttribute("data-lote", lote);
    e.target.setAttribute("data-materia", materia);

    document.getElementById("dropdownTipos").removeAttribute("disabled");
    document.getElementById("rechazoProveedor").removeAttribute("disabled");
    
    // Guardar IDs en el input de rechazo
    document
        .getElementById("rechazoProveedor")
        .setAttribute("data-id", proveedorId);
    document
        .getElementById("rechazoProveedor")
        .setAttribute("data-recepcion-id", recepcionId);

    // Guardar ID del proveedor en el campo oculto
    document.getElementById("id_proveedor").value = proveedorId;

    // Cargar datos del proveedor si ya tiene registros en la tabla
    cargarDatosProveedorDeTabla(proveedorId, recepcionId);
});

function limpiarInputs() {
    document.getElementById("dropdownTipos").setAttribute("disabled", true);
    document.getElementById("rechazoProveedor").setAttribute("disabled", true);

    document.getElementById("nombreProveedor").value = "";
    document.getElementById("rechazoProveedor").value = "";
    document.getElementById("id_proveedor").value = "";
    document.querySelector(`#contenedorTipos`).innerHTML = "";

    const checkboxes = document.querySelectorAll(
        '.dropdown-menu input[type="checkbox"]',
    );

    checkboxes.forEach((cb) => {
        cb.checked = false;
    });
}

const eventCheck = async () => {
    const checkboxes = document.querySelectorAll(
        '.dropdown-menu input[type="checkbox"]',
    );

    checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
            const alertInfo = document.getElementById("alertInfo");
            const container = document.getElementById("contenedorTipos");
            const proveedor = document.getElementById("nombreProveedor");
            const id_proveedor = document.getElementById("id_proveedor");

            // Obtener el ID de recepción del atributo data del rechazoProveedor
            const rechazoInput = document.getElementById("rechazoProveedor");
            const idRecepcion = rechazoInput
                ? rechazoInput.getAttribute("data-recepcion-id")
                : "";

            // ID único combinando proveedor + recepción + tipo
            const uniqueId = `${id_proveedor?.value || ""}_${idRecepcion || ""}_${e.target.value.replace(/\s+/g, "_")}`;

            if (!container || !proveedor || !id_proveedor) return;

            if (e.target.checked) {
                // Verificar si ya existe un input para esta combinación
                const existingInput = document.getElementById(
                    `input_${uniqueId}`,
                );
                if (existingInput) {
                    e.target.checked = true;
                    return;
                }

                const div = document.createElement("div");
                div.className = "mb-3 col-6 col-md-3 mt-3";
                div.id = `col_${uniqueId}`;

                const h4 = document.createElement("h5");
                h4.className =
                    "text-dark fw-bold fw-semibold border border-light";
                h4.textContent = `Corte Tipo - ${e.target.value} `;

                const input = document.createElement("input");
                input.type = "number";
                input.className =
                    "form-control rounded shadow-sm text-center fs-6 text-dark";
                input.classList.add("numeric");
                input.placeholder = `Cantidad Kg: ${e.target.value}`;
                input.id = `input_${uniqueId}`;

                input.setAttribute("name", "cantidad[]");
                input.setAttribute("data-tipo", `${e.target.value}`);
                input.setAttribute(
                    "data-proveedor",
                    `${proveedor.value.trim()}`,
                );
                input.setAttribute(
                    "data-idProveedor",
                    `${id_proveedor.value.trim()}`,
                );
                input.setAttribute("data-idRecepcion", idRecepcion);
                input.setAttribute("data-unique-id", uniqueId);
                input.setAttribute("min", "0");
                input.setAttribute("step", "0.1");

                div.appendChild(h4);
                div.appendChild(input);
                container.appendChild(div);
                document
                    .getElementById(`alertInfo`)
                    .setAttribute("hidden", true);
            } else {
                const existing = document.getElementById(`col_${uniqueId}`);
                if (existing) existing.remove();
                if (container.children.length === 0) {
                    alertInfo.removeAttribute("hidden");
                }
            }
        });
    });
};

function obtenerCortes() {
    const contenedor = document.querySelector("#contenedorTipos");
    const inputs = contenedor.querySelectorAll('input[name="cantidad[]"]');
    const datos = [];

    if (inputs.length == 0) return false;

    // Obtener el ID de recepción actual
    const rechazoInput = document.getElementById("rechazoProveedor");
    const idRecepcionActual = rechazoInput
        ? rechazoInput.getAttribute("data-recepcion-id")
        : "";

    inputs.forEach((input) => {
        const valor = input?.value.trim();
        if (!valor) {
            input.classList.add("is-invalid");
            return false;
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }

        datos.push({
            proveedor: input.getAttribute("data-proveedor"),
            materia: parseFloat(valor),
            tipo: input.getAttribute("data-tipo"),
            id: input.getAttribute("data-idProveedor"),
            idRecepcion:
                input.getAttribute("data-idRecepcion") || idRecepcionActual,
        });
    });

    // Buscar la materia de recepción correcta en datosRecepcionesCorte
    const proveedorId = document.getElementById("id_proveedor").value;
    const recepcionId = idRecepcionActual;

    const recepcionData = datosRecepcionesCorte.find(
        (r) =>
            r.id_proveedor.toString() === proveedorId &&
            r.id.toString() === recepcionId,
    );

    const materiaRecp = recepcionData ? parseFloat(recepcionData.cantidad) : 0;

    const totalCorte = datos.reduce(
        (acc, c) => acc + Number(c.materia || 0),
        0,
    );

    if (totalCorte > materiaRecp) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            html: `Está sobrepasando la cantidad recepcionada :<p class="badge text-danger fw-bold fs-5">${materiaRecp} Kg</p> `,
            timer: 1200,
            showConfirmButton: false,
        });

        return false;
    }

    return datos;
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

async function storeData() {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se actualizará la información del proveedor!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Actualizar",
        cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: "Procesando Información...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const inputId = document.getElementById("id_proveedor");
    const rechazoInput = document.getElementById("rechazoProveedor");
    const idRecepcion = rechazoInput
        ? rechazoInput.getAttribute("data-recepcion-id")
        : "";

    const datos = obtenerCortes();

    if (!datos) {
        await Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al obtener los datos de cortes.",
        });
        return;
    }

    const proveedorId = inputId.value.trim();
    const rechazo = document.getElementById("rechazoProveedor");
    const proveedorName = document.getElementById("nombreProveedor");

    if (proveedorId === "" || proveedorName.value.trim() === "") {
        await Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, ingrese todos los datos requeridos en el Formulario de Cortes.",
        });
        return;
    }

    if (rechazo.value.trim() === "") {
        await Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "El campo de rechazo no puede estar vacío.",
        });
        return;
    }

    if (datos.length == 0 || !datos) {
        await Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Ingrese la Información de Cortes del Proveedor.",
        });
        return;
    }

    // Buscar el input hidden correcto usando el ID de recepción
    const inputHidden = document.querySelector(
        `input.nombreProveedor[data-recepcion="${idRecepcion}"]`,
    );

    // Actualizar rechazo en la card del proveedor usando el ID de recepción
    const rechazoSpan = document.querySelector(
        `span.rechazoProv[data-recepcion-id="${idRecepcion}"]`,
    );

    if (rechazoSpan) {
        rechazoSpan.textContent = `${rechazo.value.trim()} Kg`;
    }

    if (inputHidden) {
        inputHidden.setAttribute("data-rechazo", rechazo.value.trim());
    }

    // Eliminar filas existentes para esta recepción específica
    const tableRows = document.querySelectorAll("#InfoCorte tbody tr");
    const rowsToRemove = [];

    tableRows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.cells;
        if (cells.length >= 5) {
            const rowProveedorId = cells[3]?.textContent;
            const rowRecepcionId = cells[4]?.textContent;
            if (
                rowProveedorId === proveedorId &&
                rowRecepcionId === idRecepcion
            ) {
                rowsToRemove.push(row);
            }
        }
    });

    rowsToRemove.forEach((row) => row.remove());

    // Agregar los nuevos datos a la tabla
    datos.forEach((item) => {
        const newRow = document.createElement("tr");

        const CellProveedor = document.createElement("td");
        CellProveedor.textContent = item.proveedor;
        CellProveedor.className = "text-center";

        const CellTipo = document.createElement("td");
        CellTipo.textContent = item.tipo;
        CellTipo.className = "text-center";

        const CellCantidad = document.createElement("td");
        CellCantidad.textContent = item.materia;
        CellCantidad.className = "text-center";

        const proveedorIdCell = document.createElement("td");
        proveedorIdCell.style.display = "none";
        proveedorIdCell.textContent = item.id;

        const recepcionIdCell = document.createElement("td");
        recepcionIdCell.style.display = "none";
        recepcionIdCell.textContent = idRecepcion;

        newRow.appendChild(CellProveedor);
        newRow.appendChild(CellTipo);
        newRow.appendChild(CellCantidad);
        newRow.appendChild(proveedorIdCell);
        newRow.appendChild(recepcionIdCell);

        document.querySelector("#InfoCorte tbody").appendChild(newRow);
    });

    Swal.close();
    await Swal.fire({
        icon: "success",
        title: "Información Actualizada",
        html: `Se ha actualizado la información del proveedor :<p class="badge text-danger fw-bold fs-5">${proveedorName.value}</p><p class="badge bg-info">Recepción ID: ${idRecepcion}</p>`,
        timer: 1500,
        showConfirmButton: false,
    });

    const alertInfo = document.getElementById("alertInfo");
    alertInfo.removeAttribute("hidden");

    updateRechazo();
    limpiarInputs();
}

document.addEventListener("DOMContentLoaded", () => {
    const proveedores = document.querySelectorAll(".mb-3");
    proveedores.forEach((proveedor, index) => {
        const input = proveedor.querySelector('input[name^="id_proveedor"]');
        if (input) {
            input.addEventListener("input", () => {
                proveedores[index + 1].classList.remove("hide");
            });
        }
    });
});

function obtenerRecepciones() {
    let proveedores = document.querySelectorAll(".nombreProveedor");
    let datos = [];
    proveedores.forEach((input) => {
        datos.push(parseInt(input.getAttribute("data-recepcion")));
    });

    return datos;
}

const enviarRegistroCorteButton = document.getElementById(
    "enviarRegistroCorteButton",
);

// Función para obtener TODOS los IDs de recepciones
function obtenerTodasLasRecepciones() {
    const todosIds = [];

    datosRecepcionesCorte.forEach((proveedor) => {
        if (proveedor.ids && Array.isArray(proveedor.ids)) {
            todosIds.push(...proveedor.ids);
        } else {
            todosIds.push(proveedor.id);
        }
    });

    return todosIds;
}

enviarRegistroCorteButton.addEventListener("click", async (e) => {
    e.preventDefault();
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se enviará la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#658d07ff",
        cancelButtonColor: "#f07b1cff",
        confirmButtonText: "Sí, Enviar información.",
    }).then(async (result) => {
        if (result.isConfirmed) {

             const camposObligatorios = [
                 "rechazo",
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

             const tableRows = document.querySelectorAll("#InfoCorte tbody tr");
             if (tableRows.length <= 1) {
                 Swal.fire({
                     title: "¡Error!",
                     text: "No hay registros de cortes en la tabla. Por favor, agregue cortes antes de enviar.",
                     icon: "error",
                     showConfirmButton: true,
                 });
                 return;
             }

            const dataRecepciones = obtenerTodasLasRecepciones();

            const principalData = {
                fecha: fechaHoy,
                inicio_corte: document.getElementById("inicio_corte").value,
                fin_corte: document.getElementById("fin_corte").value,
                orden: document.getElementById("idEncargo").value,
                id_responsable: document.getElementById("responsableid").value,
                rechazo_corte: document.getElementById("rechazo").value,
                observaciones:
                    document.getElementById("Observaciones").value ||
                    "No hay Observaciones",
                recepciones: dataRecepciones,
                detallesCortes: [],
                proveedores: [],
            };

            // ===== 1. CONSTRUIR DETALLES DE CORTE CON LOTE =====
            const detalles = [];
            const proveedoresMap = {};

            tableRows.forEach((row, index) => {
                if (index === 0) return;
                const cells = row.cells;
                if (cells.length < 5) return;

                const proveedorNombre = cells[0].textContent;
                const tipo = cells[1].textContent;
                const materia = parseFloat(cells[2].textContent || 0);
                const idProveedor = cells[3].textContent;
                const idRecepcion = cells[4].textContent;

                // Buscar datos de la recepción
                const recepcionData = datosRecepcionesCorte.find(
                    (r) => r.id.toString() === idRecepcion,
                );

                if (!recepcionData) {
                    console.error(
                        `No se encontró recepción ID: ${idRecepcion}`,
                    );
                    return;
                }

                // === PARA DETALLE_CORTE (con lote) ===
                detalles.push({
                    id_proveedor: parseInt(idProveedor),
                    tipo: tipo,
                    materia: parseFloat(materia.toFixed(2)),
                    lote: recepcionData.lote, // ← LOTE SIEMPRE PRESENTE
                });

                // === PARA PROVEEDOR_HAS_CORTE (agrupado por recepción) ===
                const key = `${idProveedor}_${recepcionData.lote}`;

                if (!proveedoresMap[key]) {
                    proveedoresMap[key] = {
                        id_proveedor: parseInt(idProveedor),
                        lote_proveedor: recepcionData.lote,
                        fecha_produccion: fechaHoy,
                        totalMateria: 0,
                        rechazo: 0,
                        cantidadRecepcion: recepcionData.cantidad,
                        idRecepcion: idRecepcion,
                    };
                }

                proveedoresMap[key].totalMateria += materia;
            });

            // Obtener rechazos de los inputs
            const inputs = document.querySelectorAll(".nombreProveedor");
            const rechazosMap = {};
            inputs.forEach((input) => {
                const recepcionId = input.getAttribute("data-recepcion");
                const rechazo = parseFloat(
                    input.getAttribute("data-rechazo") || 0,
                );
                if (recepcionId) {
                    rechazosMap[recepcionId] = rechazo;
                }
            });

            // Construir array de proveedores
            const proveedoresArray = Object.values(proveedoresMap).map(
                (data) => {
                    const rendimiento =
                        data.totalMateria > 0
                            ? (data.totalMateria / data.cantidadRecepcion) * 100
                            : 0;

                    return {
                        fecha_produccion: fechaHoy,
                        id_proveedor: data.id_proveedor,
                        totalMateria: Number(data.totalMateria.toFixed(2)),
                        rechazo: rechazosMap[data.idRecepcion] || 0,
                        lote_proveedor: data.lote_proveedor,
                        rendimiento: Number(rendimiento.toFixed(2)),
                    };
                },
            );

            // Calcular totales
            const totalMateria = detalles.reduce(
                (acc, d) => acc + d.materia,
                0,
            );
            const rendimiento = rendimientoPlatano(totalMateria);

            // Asignar al objeto principal
            principalData.detallesCortes = detalles;
            principalData.proveedores = proveedoresArray;
            principalData.rendimiento_materia = parseFloat(rendimiento);
            principalData.total_materia = parseFloat(totalMateria.toFixed(2));

            console.log("Datos a enviar:", {
                fecha: principalData.fecha,
                totalDetalles: principalData.detallesCortes.length,
                totalProveedores: principalData.proveedores.length,
                muestraDetalle: principalData.detallesCortes[0],
                muestraProveedor: principalData.proveedores[0],
            });

            const response = await apiCorte.post("/crear", principalData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.success) {
                alerts.show(response);
                setTimeout(() => {
                    window.location.replace("/tablet/home");
                }, 2000);
            } else {
                alerts.show(response);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    });
});
// Calculamos el rendimiento de la materia total procesada.
const rendimientoPlatano = (materPelada) => {
    const inputs = document.querySelectorAll(".nombreProveedor");
    let materRecp = 0;
    let rendimientoGeneral = 0;
    inputs.forEach((input) => {
        materRecp += parseInt(input?.getAttribute("data-materia"));
    });

    rendimientoGeneral = (materPelada / materRecp) * 100;
    return rendimientoGeneral.toFixed(2);
};

const updateRechazo = () => {
    const inputs = document.querySelectorAll(".nombreProveedor");
    let materRechazo = 0;
    inputs.forEach((input) => {
        materRechazo += parseFloat(input?.getAttribute("data-rechazo") || 0);
    });

    document.querySelector("#rechazo").value = materRechazo.toFixed(2);
};

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

const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Cortador", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { responsables } = response.data;
    const empleadolist = document.getElementById("empeladolist");

    fillDatalist(empleadolist, responsables);
    handleInput(empleadolist, "responsablenombre", "responsableid");
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
        }, 2000);
    }
    const { configuracion } = response.data;
    document.getElementById("idEncargo").value = configuracion[0].orden_actual;
};

const rendereizarProveedores = (proveedores) => {
    const fragment = new DocumentFragment();
    const contenedor = document.querySelector("#contenedorProveedores");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const card = document.createElement("div");
    card.className = "card mb-3 border-0 shadow-sm";

    const cardHead = document.createElement("div");
    cardHead.className = "card mb-3 shadow-sm fw-bold text-white";
    cardHead.style.backgroundColor = "#ec6704";

    const collapseDiv = document.createElement("div");
    collapseDiv.className = "collapse";
    collapseDiv.id = "collapseProveedores";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const closeButtonContainer = document.createElement("div");
    closeButtonContainer.className = "text-end mb-2";
    closeButtonContainer.innerHTML = `
        <button class="btn btn-lg btn-danger text-white fs-5" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapseProveedores">
             <i class="fa-solid fa-xmark fs-5"></i>
        </button>
    `;

    const proveedoresContainer = document.createElement("div");
    proveedoresContainer.className = "row g-3";

    cardBody.appendChild(closeButtonContainer);

    document.querySelector("#cantidadProv").innerHTML = `${proveedores.length}`;

    proveedores.forEach((item, index) => {
        const conteo = index + 1;
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        col.innerHTML = `
       <div class="card shadow-sm rounded-3"> 
       <div class="card-header fw-bold text-white" style="background-color: #ec6704"> PROVEEDOR
         <span class="badge rounded-pill fw-bold" style="background-color: #6b7713"> #${conteo} </span>
         <small class="text-white-50 d-block">Lote: ${item.lote} - ID Rec: ${item.id}</small>
       </div>
       <div class="card-body">
       <div class="container-fluid">
         <div class="row">
           <div class="col-4">
             <div class="text-center">
              <img src="/assets/images/logo-clean.png" class="img-fluid img-thumbnail" alt="Logo"
              style="max-height: 120px; object-fit: contain;"/>
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
                  <i class="fa-solid fa-ban text-danger me-2" style="width: 20px; text-align: center;"></i>
                  <span class="fw-semibold">Rechazo</span>
                </div>
                <span class="fw-semibold text-truncate rechazoProv" data-recepcion-id="${item.id}">${0} Kg</span>
              </div>
            </li>  
             
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
        <input type="hidden" class="nombreProveedor form-control form-control-sm" value="${item.proveedor}" 
               data-materia="${item.cantidad}" 
               data-rechazo="0" 
               id="proveedor_${conteo}_${item.id}"
               data-proveedor="${item.proveedor}" 
               readonly 
               data-id="${item.id_proveedor}" 
               data-recepcion="${item.id}" 
               data-lote="${item.lote}">
        <input type="hidden" value="${item.id_proveedor}" 
               id="proveedor_id_${item.id}" 
               name="id_proveedor[]" 
               data-materia="${item.cantidad}" 
               data-rechazo="0" 
               data-recepcion="${item.id}">
        `;
        proveedoresContainer.appendChild(col);
    });

    cardBody.appendChild(proveedoresContainer);
    collapseDiv.appendChild(cardBody);
    card.appendChild(collapseDiv);

    contenedor.appendChild(card);
    contenedor.appendChild(fragment);
};

async function cargarProveedores() {
    let ide = document.getElementById("idEncargo").value;
    const response = await apiProveedores.get(
        `/obtener-proveedor-recepcion-Day/${fechaHoy}/${ide}/Corte`,
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

    datosRecepcionesCorte = proveedores;

    rendereizarProveedores(proveedores);

    const proveedoreslist = document.getElementById("proveedoreslist");
    proveedoreslist.innerHTML = "";
    proveedores.forEach((item) => {
        const option = document.createElement("option");
        option.value = `${item.proveedor} - Lote: ${item.lote} (ID: ${item.id})`;
        option.dataset.id = item.id_proveedor;
        option.dataset.recepcionId = item.id;
        option.dataset.lote = item.lote;
        option.dataset.rechazo = 0;
        option.dataset.materia = item.cantidad;
        option.textContent = `Fecha Procesar: ${item.fecha_procesamiento} - Lote: ${item.lote}`;
        proveedoreslist.appendChild(option);
    });

    const nombreProveedorInput = document.getElementById("nombreProveedor");
    const idProveedorInput = document.getElementById("id_proveedor");

    nombreProveedorInput.addEventListener("input", () => {
        const selectedOption = Array.from(
            nombreProveedorInput.list.options,
        ).find((option) => option.value === nombreProveedorInput.value);

        if (selectedOption) {
            idProveedorInput.value = selectedOption.getAttribute("data-id");

            // Guardar el ID de recepción en el input de rechazo
            const rechazoInput = document.getElementById("rechazoProveedor");
            if (rechazoInput) {
                rechazoInput.setAttribute(
                    "data-recepcion-id",
                    selectedOption.getAttribute("data-recepcion-id"),
                );
            }

            // Guardar datos adicionales en el input del proveedor
            nombreProveedorInput.setAttribute(
                "data-recepcion-id",
                selectedOption.getAttribute("data-recepcion-id"),
            );
            nombreProveedorInput.setAttribute(
                "data-lote",
                selectedOption.getAttribute("data-lote"),
            );
            nombreProveedorInput.setAttribute(
                "data-materia",
                selectedOption.getAttribute("data-materia"),
            );
        }
    });
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

    referenciasList(referencias, "tipo");
};

const referenciasList = (referencias, id) => {
    const lista = document.querySelector(`#${id}`);
    lista.innerHTML = "";
    referencias.forEach((item) => {
        const element = `
        <li>
        <label class="dropdown-item">
        <input type="checkbox" class="form-check-input me-2" value="${item.Nombre}"> Tipo : ${item.Nombre}</label>
        </li>
        `;
        lista.innerHTML += element;
    });
};

let x = Url.replace("http:", "");

const socket = new WebSocket("ws:" + x);

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
    cargarProveedores();
}, "1000");

init();
