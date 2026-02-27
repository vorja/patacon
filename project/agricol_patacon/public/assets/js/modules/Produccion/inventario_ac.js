import { ApiService, AlertManager, Url } from "../../helpers/ApiUseManager.js";

const apiInventario = new ApiService(Url + "/data/bodega");
const apiLotes = new ApiService(Url + "/data/empaque");
const apiEmpleados = new ApiService(Url + "/data/empleados");

const alerts = new AlertManager();

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

//Elementos Html
const elements = {
    tableEmpaque: document.querySelector("#tablaEmpaque"),
    inputFecha: document.getElementById("fechaCaja"),
    btnObtner: document.getElementById("btnObtenerCajas"),
    btnCloseModal: document.getElementById("btnCloseModal"),
    btnRegistrarCantidad: document.getElementById("btnRegistrarCantidad"),
};

elements.btnRegistrarCantidad.addEventListener("click", storeDataCajas);
elements.btnCloseModal.addEventListener("click", limpiarModal);
elements.btnObtner.addEventListener("click", () => {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se guardara la información sin vuelta atrás!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0f8ee2",
        cancelButtonColor: "#545554ff",
        confirmButtonText: "Sí, Enviar información.",
    }).then((result) => {
        if (result.isConfirmed) {
            obtenerCajas();
        }
    });
});
const init = async () => {
    await empleados();
};
const dataCaja = [];
// Cuando cambia la fecha, cargar lotes
elements.inputFecha.addEventListener("change", async () => {
    const fecha = elements.inputFecha.value.trim();
    const loteslist = document.getElementById("lotes_produccion");
    if (!fecha) return;
    if (!loteslist) return;

    try {
        const resp = await apiLotes.get(`/obtener-lotes-fritura-Day/${fecha}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        if (!resp.success) {
            alerts.show(resp);
            loteslist.innerHTML = "";
            return false;
        }
        const { empaques } = resp.data;

        // Limpiar opciones anteriores
        loteslist.innerHTML = "";
        empaques.forEach((lote) => {
            let option = document.createElement("option");
            option.value = lote.LoteProduccion;
            option.textContent = lote.LoteProduccion;
            option.dataset.tipo = lote.Tipo;
            option.dataset.produccion = lote.Produccion;
            loteslist.appendChild(option);
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

// Eliminar fila
function eliminarFila(btn) {
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
document.getElementById("tablaCaja").addEventListener("click", function (e) {
    // Verificar si el click fue en el botón eliminar o en su icono
    const btnEliminar = e.target.closest("#eliminarFila");
    if (btnEliminar) {
        eliminarFila(btnEliminar);
    }
});

function limpiarInputs() {
    document.getElementById("cantidad").value = 0;
}

function storeDataCajas() {
    const LoteProduccion = document.querySelector("#lotes_produccion");
    let selectOption = LoteProduccion.options[LoteProduccion.selectedIndex];
    const tipo = selectOption.getAttribute("data-tipo");
    const produccion = selectOption.getAttribute("data-produccion");
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const campos = ["lotes_produccion", "cantidad", "fechaCaja"];

    if (!validarCamposModal(campos)) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Complete los campos requeridos.",
        });

        return;
    }

    if (!cantidad || cantidad === 0) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: "El Cantidad debe ser Mayor a 0..",
        });

        return;
    }

    const tableRows = document.querySelectorAll("#tablaCaja tbody tr");
    let existe = true;

    tableRows.forEach((row) => {
        const lote = row.querySelector('input[name="lote_produccion[]"]');

        if (lote.value === LoteProduccion.value) existe = false;
    });

    if (!existe) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El Lote ya fue seleccinado, elija otro disponible.",
        });
        return;
    }

    const newRow = document.createElement("tr");

    const inputLote = document.createElement("input");
    inputLote.value = LoteProduccion.value;
    inputLote.className = "form-control inputLote";
    inputLote.type = "text";
    inputLote.setAttribute("hidden", "true");
    inputLote.setAttribute("name", "lote_produccion[]");
    inputLote.setAttribute("data-lote", `${LoteProduccion.value}`);
    inputLote.setAttribute("data-fecha", `${produccion}`);
    inputLote.setAttribute("data-tipo", `${tipo}`);

    const inputFecha = document.createElement("input");
    inputFecha.value = produccion;
    inputFecha.className = "form-control inputFechaProducion";
    inputFecha.type = "text";

    inputFecha.setAttribute("hidden", "true");
    inputFecha.setAttribute("data-lote", `${LoteProduccion.value}`);
    inputFecha.setAttribute("data-fecha", `${produccion}`);

    const inputPeso = document.createElement("input");
    inputPeso.value = cantidad;
    inputPeso.className = "inputCantidad";
    inputPeso.type = "text";

    inputPeso.setAttribute("hidden", "true");
    inputPeso.setAttribute("name", "cantidad_caja[]");
    inputPeso.setAttribute("data-cantidad", `${cantidad}`);
    inputPeso.setAttribute("data-lote", `${LoteProduccion.value}`);

    const inputTipo = document.createElement("input");
    inputTipo.value = tipo;
    inputTipo.className = "inputTipo";
    inputTipo.type = "text";

    inputTipo.setAttribute("hidden", "true");
    inputTipo.setAttribute("data-cantidad", `${cantidad}`);
    inputTipo.setAttribute("data-fecha", `${produccion}`);
    inputTipo.setAttribute("data-lote", `${LoteProduccion.value}`);

    const loteFechaTd = document.createElement("td");
    loteFechaTd.innerHTML = `${produccion}`;
    loteFechaTd.className = "text-center";
    loteFechaTd.appendChild(inputFecha);

    const tipoTd = document.createElement("td");
    tipoTd.innerHTML = `${tipo}`;
    tipoTd.className = "text-center";
    tipoTd.appendChild(inputTipo);

    const loteProduccionTd = document.createElement("td");
    loteProduccionTd.innerHTML = `${LoteProduccion.value}`;
    loteProduccionTd.className = "text-center";
    loteProduccionTd.appendChild(inputLote);

    const cantidadCajaTd = document.createElement("td");
    cantidadCajaTd.innerHTML = `${cantidad}`;
    cantidadCajaTd.className = "T1 text-center";
    cantidadCajaTd.appendChild(inputPeso);

    const accion = document.createElement("td");
    accion.className = "text-center";
    accion.innerHTML = `<button type="button" class="btn btn-light btn-sm" id="eliminarFila"><i class="ft-trash-2 text-danger fw-bold fs-3"></i></button>`;

    newRow.appendChild(loteFechaTd);
    newRow.appendChild(loteProduccionTd);
    newRow.appendChild(tipoTd);
    newRow.appendChild(cantidadCajaTd);
    newRow.appendChild(accion);

    // Añadir la fila a la tabla
    document.querySelector("#tablaCaja tbody").appendChild(newRow);
    limpiarInputs();
}

function obtenerCajas() {
    const filas = document.querySelectorAll("#tablaCaja tbody tr");
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
        const cantidad = fila.querySelector('input[name="cantidad_caja[]"]');
        if (lote && cantidad) {
            lotes.push(lote.value.trim());
            dataCaja.push({
                lote_produccion: lote.value.trim(),
                fecha_produccion: lote.getAttribute("data-fecha"),
                tipo: lote.getAttribute("data-tipo"),
                cantidad_caja: parseFloat(cantidad.value),
            });
        }
    });

    const lotesUnico = lotes.filter((valor, indice, self) => {
        return self.indexOf(valor) === indice;
    });

    document.querySelector("#conteoLote").value = lotesUnico.length || 0;
    document.querySelector("#conteoCajas").value = lotes.length || 0;

    let timerInterval;
    Swal.fire({
        title: "¡Procesando Información!",
        html: "Terminando en <b></b> milliseconds.",
        timer: 1000,
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
            $("#registroInfoCajas").modal("hide");
        }
    });

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

function limpiarModal() {
    const campos = [
        "lotes_produccion",
        "cantidad",
        "referencia",
        "fechaCaja",
        "lotesList",
        "variedad",
    ];
    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.classList.remove("is-invalid", "is-valid");

        input.value = "";
        input.innerHTML = "";
    });
    document.querySelector("#tablaCaja tbody").innerHTML = "";
}

function configCalendario() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    // Configurar el mínimo en el input
    document.getElementById("fecha").setAttribute("min", hoy);
}

configCalendario();
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

async function enviarFormulario() {
    try {

        // Verificar que dataCaja tenga datos
        if (!dataCaja || dataCaja.length === 0) {
            Swal.fire({
                title: "Error",
                text: "No hay datos de cajas para enviar",
                icon: "error",
            });
            return;
        }

        // Verificar tipos válidos
        const tiposValidos = ["A", "B", "C", "AF", "BH", "XL", "CIL", "P"];
        const tiposInvalidos = dataCaja.filter(
            (caja) => !tiposValidos.includes(caja.tipo?.toUpperCase()),
        );

        if (tiposInvalidos.length > 0) {
            Swal.fire({
                title: "Error",
                text: `Tipos no válidos: ${tiposInvalidos.map((c) => c.tipo).join(", ")}`,
                icon: "error",
            });
            return;
        }

        // Construir datos
        const datos = {
            fecha_verificacion: document.getElementById("fecha").value,
            id_responsable: document.getElementById("responsableid").value,
            observaciones:
                document.getElementById("Observaciones").value ||
                "No hay Observaciones",
            cajas: dataCaja,
        };

        // Mostrar loading
        Swal.fire({
            title: "Procesando...",
            text: "Actualizando bodega",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Enviar
        const respuesta = await apiInventario.put("/update", datos, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });

        Swal.close();

        if (respuesta.success) {
            Swal.fire({
                title: "¡Éxito!",
                text: respuesta.message || "Bodega actualizada correctamente",
                icon: "success",
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                title: "Error",
                text: respuesta.message || "Error al actualizar",
                icon: "error",
            });
        }
    } catch (error) {
        console.error("❌ Error en enviarFormulario:", error);

        Swal.fire({
            title: "Error de conexión",
            text: error.message || "No se pudo conectar con el servidor",
            icon: "error",
        });
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
            "Content-Type": "application/json",
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

init();
