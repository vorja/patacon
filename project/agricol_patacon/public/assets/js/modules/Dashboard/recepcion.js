import { AlertManager, ApiService } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_RECEPCION = new ApiService("http://localhost:3105/data/recepcion");
const API_PRODUCCION = new ApiService("http://localhost:3105/data/produccion");
const alerts = new AlertManager();

const elementsRecepcion = {
    btnPDF: document.getElementById("btnPDF"),
    inputSearch: document.getElementById("inputSearch"),
    inputFecha: document.getElementById("inputFiltro"),
    limpiarBtn: document.getElementById("limpiarFiltro"),
};

const token = document
    .querySelector('meta[name="jwt"]')
    .getAttribute("content");

async function cargarRecepcion(idOrden) {
    const fragment = new DocumentFragment();
    const contenedor = document.getElementById("informes");
    contenedor.innerHTML = "";
    try {
        const response = await API_RECEPCION.get(`/obtener/${idOrden}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (!response.success) {
            alerts.show(response);
            document
                .getElementById("inputFiltro")
                .setAttribute("disabled", "true");
            document
                .getElementById("limpiarFiltro")
                .setAttribute("disabled", "true");
        }

        const { recepciones, conteos } = response.data;
        asignarConteo(conteos);

        elementsRecepcion.btnPDF.setAttribute("data-id", `${idOrden}`);

        recepciones.forEach((recepcion) => {
            const tarjeta = crearTarjeta(recepcion);
            fragment.appendChild(tarjeta);
        });
        contenedor.appendChild(fragment);

        document.getElementById("inputFiltro").removeAttribute("disabled");
        document.getElementById("limpiarFiltro").removeAttribute("disabled");
        elementsRecepcion.btnPDF.removeAttribute("disabled");
        elementsRecepcion.btnPDF.removeAttribute("hidden");
    } catch (error) {
        Swal.fire({
            icon: "warning",
            title: "Error",
            text: error.message,
            showConfirmButton: false,
            timer: 2400,
        });
    }
}

function validarContenedor() {
    const containerCards = document.querySelector("#informes");
    const listCards = containerCards.querySelectorAll("#card-recepcion");

    if (listCards.length === 0) {

        console.log('ingreso')
        containerCards.innerHTML = "";
        containerCards.innerHTML = `
        
        <div class="content d-flex justify-content gap-3">
                        <img src="/assets/images/logo-clean.png" alt="logo empresa" class="img-fluid mx-auto">
                    </div>
        
        `;
    }
}
const asignarConteo = (data) => {
    const cardRecepcion = {
        Lotes: document.querySelector("#Lotes"),
        Materia: document.querySelector("#Materia"),
        Defectos: document.querySelector("#Defectos"),
    };
    cardRecepcion.Lotes.textContent = parseFloat(data[0].lotes.toFixed(1)) ?? 0;
    cardRecepcion.Materia.textContent = `${
        parseFloat(data[0].total.toFixed(1)) ?? 0
    } kg`;
    cardRecepcion.Defectos.textContent = `${
        parseFloat(data[0].defectos.toFixed(1)) ?? 0
    } kg`;
};
//Creamos las tarjetas de presentación de la recepcion.
function crearTarjeta(data) {
    const card = document.createElement("div");
    card.className = "card-recepcion mt-2 mb-1";
    card.setAttribute("data-fecha", `${data.Procedimiento}`);
    card.style.flex = "1 1 740px";
    card.style.maxWidth = "740px";
    card.style.background = "#fff";
    card.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    card.style.borderRadius = "10px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    card.style.padding = "24px 28px";
    card.style.display = "grid";
    card.style.gridTemplateColumns = "280px 1fr";
    card.style.gap = "32px";
    card.style.color = "#333";

    // Imagen izquierda
    const img = document.createElement("img");
    img.src = `/assets/images/${
        data.Producto.toLowerCase() === "comino"
            ? "platano/comino/comino1.jpeg"
            : "logo-clean.png"
    }`;
    img.alt = data.Producto || "Producto";
    img.style.width = "280px";
    img.style.height = "280px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "10px";

    card.appendChild(img);

    // Contenedor derecho
    const rightContainer = document.createElement("div");
    rightContainer.style.display = "flex";
    rightContainer.style.flexDirection = "column";

    const nav = `
    <ul class="nav nav-tabs mb-2" id="prodTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active text-dark" id="general-tab${data.id}" data-bs-toggle="tab" data-bs-target="#general${data.id}"
            type="button" role="tab">Info General</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link " id="variablesRecpcion-tab${data.id}" data-bs-toggle="tab" data-bs-target="#variablesRecpcion${data.id}"
            type="button" role="tab">Visual </button>
      </li> 
      <li class="nav-item" role="presentation">
        <button class="nav-link " id="pesajeRecepcion-tab${data.id}" data-bs-toggle="tab" data-bs-target="#pesajeRecepcion${data.id}"
            type="button" role="tab">Pesaje</button>
      </li>
    </ul>
    
    `;

    rightContainer.innerHTML = nav;

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content mt-2";
    tabContent.id = `content${data.id}`;

    const tabPaneGeneral = document.createElement("div");
    tabPaneGeneral.className = "tab-pane fade show active";
    tabPaneGeneral.id = `general${data.id}`;

    const tabPaneVisuales = document.createElement("div");
    tabPaneVisuales.className = "tab-pane fade";
    tabPaneVisuales.id = `variablesRecpcion${data.id}`;

    const tabPanepesaje = document.createElement("div");
    tabPanepesaje.className = "tab-pane fade";
    tabPanepesaje.id = `pesajeRecepcion${data.id}`;

    // Card Contenedor de la lista.
    const collapse = document.createElement("div");
    collapse.className = "collapse";
    collapse.id = `lista-${data.Lote}-${data.id}`;

    // Lista de características con datos relevantes
    const featuresList = document.createElement("ul");
    featuresList.style.listStyle = "disc inside";
    featuresList.style.marginBottom = "22px";
    featuresList.style.color = "#555";
    featuresList.style.fontSize = "0.95rem";
    [
        "Color: " + (data.Color || "-"),
        "Olor: " + (data.Olor || "-"),
        "Estado: " + (data.Estado || "-"),
        "Defecto: " + (data.Defectos || "Ninguno"),
        "Cumple: " + (data.Cumple || "-"),
    ].forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        featuresList.appendChild(li);
    });

    tabPaneVisuales.appendChild(featuresList);
    rightContainer.appendChild(tabPaneVisuales);

    // Tabla técnica
    const tabla = document.createElement("table");
    tabla.className = "table table-hover";
    tabla.style.width = "100%";
    tabla.style.borderCollapse = "collapse";
    tabla.style.tableLayout = "auto";
    tabla.style.fontSize = "0.85rem";
    tabla.style.color = "#444";

    // Cabecera tabla
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["ITEMS", "INFORMACIÓN"].forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.background = "#445669";
        th.style.color = "white";
        th.style.padding = "8px";
        th.style.fontWeight = "700";
        th.style.textAlign = "left";
        th.style.borderBottom = "2px solid #355270";
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    tabla.appendChild(thead);

    // Cuerpo tabla con datos estáticos
    const tbody = document.createElement("tbody");
    [
        ["Fecha Recepción", data.Procedimiento || "-"],
        ["Fecha Proceso", data.Fecha || "-"],
        ["Lote", data.Lote || "-"],
        ["Producto", data.Producto || "-"],
        ["Cantidad Def.", `${data.Cantidad} Kg` || "0"],
        ["Materia Prima.", `${data.Total} Kg` || "-"],
        ["Responsable", data.Responsable || "-"],
        ["Proveedor", data.Proveedor || "-"],
    ].forEach((rowData) => {
        const tr = document.createElement("tr");
        rowData.forEach((cellData, idx) => {
            const td = document.createElement("td");
            td.textContent = cellData;
            td.style.padding = "7px 10px";
            td.style.borderBottom = "1px solid #c6cacb";
            if (idx === 0) {
                td.style.fontWeight = "600";
                td.style.color = "#555";
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    tabPaneGeneral.appendChild(tabla);

    tabContent.appendChild(tabPaneGeneral);
    tabContent.appendChild(tabPaneVisuales);
    tabContent.appendChild(tabPanepesaje);
    rightContainer.appendChild(tabContent);

    // Pie de página
    const footer = document.createElement("div");
    footer.style.marginTop = "32px";
    footer.style.fontSize = "0.75rem";
    footer.style.color = "#555";
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";

    rightContainer.appendChild(footer);

    card.appendChild(rightContainer);

    return card;
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

if (elementsRecepcion.inputSearch) {
    elementsRecepcion.inputSearch.addEventListener(
        "input",
        debounce(buscarOrdenes, 300)
    );
} else {
    console.warn("El Search para la fecha no se encontró en el DOM.");
}

async function buscarOrdenes() {
    const suggestions = document.getElementById("suggestions");

    const query = elementsRecepcion.inputSearch.value.toLowerCase();

    if (query === "") {
        suggestions.innerHTML = "";
        return;
    }

    suggestions.innerHTML = "";

    if (query.length === 0) {
        return;
    }

    const response = await API_PRODUCCION.get("/obtener", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });

    if (!response.success) {
        alerts.show(response);
        return false;
    }

    const { data } = response;
    const resultados = data.filter((orden) =>
        orden.Lote.toLowerCase().includes(query)
    );

    resultados.forEach((orden) => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = orden.Lote;
        div.addEventListener("click", async () => {
            inputSearch.value = orden.Lote;
            await cargarRecepcion(orden.id);
            suggestions.innerHTML = "";
        });
        suggestions.appendChild(div);
    });
}

elementsRecepcion.inputFecha.addEventListener("input", () => {
    const fechaSeleccionada = elementsRecepcion.inputFecha.value;
    filtrar(fechaSeleccionada);
});

// Quitar filtro y mostrar todo
elementsRecepcion.limpiarBtn.addEventListener("click", () => {
    elementsRecepcion.inputFecha.value = "";
    limpiarfiltrar();
});

function filtrar(fecha) {
    const contenedorCards = document.querySelectorAll(
        "#informes .card-recepcion"
    );
    contenedorCards.forEach((card) => {
        const fechaCard = card.getAttribute("data-fecha");
        if (fecha === "" || fechaCard === fecha) {
            card.removeAttribute("hidden");
        } else {
            card.setAttribute("hidden", "true");
        }
    });
}
function limpiarfiltrar() {
    const contenedorCards = document.querySelectorAll(
        "#informes .card-recepcion"
    );
    contenedorCards.forEach((card) => {
        card.removeAttribute("hidden");
    });
}

if (elementsRecepcion.btnPDF) {
    elementsRecepcion.btnPDF.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const res = await API_RECEPCION.get(`/obtener/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        });
        const { data } = res;

        const response = await fetch("/reporte-recepcion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "recepcion"); // abre el PDF en nueva pestaña
        } else {
            console.error("Error al generar PDF");
        }
    });
} else {
    console.warn("El PDF no se encontró en el DOM.");
}

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
validarContenedor();
