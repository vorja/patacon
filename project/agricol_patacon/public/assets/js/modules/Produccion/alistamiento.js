import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";
import { AlertSystem } from "../../helpers/AlertasManger.js";
const apiAlistamiento = new ApiService(
    "http://localhost:3105/data/alistamiento"
);
const apiProveedores = new ApiService("http://localhost:3105/data/recepcion");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const alerts = new AlertManager();
const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const rechazoPro = [];

const init = async () => {
    await encargo();
    await empleados();
    await respsonsables();
    await cargarProveedores();

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
};

document.getElementById("pelador").addEventListener("input", (e) => {
    const selectedOption = document.querySelector(
        `option[value="${e.target.value}"]`
    );
    if (!selectedOption) {
        // Deshabilitamos y Limpiamos los campos de la modal.
        limpiarInputs();
        return;
    }

    // Quitamos el atributo disable para hablilitar la edicion o asignacion.
    for (let index = 0; index < 6; index++) {
        document
            .querySelector(`#cantidadDetalle${index + 1}`)
            .removeAttribute("disabled");
    }

    document.getElementById("listProveedores").removeAttribute("disabled");

    let pelador = document.getElementById("idpelador");
    pelador.value = selectedOption.dataset.id;
    pelador.setAttribute("data-index-table", selectedOption.dataset.indexTable);
    pelador.setAttribute("data-asignacion", selectedOption.dataset.asignacion);

    const inputs = document.querySelectorAll(".inputCantidad");
    const inputRechazo = (document.querySelector(
        ".inputCantidadRechazo"
    ).value = selectedOption.dataset.rechazo);

    const inputMaduro = (document.querySelector(".inputCantidadMaduro").value =
        selectedOption.dataset.maduro);
    let asignadas = selectedOption.dataset.asignacion.split("/");

    inputs.forEach((input, index) => {
        input.value = asignadas[index] || 0;
    });

    // actulizamos los campos.
    updateTotalDetalle();
    updateTotalMaduro();
    updateTotalRechazo();
    validarCanastillas();
});

document.getElementById("listProveedores").addEventListener("input", (e) => {
    const selectedOption = e.target.value;
    if (!selectedOption) {
        document
            .getElementById("cantidadRechazo")
            .setAttribute("disabled", true);
        document
            .getElementById("cantidadMaduro")
            .setAttribute("disabled", true);
        document.getElementById("btnInfoProve").setAttribute("disabled", true);
        return;
    }

    document.getElementById("cantidadRechazo").removeAttribute("disabled");
    document.getElementById("cantidadMaduro").removeAttribute("disabled");
    document.getElementById("btnInfoProve").removeAttribute("disabled");
});

document.getElementById("btnInfoProve").addEventListener("click", async (e) => {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se asignar está información al proveedor sin vuelta atras!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, Asignar",
        cancelButtonText: "Cancelar",
    });

    // Si cancela, no hacer nada
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

    const proveedor = document.getElementById("listProveedores");
    const selectedOption = document.querySelector(
        `option[value="${proveedor.value}"]`
    );
    const peladorId = document.getElementById("idpelador");
    const indice = peladorId.getAttribute("data-index-table");
    const totalRechazo =
        parseFloat(document.getElementById("totalRechazo").value.trim()) || 0;
    const totalMaduro =
        parseFloat(document.getElementById("totalMaduro").value.trim()) || 0;

    if (proveedor.value === "" || !proveedor) {
        Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Seleccione a un proveedor valido.",
        });
        return;
    }

    const resultado = rechazoPro.find(
        (item) =>
            item.proveedor === proveedor.value && item.indexTable === indice
    );

    if (resultado) {
        Swal.close();
        await Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El proveedor ya se le asigno la cantidad rechazo y/o maduro.",
        });
        proveedor.selectedIndex = 0;
        return;
    }

    rechazoPro.push({
        proveedor: proveedor.value,
        id_proveedor: selectedOption.dataset.id,
        pelador: peladorId.value,
        indexTable: indice,
        maduro: totalMaduro,
        rechazo: totalRechazo,
    });

    Swal.close();

    await Swal.fire({
        icon: "success",
        title: "Información Asignada",
        html: `Se ha asignado la información del proveedor :<p class="badge text-danger fw-bold fs-5">${proveedor.value}</p> `,
        timer: 1700,
        showConfirmButton: false,
    });

    console.log("acumulado Prov: ", rechazoPro);
    limpiarInputsProveedor();
});

function limpiarInputsProveedor() {
    document.getElementById("btnInfoProve").setAttribute("disabled", true);
    const cantidadRechazo = document.querySelector(`#cantidadRechazo`);
    const cantidadMaduro = document.querySelector(`#cantidadMaduro`);
    const totalRecahazo = document.getElementById("totalRechazo");
    const totalMaduro = document.getElementById("totalMaduro");
    const selectProveedor = document.getElementById("listProveedores");

    selectProveedor.selectedIndex = 0;
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
    let totalDetalle =
        parseInt(document.getElementById("totalcortes").value.trim()) || 0;
    let btnGuardarInfo = document.getElementById("btnDetalle");
    let limite = parseInt(document.getElementById("limite").value.trim()) || 0;
    let totalGeneral =
        parseInt(document.getElementById("total").value.trim()) || 0;

    const indice = document
        .getElementById("idpelador")
        .getAttribute("data-index-table");
    const fila = document.querySelector(
        `#tabla-peladores tbody tr:nth-child(${parseInt(indice) + 1})`
    );
    const valorAnteriorFila = fila
        ? parseInt(fila.cells[3].textContent) || 0
        : 0;

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

function limiteCanastillas() {
    let total = 0;
    let inputs = document.querySelectorAll('input[name="cantidad[]"]');
    let limite = document.querySelector("#limite");

    inputs.forEach((input) => {
        const value = parseFloat(input.value.trim()); // redondeo hacia arriba.
        total += isNaN(value) ? 0 : value;
    });

    limite.value = Math.round(total);
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
    let cantidades = document.querySelectorAll('input[name="cantidad[]"]');
    let datos = [];

    for (let i = 0; i < proveedores.length; i++) {
        let id = proveedores[i].value;

        const resultado = rechazoPro.filter((item) => item.id_proveedor === id);

        const totalRechazo = resultado.reduce(
            (acc, item) => acc + Number(item.rechazo || 0),
            0
        );

        const totalMaduro = resultado.reduce(
            (acc, d) => acc + Number(d.maduro || 0),
            0
        );

        datos.push({
            id_proveedor: proveedores[i].value,
            cantidad: parseFloat(cantidades[i].value),
            id_recepcion: parseInt(
                proveedores[i].getAttribute("data-recepcion")
            ),
            lote_proveedor: proveedores[i].getAttribute("data-lote"),
            producto: proveedores[i].getAttribute("data-producto"),
            materia: parseFloat(cantidades[i].getAttribute("data-kg")),
            rechazo: parseFloat(totalRechazo || 0),
            maduro: parseFloat(totalMaduro || 0),
        });
    }
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
    let proveedores = document.querySelectorAll('input[name="id_proveedor[]"]');
    let datos = [];
    proveedores.forEach((input) => {
        datos.push(parseInt(input.getAttribute("data-recepcion")));
    });

    return datos;
}

function obtenerFechaHoraLocal() {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(fecha.getDate()).padStart(2, "0")}`;
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

    const totalcortes =
        parseInt(document.getElementById("totalcortes").value.trim()) || 0;
    const indice = peladorId.getAttribute("data-index-table");
    const fila = document.querySelector(
        `#tabla-peladores tbody tr:nth-child(${parseInt(indice) + 1})`
    );
    const valorAnteriorFila = fila
        ? parseInt(fila.cells[3].textContent) || 0
        : 0;

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
        0
    );

    const totalMaduro = resultado.reduce(
        (acc, d) => acc + Number(d.maduro || 0),
        0
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
    const optionPelador = document.querySelector(
        `option[data-id="${peladorId.value}"]`
    );
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

    Swal.fire({
        title: "Correcto",
        html: `Información de Pelador Asignada Correctamente :<p class="badge fw-bold fs-5" style="color: #074c8dff" >${pelador.value}</p> `,
        icon: "success",
        timer: 1700,
        showConfirmButton: false,
    });
    limpiarInputs();
}

const cantidadInputsDetalle = Array.from(
    document.querySelectorAll('input[id^="cantidad"]')
).filter((input) => /^cantidadDetalle[1-6]$/.test(input.id));

// Recalcular y validar en tiempo real
cantidadInputsDetalle.forEach((input) => {
    input.addEventListener("input", () => {
        updateTotalDetalle();
        validarCanastillas();
        validarNumeroNegativo(input);
    });
});

document
    .querySelector("#cantidadRechazo")
    .addEventListener("input", updateTotalRechazo);

document
    .querySelector("#cantidadMaduro")
    .addEventListener("input", updateTotalMaduro);

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
            `option[value="${e.target.value}"]`
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
            let limite = parseFloat(document.getElementById("limite").value);
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
                fecha: obtenerFechaHoraLocal(),
                maduro: parseFloat(document.getElementById("maduro").value),
                rechazo: parseFloat(document.getElementById("rechazo").value),
                recipientes_desinf:
                    document.getElementById("recipientes_desinf").value,
                orden: document.getElementById("idEncargo").value,
                id_responsable: document.getElementById("id_responsable").value,
                total: document.getElementById("total").value,
                observaciones:
                    document.getElementById("Observaciones").value ||
                    "No hay Observaciones",
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

            if (Number(principalData.total) < limite) {
                Swal.fire({
                    title: "¡Atención!",
                    html: `Debe Asignar todas las canastillas para guardar el registro. | restante :<p class="badge text-danger fw-bold fs-5">${limite}</p>`,
                    icon: "warning",
                    showConfirmButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                });
                return;
            }

            const cleanedData = removeEmptyFields(principalData);
            /* const jsonData = JSON.stringify(cleanedData); */
            console.log(principalData);

            const response = await apiAlistamiento.post("/crear", cleanedData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.success) {
                alerts.show(response);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                alerts.show(response);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        }
    });
});

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

async function cargarProveedores() {
    let fecha = new Date();
    const fechaHoy = `${fecha.getFullYear()}-${
        fecha.getMonth() + 1
    }-${fecha.getDate()}`;
    let idOrden = document.getElementById("idEncargo").value;

    const response = await apiProveedores.get(
        `/obtener-proveedor-recepcion-Day/${fechaHoy}/${idOrden}/Alistamiento`,
        {
            headers: {
                Authorization: "Bearer " + token,
            },
        }
    );

    if (!response.success) {
        alerts.show(response);
        setTimeout(() => {
            window.location.replace("/tablet/home");
        }, 3000);
    }
    const { proveedores } = response.data;

    const selecProveedores = document.getElementById("listProveedores");

    selecProveedores.innerHTML = 0;

    const optionDefault = document.createElement("option");
    optionDefault.textContent = "-- Seleccionar --";
    optionDefault.value = "";

    selecProveedores.appendChild(optionDefault);
    proveedores.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.proveedor;
        option.dataset.id = item.id_proveedor;
        option.dataset.lote = item.lote;
        option.dataset.rechazo = "0";
        option.dataset.maduro = "0";
        option.textContent = item.proveedor;
        selecProveedores.appendChild(option);
    });

    rendereizarProveedores(proveedores);
}

const socket = new WebSocket("ws://localhost:3105");

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
