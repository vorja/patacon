import { Url } from "../../helpers/ApiUseManager.js";
import notificationManager from "../../helpers/NotificacionesManger.js";

var today = new Date();
var year = today.getFullYear();

const token = document.querySelector('meta[name="jwt"]').getAttribute("content");

const url = Url + `/data/dashboard/obtener-materia/${year}`;

document.getElementById("ano1").textContent = year;
document.getElementById("ano2").textContent = year;
document.getElementById("ano3").textContent = year;

const info_globlal = {
    cajasData: 0,
    contenedoresData: 0,
    hierarchicalData: 0,
    proveedorData: 0,
    materiaConenedores: 0,
};

let selectedCategory = null;
let selectedTipoCajas = null;

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", function (e) {
        if (e.target.matches("#back-button-cajas")) {
            console.log("cajas");
            selectedTipoCajas = null;
            updateViewCajas();
        }
        if (e.target.matches("#back-button-rechazo")) {
            console.log("rechazo");
            selectedCategory = null;
            updateViewRechazo();
        }
    });
});

// Información.
const asignarInfo = (data) => {
    $("#contenedoresTotal").text(`${data.contenedores ?? 0}`);
    $("#produccionesTotal").text(`${data.producciones ?? 0}`);
    $("#cajasTotal").text(`${data.cajas ?? 0}`); /* 
    $("#totalCajas").text(`${data.total_cajas ?? 0}`); */
};

function drawChart(data) {
    // Obtener dimensiones del contenedor
    const container = document.querySelector(".container-materia");
    const containerWidth = container.offsetWidth;

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, data.length * 40);

    const svg = d3
        .select("#container")
        .attr("width", width)
        .attr("height", height);

    if (!data || data.length === 0) return; // nada que mostrar
    svg.selectAll("*").remove();

    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.contenedor))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.gasto)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")));

    const tooltip = d3.select("#tooltipMateria");

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.contenedor))
        .attr("y", (d) => y(d.gasto))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - margin.bottom - y(d.gasto))
        .attr("fill", "#B7CC93")
        .on("mouseover", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(
                    `<strong>${
                        d.contenedor
                    }</strong><br/>Valor: ${d.gasto.toLocaleString()}`,
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Contenedores");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Gasto de Materia Prima");
}

// ========================= //
//   RECHAZO POR CONTENEDOR  //
// ========================= //

function drawChartBarRechazo() {
    const { hierarchicalData } = info_globlal;
    // Configuración del gráfico
    d3.select("#rechazoContenedores").selectAll("*").remove();
    let data;
    if (!selectedCategory) {
        data = hierarchicalData.children.map((d) => ({
            name: d.name,
            value: d3.sum(d.children, (child) => child.value),
            isCategory: true,
        }));
    } else {
        const category = hierarchicalData.children.find(
            (d) => d.name === selectedCategory,
        );
        data = category
            ? category.children.map((d) => ({ ...d, isCategory: false }))
            : [];
    }

    // Ordenar datos de mayor a menor
    data.sort((a, b) => b.value - a.value);

    // Obtener dimensiones del contenedor
    const container = document.querySelector(".container-rechazo");
    const containerWidth = container.offsetWidth;

    // Configuración del gráfico responsive
    const margin = { top: 20, right: 100, bottom: 30, left: 80 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, data.length * 40);

    // Crear SVG
    const svg = d3
        .select("#rechazoContenedores")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([0, width]);

    const y = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, height])
        .padding(0.2);

    // Grid vertical
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(x).tickSize(-height).tickFormat(""));

    // Eje X superior
    svg.append("g")
        .call(
            d3.axisTop(x).tickFormat((d) => {
                if (d >= 1000) return d / 1000 + "k";
                return d;
            }),
        )
        .selectAll("text")
        .attr("class", "axis-label");

    // Eje Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label")
        .style("font-size", "12px")
        .style("fill", "#333");

    // Escala de colores
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range([
            "#6c780d",
            "#B7CC93",
            "#CCD1C0",
            "#F29B38",
            "#C9AE85",
            "#ec670a",
        ]);

    // Tooltip
    const tooltip = d3.select("#tooltip");

    // Crear barras
    const bars = svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.name))
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", color)
        .style("cursor", (d) => (d.isCategory ? "pointer" : "default"))
        .on("mouseover", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(
                    `<strong>${
                        d.name
                    }</strong><br/>Valor: ${d.value.toLocaleString()}`,
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            if (d.isCategory) {
                selectedCategory = d.name;
                updateViewRechazo();
            }
        });

    // Animación de entrada
    bars.transition()
        .duration(800)
        .attr("width", (d) => x(d.value));

    // Etiquetas de valor al final de cada barra
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => x(d.value) + 5)
        .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("fill", "#666")
        .text((d) => d.value.toLocaleString())
        .style("opacity", 0)
        .transition()
        .delay(800)
        .duration(400)
        .style("opacity", 1);
}

// ========================= //
//   CAJAS POR CONTENEDOR    //
// ========================= //

function drawChartBarCajas() {
    const { cajasData } = info_globlal;

    // Configuración del gráfico
    d3.select("#cajasContenedor").selectAll("*").remove();
    let data;
    if (!selectedTipoCajas) {
        data = cajasData.children.map((d) => ({
            name: d.name,
            value: d3.sum(d.children, (child) => child.value),
            isCategory: true,
        }));
    } else {
        const category = cajasData.children.find(
            (d) => d.name === selectedTipoCajas,
        );
        data = category
            ? category.children.map((d) => ({ ...d, isCategory: false }))
            : [];
    }

    // Ordenar datos de mayor a menor
    data.sort((a, b) => b.value - a.value);

    // Obtener dimensiones del contenedor
    const container = document.querySelector(".container-cajas");
    const containerWidth = container.offsetWidth;

    // Configuración del gráfico responsive
    const margin = { top: 20, right: 100, bottom: 30, left: 80 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, data.length * 40);

    // Crear SVG
    const svg = d3
        .select("#cajasContenedor")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([0, width]);

    const y = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, height])
        .padding(0.2);

    // Grid vertical
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(x).tickSize(-height).tickFormat(""));

    // Eje X superior
    svg.append("g")
        .call(
            d3.axisTop(x).tickFormat((d) => {
                if (d >= 1000) return d / 1000 + "k";
                return d;
            }),
        )
        .selectAll("text")
        .attr("class", "axis-label");

    // Eje Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label")
        .style("font-size", "12px")
        .style("fill", "#333");

    // Escala de colores
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(["#a98d6dff"]);

    // Tooltip
    const tooltip = d3.select("#tooltipCajas");

    // Crear barras
    const bars = svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.name))
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", color)
        .style("cursor", (d) => (d.isCategory ? "pointer" : "default"))
        .on("mouseover", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(
                    `<strong>${
                        d.name
                    }</strong><br/>Valor: ${d.value.toLocaleString()}`,
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        })
        .on("click", function (event, d) {
            if (d.isCategory) {
                selectedTipoCajas = d.name;
                updateViewCajas();
            }
        });

    // Animación de entrada
    bars.transition()
        .duration(800)
        .attr("width", (d) => x(d.value));

    // Etiquetas de valor al final de cada barra
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => x(d.value) + 5)
        .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("fill", "#666")
        .text((d) => d.value.toLocaleString())
        .style("opacity", 0)
        .transition()
        .delay(800)
        .duration(400)
        .style("opacity", 1);
}

// =========================      //
//   PROVEEDORES DE MATERIA PRIMA //
// =========================     //

function drawChartBarProveedores() {
    const { proveedorData } = info_globlal;

    d3.select("#proveedores").selectAll("*").remove();

    let data;

    data = proveedorData.materia.map((d) => ({
        name: d.name,
        value: d3.sum(d.materia, (child) => child.value),
        isCategory: true,
    }));

    // Ordenar datos de mayor a menor
    data.sort((a, b) => b.value - a.value);

    // Obtener dimensiones del contenedor
    const container = document.querySelector(".container-proveedores");
    const containerWidth = container.offsetWidth;

    // Configuración del gráfico responsive
    const margin = { top: 20, right: 100, bottom: 30, left: 80 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, data.length * 40);

    // Crear SVG
    const svg = d3
        .select("#proveedores")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([0, width]);

    const y = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, height])
        .padding(0.2);

    // Grid vertical
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(x).tickSize(-height).tickFormat(""));

    // Eje X superior
    svg.append("g")
        .call(
            d3.axisTop(x).tickFormat((d) => {
                if (d >= 1000) return d / 1000 + "k";
                return d;
            }),
        )
        .selectAll("text")
        .attr("class", "axis-label");

    // Eje Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label")
        .style("font-size", "9px")
        .style("fill", "#333");

    // Escala de colores
    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(["#6c780d"]);

    // Tooltip
    const tooltip = d3.select("#tooltipProveedores");

    // Crear barras
    const bars = svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(d.name))
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", color)
        .style("cursor", (d) => (d.isCategory ? "pointer" : "default"))
        .on("mouseover", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(
                    `<strong>${
                        d.name
                    }</strong><br/>Valor: ${d.value.toLocaleString()}`,
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

    // Animación de entrada
    bars.transition()
        .duration(700)
        .attr("width", (d) => x(d.value));

    // Etiquetas de valor al final de cada barra
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => x(d.value) + 5)
        .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text((d) => d.value.toLocaleString())
        .style("opacity", 0)
        .transition()
        .delay(800)
        .duration(400)
        .style("opacity", 1);
}

// ========================= //
//   CONTENEDORES EN EL AÑO  //
// ========================= //

function drawChartBarContenedores() {
    const { contenedoresData } = info_globlal;

    const container = document.querySelector(".container-contenedores");
    const containerWidth = container.offsetWidth;

    const margin = { top: 40, right: 0, bottom: 50, left: 60 };
    const width = Math.max(600, containerWidth - margin.left - margin.right);
    const height = Math.max(400, contenedoresData.length * 40);

    const svg = d3
        .select("#contenedores")
        .attr("width", width)
        .attr("height", height);

    if (!contenedoresData || contenedoresData.length === 0) return; // nada que mostrar
    svg.selectAll("*").remove();

    const x = d3
        .scaleBand()
        .domain(contenedoresData.map((d) => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(contenedoresData, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .style("font-size", "12px")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")));

    const tooltip = d3.select("#tooltipMateria");
    const color = d3
        .scaleOrdinal()
        .domain(contenedoresData.map((d) => d.name))
        .range([
            "#6c780d", // Enero
            "#B7CC93", // Febrero
            "#CCD1C0", // Marzo
            "#C9AE85", // Abril
            "#F29B38", // Mayo
            "#ec670a", // Junio
            "#9A6C0D", // Julio
            "#D4B96F", // Agosto
            "#A3B54D", // Septiembre
            "#E07A3F", // Octubre
            "#B58C6C", // Noviembre
            "#7C5E3A", // Diciembre
        ]);
    svg.selectAll(".bar")
        .data(contenedoresData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.name))
        .attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - margin.bottom - y(d.value))
        .attr("fill", color)
        .on("mouseover", function (event, d) {
            tooltip
                .style("opacity", 1)
                .html(
                    `<strong>${
                        d.name
                    }</strong><br/>Valor: ${d.value.toLocaleString()}`,
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Contenedores Producidos");
}

async function fetchAndDraw() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: "Bearer " + token },
        });

        const dataContenedor = await response.json();

        if (dataContenedor.success) {
            const {
                cajasData,
                contenedoresData,
                hierarchicalData,
                proveedorData,
                materiaConenedores,
            } = dataContenedor.data;

            const { info, materiaPrima } = materiaConenedores;

            // Asignar los datos al objeto global
            info_globlal.hierarchicalData = hierarchicalData;
            info_globlal.cajasData = cajasData;
            info_globlal.proveedorData = proveedorData;
            info_globlal.contenedoresData = contenedoresData;

            // AHORA SÍ dibujar las gráficas después de tener los datos
            drawChart(materiaPrima);
            asignarInfo(info);
            drawChartBarRechazo();
            drawChartBarCajas();
            drawChartBarProveedores();
            drawChartBarContenedores();
        } else {
            console.log("Ocurrió un error");
        }
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
    }
}

// Actualizar vistas
function updateViewCajas() {
    const backButton = document.getElementById(`back-button-cajas`);
    const subtitle = document.getElementById("subtitle-cajas");

    if (selectedTipoCajas) {
        backButton.classList.add("visible");
        subtitle.textContent = `Desglose de ${selectedTipoCajas}`;
    } else {
        backButton.classList.remove("visible");
        subtitle.textContent =
            "Haz clic en una barra para ver su desglose detallado";
    }

    drawChartBarCajas();
}

function updateViewRechazo() {
    const backButton = document.getElementById(`back-button-rechazo`);
    const subtitle = document.getElementById("subtitle");

    if (selectedCategory) {
        backButton.classList.add("visible");
        subtitle.textContent = `Desglose de ${selectedCategory}`;
    } else {
        backButton.classList.remove("visible");
        subtitle.textContent =
            "Haz clic en una barra para ver su desglose detallado";
    }
    drawChartBarRechazo();
}

window.addEventListener("resize", function () {
    drawChartBarRechazo();
    drawChartBarCajas();
    drawChartBarProveedores();
    drawChartBarContenedores();
});

fetchAndDraw();

setInterval(fetchAndDraw, 10 * 60 * 1000);

notificationManager.onNewNotification = (notificacion) => {
    console.log("Nueva notificación recibida:", notificacion);
};
