import { ApiService, AlertManager } from "../../helpers/ApiUseManager.js";

const apiTemeperatura = new ApiService(
    "http://localhost:3105/data/temperatura"
);
const apiEmpleados = new ApiService("http://localhost:3105/data/empleados");
const apiCuartos = new ApiService("http://localhost:3105/data/cuarto");
const alerts = new AlertManager();
const Token_API = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

const init = async () => {
    await empleados();
    await cuartos();
};

function validarFormatoFecha() {
    const fechaInput = document.getElementById("fecha").value;
    const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    if (regex.test(fechaInput)) {
        return fechaInput;
    }
    throw new Error(
        `Formato de fecha inválido: ${fechaInput} . Formato Correcto es: YYYY-MM-dd.`
    );
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
// Metodo para validar que todos los campos esten llenos, antes de enviar el formulario
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

async function enviarFormulario() {
    const camposObligatorios = [
        "fecha",
        "horario",
        "hora",
        "temperatura",
        "responsablenombre",
        "responsableid",
        "cuartoid",
    ];
    if (!validarCamposForm(camposObligatorios)) {
        Swal.fire({
            title: "Error",
            text: "Por favor, complete todos los campos del Formulario antes de guardar los registros.",
            icon: "error",
            showConfirmButton: true,
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
        return;
    }

    try {
        const fechaInput = validarFormatoFecha(
            document.getElementById("fecha").value
        );
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
        });

        return false;
    }
    const fechaInput = document.getElementById("fecha").value;
    const fechaArray = fechaInput.split("-");
    let fecha_mes = `${fechaArray[0]}-${fechaArray[1]}`;

    const dataTemperatura = {
        fecha_mes: fecha_mes,
        cuarto: {
            fecha_registro: fechaInput,
            horario: document.querySelector("#horario").value,
            hora: document.querySelector("#hora").value,
            temperatura: document.querySelector("#temperatura").value,
            observaciones:
                document.querySelector("#observasiones").value ||
                "No hay observaciones.",
            id_responsable: document.querySelector("#responsableid").value,
            id_cuarto: document.querySelector("#cuartoid").value,
        },
    };
    console.log(dataTemperatura);
    try {
        const respuesta = await apiTemeperatura.post(
            "/crear",
            dataTemperatura,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + Token_API,
                },
            }
        );
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

const empleados = async () => {
    const response = await apiEmpleados.get("/obtener-by-rol/Termometrista", {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Token_API,
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
const cuartos = async () => {
    const response = await apiCuartos.get("/obtener", {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Token_API,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }
    const { cuartos } = response.data;
    const cuartoList = document.querySelector("#cuartoList");
    fillDatalist(cuartoList, cuartos);
    handleInput(cuartoList, "nombreCuarto", "cuartoid");
};

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
init();
