import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";
const alerts = new AlertManager();
const apiRecepcion = new ApiService("http://localhost:3105/data/recepcion");
const apiProveedores = new ApiService("http://localhost:3105/data/proveedor");
const apiEncargo = new ApiService("http://localhost:3105/config/encargo");
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const init = async () => {
    await encargo();
    await proveedores();
    await empleados();
};
// Generamos el lote de producción
const inputs = document.querySelector("#nombreProveedor");
document
    .getElementById("fecha_procesamiento")
    .addEventListener("input", generadorLote);

inputs.removeEventListener("input", generadorLote); // Evita duplicados
inputs.addEventListener("input", generadorLote); /* 

 */
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
const checkboxes = document.querySelectorAll(
    '.dropdown-menu input[type="checkbox"]'
);

checkboxes.forEach((cb) => {
    cb.addEventListener("change", (e) => {
        const container = document.getElementById("contenedorCantidadDefectos");
        const id = e.target.value.replace(/\s+/g, "_");

        if (!container) return;

        if (e.target.checked) {
            const div = document.createElement("div");
            div.className = "mb-3 col-6 col-md-3 mt-2";
            div.id = `col_${id}`;

            const h4 = document.createElement("h4");
            h4.className = "text-titles";
            h4.textContent = `${e.target.value}`;

            const input = document.createElement("input");
            input.type = "number";
            input.className =
                "form-control rounded-4 shadow-sm text-center text-dark fw-semibold";
            input.classList.add("numeric");
            input.placeholder = `Cantidad para: ${e.target.value}`;
            input.id = `input_${id}`;

            input.setAttribute("name", "cantidad[]");
            input.setAttribute("data-defecto", `${e.target.value}`);
            input.setAttribute("min", "0");
            input.setAttribute("step", "0.1");
            input.addEventListener("input", updateTotalDefectos);

            div.appendChild(h4);
            div.appendChild(input);
            container.appendChild(div);
        } else {
            const existing = document.getElementById(`col_${id}`);
            if (existing) existing.remove();
            updateTotalDefectos();
        }
    });
});

function configCalendario() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    // Configurar el mínimo en el input
    document.getElementById("fecha").setAttribute("min", hoy);
}
configCalendario();

function generadorLote() {
    // generamos el nombre del lote de producción con las primeras 3 letras del proveedor y el lote de producción seleccionado.
    let proveedorSele = document.getElementById("nombreProveedor").value.trim();
    let nombre = proveedorSele.replace(/\s+/g, "");
    let fechaSele = document.getElementById("fecha_procesamiento").value || "";

    let fecha = new Date(fechaSele);
    let ano = fecha.getUTCFullYear() % 100;
    const fechaHoy = `${fecha.getUTCDate()}${fecha.getUTCMonth() + 1}-${ano}`;

    if (!proveedorSele) {
        document.getElementById("lote_produccion").value = "";
        return;
    }
    document.getElementById("lote_produccion").value = `${nombre
        .slice(0, 3)
        .toUpperCase()}${fechaHoy.replace(/-/g, "")}`;
}

function updateTotalDefectos() {
    const defectos = document.getElementById("cant_defectos");
    const contenedor = document.querySelector("#contenedorCantidadDefectos");
    const inputs = contenedor.querySelectorAll('input[name="cantidad[]"]');
    let total = 0;
    inputs.forEach((input) => {
        const value = parseFloat(input.value);
        total += isNaN(value) ? 0 : value; // Treat NaN as 0
    });

    if (defectos) {
        defectos.value = total;

        updateTotalMateria();
    }
}

function updateTotalMateria() {
    const inputDefectos = document.querySelector("#cant_defectos");
    const inputsMateria = document.querySelector("#cantidad");
    const inputsMateriaRecp = document.querySelector("#cantidadRecepccion");
    const btnDefectos = document.querySelector("#dropdownDefectosBtn");

    // Validar existencia de elementos críticos
    if (!inputsMateriaRecp || !inputsMateria) {
        console.warn("Elementos necesarios no encontrados");
        return false;
    }

    // Validar si hay cantidad de recepción
    if (
        inputsMateriaRecp.value.trim() == 0 ||
        inputsMateriaRecp.value.trim() == ""
    ) {
        if (btnDefectos) {
            btnDefectos.setAttribute("disabled", "");
        }
        inputsMateria.value = 0;
        return false;
    }

    // Habilitar botón de defectos
    if (btnDefectos) {
        btnDefectos.removeAttribute("disabled");
    }

    // Calcular total
    let total =
        parseFloat(inputsMateriaRecp.value?.trim() || 0) -
        parseFloat(inputDefectos?.value?.trim() || 0);

    inputsMateria.value = total;

    return true;
}

// Configurar listeners correctamente
function setupListeners() {
    const inputsCantidadRecp = document.querySelector("#cantidadRecepccion");
    const inputsCantidadDefectos = document.querySelector("#cant_defectos");

    // Verificar que los elementos existan antes de agregar listeners
    if (inputsCantidadRecp) {
        inputsCantidadRecp.removeEventListener("input", updateTotalMateria);
        inputsCantidadRecp.addEventListener("input", updateTotalMateria);
    } else {
        console.warn("No se encontró #cantidadRecepccion");
    }

    if (inputsCantidadDefectos) {
        inputsCantidadDefectos.removeEventListener("input", updateTotalMateria);
        inputsCantidadDefectos.addEventListener("input", updateTotalMateria);
    } else {
        console.warn("No se encontró #cant_defectos");
    }

    // Ejecutar una vez al inicio para establecer valores iniciales
    updateTotalMateria();
}

// Llamar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupListeners);
} else {
    // DOM ya está listo
    setupListeners();
}

function validarCamposEstado() {
    const color = document.getElementById("color").checked;
    const olor = document.getElementById("olor").checked;
    const estadoFisico = document.getElementById("estado_fisico").checked;
    const cumple = document.getElementById("cumple").checked;
    let valido = true;

    if (!color && !olor && !estadoFisico && !cumple) {
        valido = false;
        return valido;
    }

    return valido;
}

function obtenerDatosDefectos() {
    const contenedor = document.querySelector("#contenedorCantidadDefectos");
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
            defecto: input.getAttribute("data-defecto"),
            cantidad: parseInt(valor),
        });
    });
    return datos;
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
        cancelButtonText: "Cancelar.",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const datos =
                obtenerDatosDefectos() != false ? obtenerDatosDefectos() : [];

            const camposObligatorios = [
                "fecha",
                "fecha_procesamiento",
                "id_proveedor",
                "nombreProveedor",
                "producto",
                "cantidadRecepccion",
                "cantidad",
                "lote_produccion",
                "nombreResponsable",
                "id_responsable",
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
            if (!validarCamposEstado()) {
                Swal.fire({
                    title: "Error",
                    text: "Por favor, seleccione al menos una característica del producto.",
                    icon: "error",
                    showConfirmButton: true,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                });
                return;
            }

            const formData = {
                fecha: document.getElementById("fecha").value,
                id_proveedor: document.getElementById("id_proveedor").value,
                fecha_procesamiento: document.getElementById(
                    "fecha_procesamiento"
                ).value,
                producto: document.getElementById("producto").value,
                materia_recep:
                    document.getElementById("cantidadRecepccion").value,
                cantidad: document.getElementById("cantidad").value,
                lote: document.getElementById("lote_produccion").value,
                cant_defectos:
                    document.getElementById("cant_defectos").value || 0,
                id_responsable: document.getElementById("id_responsable").value,
                color: document.getElementById("color").checked ? "Si" : "No",
                olor: document.getElementById("olor").checked ? "Si" : "No",
                estado_fisico: document.getElementById("estado_fisico").checked
                    ? "En condiciones"
                    : "Mal estado",
                cumple: document.getElementById("cumple").checked
                    ? "Si Cumple"
                    : "No Cumple",
                orden: document.getElementById("idEncargo").value,
                defectos: datos,
                observaciones:
                    document.getElementById("Observaciones").value ||
                    "No hay Observaciones",
            };

            console.log(formData);
            const response = await apiRecepcion.post("/crear", formData, {
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

    const { responsables } = response.data;
    const empleadolist = document.getElementById("empleadolist");

    fillDatalist(empleadolist, responsables);
    handleInput(empleadolist, "nombreResponsable", "id_responsable");
};
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

    const { proveedores } = response.data;
    const proveedorlist = document.getElementById("proveedorlist");

    fillDatalist(proveedorlist, proveedores);
    handleInput(proveedorlist, "nombreProveedor", "id_proveedor");
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

const socket = new WebSocket("ws://localhost:3105");

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "cambioOrden") {
        console.log("Orden de encargo cambiada, actualizando...");
        encargo();
    }

    if (msg.type === "Notificacion") {
        const msg = JSON.parse(event.data);
        console.log(msg);
        console.log("Nuevo Registro");
    }
};

init();
