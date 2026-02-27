import { AlertManager, ApiService, Url } from "../../helpers/ApiUseManager.js";
import eventManager from "../../helpers/EventsManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

const API_RECEPCION = new ApiService(Url + "/data/recepcion");
const API_PRODUCCION = new ApiService(Url + "/data/produccion");

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

    // Limpiar el data-id del botón al inicio
    elementsRecepcion.btnPDF.setAttribute("data-id", "");
    elementsRecepcion.btnPDF.setAttribute("disabled", "true");

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
            // Mantener el botón deshabilitado
            elementsRecepcion.btnPDF.setAttribute("disabled", "true");
            elementsRecepcion.btnPDF.setAttribute("hidden", "true");
            return;
        }

        const { recepciones, conteos } = response.data;
        console.log("Datos recibidos:", response.data);

        // Validar que realmente haya datos
        if (!recepciones || recepciones.length === 0) {
            console.warn("No hay recepciones para la orden:", idOrden);
            elementsRecepcion.btnPDF.setAttribute("data-id", ""); // Limpiar ID
            elementsRecepcion.btnPDF.setAttribute("disabled", "true");
            elementsRecepcion.btnPDF.setAttribute("hidden", "true");

            alerts.show({
                success: false,
                message: "No hay datos de recepción para esta orden",
            });
            return;
        }

        // Solo asignar el ID si hay datos válidos
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
        console.error("Error en cargarRecepcion:", error);
        // Limpiar el botón en caso de error
        elementsRecepcion.btnPDF.setAttribute("data-id", "");
        elementsRecepcion.btnPDF.setAttribute("disabled", "true");
        elementsRecepcion.btnPDF.setAttribute("hidden", "true");

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            showConfirmButton: true,
        });
    }
}

function validarContenedor() {
    const containerCards = document.querySelector("#informes");
    const listCards = containerCards.querySelectorAll("#card-recepcion");

    if (listCards.length === 0) {
        console.log("ingreso");
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

// Creamos las tarjetas de presentación de la recepción.
function crearTarjeta(data) {
    const card = document.createElement("div");
    card.className = "card-recepcion mt-2 mb-1 position-relative";
    card.setAttribute("data-fecha", `${data.Procedimiento}`);
    card.style.flex = "1 1 800px";
    card.style.maxWidth = "800px";
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
    img.style.height = "380px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "10px";

    card.appendChild(img);

    // Contenedor derecho
    const rightContainer = document.createElement("div");
    rightContainer.style.display = "flex";
    rightContainer.style.flexDirection = "column";

    // Navegación de tabs modificada
    const nav = `
    <ul class="nav nav-tabs mb-2" id="prodTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active text-dark" id="general-tab${data.id}" data-bs-toggle="tab" data-bs-target="#general${data.id}"
            type="button" role="tab">Info General</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="variablesRecpcion-tab${data.id}" data-bs-toggle="tab" data-bs-target="#variablesRecpcion${data.id}"
            type="button" role="tab">Visual</button>
      </li> 
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="defectos-tab${data.id}" data-bs-toggle="tab" data-bs-target="#defectos${data.id}"
            type="button" role="tab">Defectos (${data.Detalles?.length || 0})</button>
      </li>
    </ul>
    `;

    rightContainer.innerHTML = nav;

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content mt-2";
    tabContent.id = `content${data.id}`;

    // Tab 1: Información General
    const tabPaneGeneral = document.createElement("div");
    tabPaneGeneral.className = "tab-pane fade show active";
    tabPaneGeneral.id = `general${data.id}`;

    // Tab 2: Variables Visuales
    const tabPaneVisuales = document.createElement("div");
    tabPaneVisuales.className = "tab-pane fade";
    tabPaneVisuales.id = `variablesRecpcion${data.id}`;

    // Tab 3: Lista de Defectos
    const tabPaneDefectos = document.createElement("div");
    tabPaneDefectos.className = "tab-pane fade";
    tabPaneDefectos.id = `defectos${data.id}`;

    // Contenido de Variables Visuales
    const featuresList = document.createElement("ul");
    featuresList.style.listStyle = "disc inside";
    featuresList.style.marginBottom = "22px";
    featuresList.style.color = "#555";
    featuresList.style.fontSize = "0.95rem";
    [
        "Color: " + (data.Color || "-"),
        "Olor: " + (data.Olor || "-"),
        "Estado: " + (data.Estado || "-"),
        "Cumple: " + (data.Cumple || "-"),
    ].forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        featuresList.appendChild(li);
    });

    tabPaneVisuales.appendChild(featuresList);

    // Contenido de Lista de Defectos
    if (data.Detalles && data.Detalles.length > 0) {
        const defectosContainer = document.createElement("div");
        defectosContainer.className = "defectos-container";

        const totalDefectos = data.Detalles.reduce(
            (sum, detalle) => sum + parseFloat(detalle.cantidad),
            0,
        );

        const resumenDefectos = document.createElement("div");
        resumenDefectos.className = "alert alert-info mb-3";
        resumenDefectos.style.fontSize = "0.9rem";
        resumenDefectos.innerHTML = `
            <strong>📊 Resumen de defectos:</strong><br>
            • Total de tipos de defectos: <strong>${data.Detalles.length}</strong><br>
            • Cantidad total de defectos: <strong>${totalDefectos} kg</strong><br>
            • Porcentaje sobre total recibido: <strong>${((totalDefectos / data.Total) * 100).toFixed(2)}%</strong>
        `;
        defectosContainer.appendChild(resumenDefectos);

        // Tabla de defectos
        const tablaDefectos = document.createElement("table");
        tablaDefectos.className = "table table-hover table-sm mt-2";
        tablaDefectos.style.fontSize = "0.85rem";
        tablaDefectos.innerHTML = `
            <thead class="table-dark">
                <tr>
                    <th style="width: 10%">#</th>
                    <th style="width: 60%">Tipo de Defecto</th>
                    <th style="width: 15%">Cantidad (kg)</th>
                    <th style="width: 15%">% Defectos</th>
                </tr>
            </thead>
            <tbody>
                ${data.Detalles.map(
                    (detalle, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${detalle.defecto}</td>
                        <td class="text-end">${detalle.cantidad}</td>
                        <td class="text-end">${((detalle.cantidad / totalDefectos) * 100).toFixed(2)}%</td>
                    </tr>
                `,
                ).join("")}
                <tr class="table-secondary fw-bold">
                    <td colspan="2">TOTAL</td>
                    <td class="text-end">${totalDefectos}</td>
                    <td class="text-end">100%</td>
                </tr>
            </tbody>
        `;
        defectosContainer.appendChild(tablaDefectos);
        tabPaneDefectos.appendChild(defectosContainer);
    } else {
        const sinDefectos = document.createElement("div");
        sinDefectos.className = "alert alert-success";
        sinDefectos.style.fontSize = "0.9rem";
        sinDefectos.innerHTML = `
            <strong>✅ Sin defectos</strong><br>
            No se registraron defectos en esta recepción.
        `;
        tabPaneDefectos.appendChild(sinDefectos);
    }

    // Tabla técnica (Info General)
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

    // Cuerpo tabla con datos
    const tbody = document.createElement("tbody");
    [
        ["Fecha Recepción", data.Procedimiento || "-"],
        ["Fecha Proceso", data.Fecha || "-"],
        ["Brix", data.Brix || "-"],
        ["Lote", data.Lote || "-"],
        ["Producto", data.Producto || "-"],
        ["Total Materia Prima", `${data.Total} Kg` || "-"],
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

    // Agregar todos los tabs al contenedor
    tabContent.appendChild(tabPaneGeneral);
    tabContent.appendChild(tabPaneVisuales);
    tabContent.appendChild(tabPaneDefectos);
    rightContainer.appendChild(tabContent);

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

// Función para buscar órdenes
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

    try {
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
            orden.Lote.toLowerCase().includes(query),
        );

        if (resultados.length === 0) {
            const noResults = document.createElement("div");
            noResults.className = "suggestion-item text-muted";
            noResults.textContent = "No se encontraron resultados";
            suggestions.appendChild(noResults);
            return;
        }

        resultados.forEach((orden) => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = orden.Lote;
            div.addEventListener("click", async () => {
                elementsRecepcion.inputSearch.value = orden.Lote;
                await cargarRecepcion(orden.id);
                suggestions.innerHTML = "";
            });
            suggestions.appendChild(div);
        });
    } catch (error) {
        console.error("Error en buscarOrdenes:", error);
        alerts.show({
            success: false,
            message: "Error al buscar órdenes",
        });
    }
}

// Event Listeners
if (elementsRecepcion.inputSearch) {
    elementsRecepcion.inputSearch.addEventListener(
        "input",
        debounce(buscarOrdenes, 300),
    );
} else {
    console.warn("El Search para la fecha no se encontró en el DOM.");
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
        "#informes .card-recepcion",
    );
    let visibleCount = 0;

    contenedorCards.forEach((card) => {
        const fechaCard = card.getAttribute("data-fecha");
        if (fecha === "" || fechaCard === fecha) {
            card.removeAttribute("hidden");
            visibleCount++;
        } else {
            card.setAttribute("hidden", "true");
        }
    });

    // Mostrar mensaje si no hay resultados
    const noResultsMsg = document.getElementById("no-results-message");
    if (visibleCount === 0 && fecha !== "") {
        if (!noResultsMsg) {
            const msg = document.createElement("div");
            msg.id = "no-results-message";
            msg.className = "alert alert-warning mt-3";
            msg.textContent = "No hay recepciones para la fecha seleccionada";
            document.getElementById("informes").appendChild(msg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function limpiarfiltrar() {
    const contenedorCards = document.querySelectorAll(
        "#informes .card-recepcion",
    );
    contenedorCards.forEach((card) => {
        card.removeAttribute("hidden");
    });

    // Remover mensaje de no resultados si existe
    const noResultsMsg = document.getElementById("no-results-message");
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Generar PDF - MODIFICADO para abrir en nueva pestaña Y filtrar por fecha
if (elementsRecepcion.btnPDF) {
    elementsRecepcion.btnPDF.addEventListener("click", async (e) => {
        // 1. Obtener el ID del botón
        const id = elementsRecepcion.btnPDF.getAttribute("data-id");

        // 2. Validar que el ID NO sea null o vacío
        if (!id || id === "null" || id === "undefined") {
            console.warn("ID de orden no disponible:", id);
            alerts.show({
                success: false,
                message: "No hay datos cargados. Busque una orden primero.",
            });
            return;
        }

        // 3. Validar que el ID sea un número válido
        if (isNaN(id) || id <= 0) {
            console.error("ID de orden inválido:", id);
            alerts.show({
                success: false,
                message: "ID de orden inválido. Por favor, recargue la página.",
            });
            return;
        }

        try {
            // Mostrar loading
            const loadingSwal = Swal.fire({
                title: "Generando PDF...",
                text: "Por favor espere",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // Obtener el valor del filtro de fecha
            const fechaFiltro = elementsRecepcion.inputFecha.value;
            
            // Obtener datos del servidor
            const res = await API_RECEPCION.get(`/obtener/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            const { recepciones, conteos } = res.data;
            
            // Filtrar recepciones por fecha si hay filtro aplicado
            let recepcionesFiltradas = recepciones;
            if (fechaFiltro) {
                recepcionesFiltradas = recepciones.filter(recepcion => 
                    recepcion.Procedimiento === fechaFiltro
                );
                
                // Si no hay recepciones para la fecha filtrada, mostrar alerta
                if (recepcionesFiltradas.length === 0) {
                    loadingSwal.close();
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin datos',
                        text: `No hay recepciones para la fecha ${fechaFiltro}.`,
                        showConfirmButton: true
                    });
                    return;
                }
            }
            
            // Recalcular conteos si hay filtro de fecha
            let conteosFiltrados = conteos;
            if (fechaFiltro && recepcionesFiltradas.length > 0) {
                const totalFiltrado = recepcionesFiltradas.reduce((sum, rec) => 
                    sum + parseFloat(rec.Total || 0), 0);
                
                const defectosFiltrados = recepcionesFiltradas.reduce((sum, rec) => 
                    sum + parseFloat(rec.Cantidad || 0), 0);
                
                // Obtener todos los defectos de las recepciones filtradas
                const todosDefectos = recepcionesFiltradas.flatMap(rec => 
                    rec.Detalles || []);
                
                const defectosAgrupados = {};
                todosDefectos.forEach(defecto => {
                    if (defectosAgrupados[defecto.defecto]) {
                        defectosAgrupados[defecto.defecto] += parseFloat(defecto.cantidad || 0);
                    } else {
                        defectosAgrupados[defecto.defecto] = parseFloat(defecto.cantidad || 0);
                    }
                });
                
                conteosFiltrados = [{
                    lotes: recepcionesFiltradas.length,
                    total: totalFiltrado,
                    defectos: defectosFiltrados,
                    tipos_defectos: Object.keys(defectosAgrupados).length
                }];
            }
            
            // Crear el objeto de datos filtrados para el PDF
            const datosParaPDF = {
                recepciones: recepcionesFiltradas,
                conteos: conteosFiltrados
            };

            // Enviar solo los datos filtrados al servidor
            const response = await fetch("/reporte-recepcion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify(datosParaPDF),
            });

            loadingSwal.close();

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                // ABRIR PDF EN NUEVA PESTAÑA
                const newWindow = window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );
                
                if (newWindow) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Abrir PDF',
                        text: 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.',
                        showConfirmButton: true
                    });
                }
            } else {
                const errorText = await response.text();
                console.error("Error al generar PDF:", errorText);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo generar el PDF. Intente nuevamente.",
                });
            }
        } catch (error) {
            console.error("Error al generar PDF:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Error: ${error.message}`,
            });
        }
    });
}

// Inicializar eventos de notificaciones
notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);

    // Mostrar notificación con Toast
    if (notificacion.type === "recepcion_nueva") {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Nueva recepción",
            text: `Se ha registrado una nueva recepción en la orden ${notificacion.data?.orden}`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
};

// Inicializar la página
validarContenedor();

// Función para inicializar eventos si es necesario
export function initRecepcion() {
    console.log("Módulo de recepción inicializado");

    // Si hay un parámetro de orden en la URL, cargarlo automáticamente
    const urlParams = new URLSearchParams(window.location.search);
    const ordenId = urlParams.get("orden");

    if (ordenId && !isNaN(ordenId)) {
        setTimeout(() => {
            cargarRecepcion(parseInt(ordenId));
        }, 500);
    }
}

// Si este script se carga directamente, inicializar
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRecepcion);
} else {
    initRecepcion();
}
