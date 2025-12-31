import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";

const apiCorte = new ApiService("http://localhost:3105/data/corte");
const apiProveedores = new ApiService("http://localhost:3105/data/recepcion");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const apiReferencias = new ApiService("http://localhost:3105/data/referencias");
const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

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

function obtenerFechaHoraLocal() {
    const fecha = new Date();
    return `${fecha.getUTCFullYear()}-${String(
        fecha.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(fecha.getUTCDate()).padStart(2, "0")}`;
}

document.getElementById("nombreProveedor").addEventListener("input", (e) => {
    const selectedOption = document.querySelector(
        `option[value="${e.target.value}"]`
    );

    if (!selectedOption) {
        limpiarInputs();
        return;
    }
    console.log(selectedOption.getAttribute("data-id"));

    document.getElementById("dropdownTipos").removeAttribute("disabled");
    document.getElementById("rechazoProveedor").removeAttribute("disabled");
    document
        .getElementById("rechazoProveedor")
        .setAttribute("data-id", selectedOption.getAttribute("data-id"));
});

function limpiarInputs() {
    document.getElementById("dropdownTipos").setAttribute("disabled", true);
    document.getElementById("rechazoProveedor").setAttribute("disabled", true);

    document.getElementById("nombreProveedor").value = "";
    document.getElementById("rechazoProveedor").value = "";
    document.getElementById("id_proveedor").value = "";
    document.querySelector(`#contenedorTipos`).innerHTML = "";

    const checkboxes = document.querySelectorAll(
        '.dropdown-menu input[type="checkbox"]'
    );

    checkboxes.forEach((cb) => {
        cb.checked = false;
    });
}

const eventCheck = async () => {
    const checkboxes = document.querySelectorAll(
        '.dropdown-menu input[type="checkbox"]'
    );

    checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
            const alertInfo = document.getElementById("alertInfo");
            const container = document.getElementById("contenedorTipos");
            const proveedor = document.getElementById("nombreProveedor");
            const id_proveedor = document.getElementById("id_proveedor");
            const id = e.target.value.replace(/\s+/g, "_");

            if (!container || !proveedor || !id_proveedor) return;

            if (e.target.checked) {
                const div = document.createElement("div");
                div.className = "mb-3 col-6 col-md-3 mt-3";
                div.id = `col_${id}`;

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
                input.id = `input_${id}`;

                input.setAttribute("name", "cantidad[]");
                input.setAttribute("data-tipo", `${e.target.value}`);
                input.setAttribute(
                    "data-proveedor",
                    `${proveedor.value.trim()}`
                );
                input.setAttribute(
                    "data-idProveedor",
                    `${id_proveedor.value.trim()}`
                );
                input.setAttribute("min", "0");
                input.setAttribute("step", "0.1");

                div.appendChild(h4);
                div.appendChild(input);
                container.appendChild(div);
                document
                    .getElementById(`alertInfo`)
                    .setAttribute("hidden", true);
            } else {
                const existing = document.getElementById(`col_${id}`);
                if (existing) existing.remove();
                if (container.children.length === 0) {
                    alertInfo.removeAttribute("hidden");
                }
            }
        });
    });
};

function obtenerCortes(id) {
    const contenedor = document.querySelector("#contenedorTipos");
    const inputs = contenedor.querySelectorAll('input[name="cantidad[]"]');
    const datos = [];
    if (inputs.length == 0) return false;
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
            materia: parseInt(valor),
            tipo: input.getAttribute("data-tipo"),
            id: input.getAttribute("data-IdProveedor"),
        });
    });

    const materiaRecp = Number(
        document.getElementById(`${id}`).getAttribute("data-materia")
    );

    const totalCorte = datos.reduce(
        (acc, c) => acc + Number(c.materia || 0),
        0
    );

    if (totalCorte > materiaRecp) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            html: `Está sobrepansado la cantidad recepcionada :<p class="badge text-danger fw-bold fs-5">${materiaRecp} Kg</p> `,
            timer: 1800,
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
            `option[value="${e.target.value}"]`
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
        text: "¡Se asignar está información al Proveedor sin vuelta atras!",
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

    const inputId = document.getElementById("id_proveedor");
    const datos = obtenerCortes(inputId.value.trim());
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
            text: "El campo no puede estar vacio.",
        });

        return false;
    }

    if (datos.length == 0 || !datos) {
        await Swal.close();
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Ingrese la Informacion de Cortes del Proveedor.",
        });

        return false;
    }

    const inputHidden = document.querySelector(
        `input.nombreProveedor[data-id="${proveedorId}"]`
    );

    document.querySelector(
        `span.rechazoProv[data-id="${proveedorId}"]`
    ).textContent = `${rechazo.value.trim()} Kg`;

    inputHidden.setAttribute("data-rechazo", rechazo.value.trim());

    const tableRows = document.querySelectorAll("#InfoCorte tbody tr");
    let existe = true;

    tableRows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.cells;
        if (cells.length < 4) return;
        if (cells[3].textContent === proveedorId) existe = false;
    });

    if (!existe) {
        Swal.close();
        await Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El Proveedor ya fue seleccinado, elija otro disponible.",
        });
        return;
    }

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

        newRow.appendChild(CellProveedor);
        newRow.appendChild(CellTipo);
        newRow.appendChild(CellCantidad);
        newRow.appendChild(CellCantidad);
        newRow.appendChild(proveedorIdCell);

        document.querySelector("#InfoCorte tbody").appendChild(newRow);
    });

    Swal.close();
    await Swal.fire({
        icon: "success",
        title: "Información Asignada",
        html: `Se ha asignado la información del proveedor :<p class="badge text-danger fw-bold fs-5">${proveedorName.value}</p> `,
        timer: 1700,
        showConfirmButton: false,
    });
    const alertInfo = document
        .getElementById("alertInfo")
        .removeAttribute("hidden");

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
    "enviarRegistroCorteButton"
);

enviarRegistroCorteButton.addEventListener("click", (e) => {
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
            const camposObligatorios = [
                "rechazo",
                "responsablenombre",
                "responsableid",
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
            const dataRecepciones = obtenerRecepciones();

            const principalData = {
                fecha: obtenerFechaHoraLocal(),
                orden: document.getElementById("idEncargo").value,
                id_responsable: document.getElementById("responsableid").value,
                rechazo_corte: document.getElementById("rechazo").value,
                observaciones:
                    document.getElementById("Observaciones").value ||
                    "No hay Observaciones",
                recepciones: dataRecepciones,
                detallesCortes: [],
            };

            const tableRows = document.querySelectorAll("#InfoCorte tbody tr");

            const detalles = [];

            tableRows.forEach((row, index) => {
                if (index === 0) return;
                const cells = row.cells;

                if (cells.length < 4) return;
                const detalle = {};
                detalle["proveedor_nombre"] = cells[0].textContent;
                detalle["tipo"] = cells[1].textContent;
                detalle["materia"] = cells[2].textContent;
                detalle["id_proveedor"] = cells[3].textContent;

                detalles.push(detalle);
            });

            const agruProveedores = detalles.reduce((acc, item) => {
                const proveedor = item.proveedor_nombre;
                if (!acc[proveedor]) {
                    acc[proveedor] = {
                        proveedor,
                        id_proveedor: item.id_proveedor,
                        totalMateria: 0,
                    };
                }
                acc[proveedor].totalMateria +=
                    parseFloat(item.materia ?? 0) || 0;
                return acc;
            }, {});

            const inputs = document.querySelectorAll(".nombreProveedor");

            const materiaRec = [];
            inputs.forEach((input) => {
                materiaRec.push({
                    proveedor: input?.getAttribute("data-proveedor"),
                    materRecp: parseInt(input?.getAttribute("data-materia")),
                    rechazo: parseFloat(input?.getAttribute("data-rechazo")),
                    lote_proveedor: input?.getAttribute("data-lote"),
                });
            });

            const rendimientoProv = Object.entries(agruProveedores).map(
                ([proveedor_nombre, data]) => {
                    const proveedorData = materiaRec.find(
                        (c) => c.proveedor === proveedor_nombre
                    );

                    const rendimiento =
                        data.totalMateria > 0
                            ? (data.totalMateria / proveedorData.materRecp) *
                              100
                            : 0;
                    /* 
                    console.log(proveedorData);
 */
                    return {
                        fecha_produccion: obtenerFechaHoraLocal(),
                        id_proveedor: data.id_proveedor,
                        totalMateria: Number(data.totalMateria.toFixed(2)),
                        rechazo: Number(proveedorData.rechazo.toFixed(1)),
                        lote_proveedor: proveedorData.lote_proveedor,
                        rendimiento: Number(rendimiento.toFixed(1)),
                    };
                }
            );

            console.log(rendimientoProv);

            const totalMateria = detalles.reduce(
                (acc, d) => acc + Number(d.materia || 0),
                0
            );

            principalData.detallesCortes = detalles.filter((detalle) =>
                Object.values(detalle).some((value) => value !== "")
            );

            const rendimiento = rendimientoPlatano(totalMateria);

            principalData.rendimiento_materia = parseFloat(rendimiento);
            principalData.total_materia = parseFloat(totalMateria);
            principalData.proveedores = rendimientoProv;

            const cleanedData = removeEmptyFields(principalData);
            console.log(cleanedData);

            const response = await apiCorte.post("/crear", cleanedData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.success) {
                alerts.show(response);
                setTimeout(() => {
                    window.location.replace("/tablet/home");
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

// Calculamos el rendimiento de la materia total procesada.
const rendimientoPlatano = (materPelada) => {
    const inputs = document.querySelectorAll(".nombreProveedor");
    let materRecp = 0;
    let rendimientoGeneral = 0;
    inputs.forEach((input) => {
        // Sumamos el total de la materia de Recepcion pesada
        materRecp += parseInt(input?.getAttribute("data-materia"));
    });

    rendimientoGeneral = (materPelada / materRecp) * 100;
    return rendimientoGeneral.toFixed(2);
};

const updateRechazo = () => {
    const inputs = document.querySelectorAll(".nombreProveedor");
    let materRechazo = 0;
    inputs.forEach((input) => {
        // Sumamos el total de la materia de Recepcion pesada
        materRechazo += parseFloat(input?.getAttribute("data-rechazo") || 0);
    });
    console.log("materia: ", materRechazo);
    document.querySelector("#rechazo").value = materRechazo;
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
        }, 3000);
    }
    const { configuracion } = response.data;
    document.getElementById("idEncargo").value = configuracion[0].orden_actual;
};

const rendereizarProveedores = (proveedores) => {
    const fragment = new DocumentFragment();
    const contenedor = document.querySelector("#contenedorProveedores");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Card principal
    const card = document.createElement("div");
    card.className = "card mb-3 border-0 shadow-sm";

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
    closeButtonContainer.className = "text-end mb-2";
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
       <div class="card shadow-sm rounded-3"> 
       <div class="card-header fw-bold text-white" style="background-color: #ec6704"> PROVEEDOR
         <span class="badge rounded-pill fw-bold" style="background-color: #6b7713"> #${conteo} </span>
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
                <span class="fw-semibold text-truncate rechazoProv" data-id="${
                    item.id_proveedor
                }" id="">${0} Kg</span>
              </div>
            </li>  
             
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
        <input type="hidden" class="nombreProveedor form-control form-control-sm" value="${
            item.proveedor
        }" data-materia="${
            item.cantidad
        }" data-rechazo="0" id="proveedor_${conteo}"
        data-proveedor="${item.proveedor}" readonly data-id="${
            item.id_proveedor
        }" data-recepcion="${item.id}" data-lote="${item.lote}">
        <input type="hidden" value="${item.id_proveedor}" id="${
            item.id_proveedor
        }" name="id_proveedor[]" data-materia="${
            item.cantidad
        }" data-rechazo="0" data-recepcion="${item.id}">
</div>
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
    let fecha = new Date();
    const fechaHoy = `${fecha.getFullYear()}-${
        fecha.getMonth() + 1
    }-${fecha.getDate()}`;

    let ide = document.getElementById("idEncargo").value;
    const response = await apiProveedores.get(
        `/obtener-proveedor-recepcion-Day/${fechaHoy}/${ide}/Corte`,
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
    rendereizarProveedores(proveedores);

    const proveedoreslist = document.getElementById("proveedoreslist");
    proveedoreslist.innerHTML = "";
    proveedores.forEach((item) => {
        const option = document.createElement("option");
        option.value = `${item.proveedor}`;
        option.dataset.id = item.id_proveedor;
        option.dataset.rechazo = 0;
        proveedoreslist.appendChild(option);
    });

    const nombreProveedorInput = document.getElementById("nombreProveedor");
    const idProveedorInput = document.getElementById("id_proveedor");

    nombreProveedorInput.addEventListener("input", () => {
        const selectedOption = nombreProveedorInput.list.querySelector(
            `option[value="${nombreProveedorInput.value}"]`
        );

        if (selectedOption) {
            idProveedorInput.value = selectedOption.getAttribute("data-id");
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
    cargarProveedores();
}, "1000");

init();
