<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Dashobard</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1">

        </i>
        <span>Inicio</span>
    </a>
</div>
<div>

    <div class="container-fluid p-2 mt-4">

        <div class="row d-flex justify-content-end">
            <div class="col-4">
                <input type="month" name="filtro" id="filtro" class="form-control form-control-sm rounded-3 text-center shadow-sm">
            </div>
        </div>
        <div class="row d-flex justify-content-between mt-3">

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="card-title-proyeccion">Contenedores</div>
                <div class="card-value-proyeccion" style="color:#74820c" id="contenedoresTotal">-</div>
                <div class="card-subtitle-proyeccion" id="ano">AÑO 2025</div>
            </div>

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="container-fluid">
                    <div class="card-title-proyeccion">Producciones</div>
                    <div class="card-value-proyeccion" style="color:#6c780d" id="produccionesTotal">-</div>
                    <div class="card-subtitle-proyeccion" id="ano">AÑO 2025</div>
                </div>
            </div>

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="container-fluid">
                    <div class="card-title-proyeccion">Cajas Producidas</div>
                    <div class="card-value-proyeccion" style="color:#6c780d" id="cajasTotal">-</div>
                    <div class="card-subtitle-proyeccion" id="ano">AÑO 2025</div>
                </div>
            </div>

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="container-fluid">
                    <div class="row mb-4 mt-3">
                        <div class="col">TITLE</div>
                        <div class="col text-end"> <i class="fa-solid fa-circle-info fs-3 text-info"></i></div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12 jjustify-content p-2">
                            <h3>$7500 </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row d-flex justify-content-center mt-4">
            <div class="col-12 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3"> Contenedores Producidos En El Año.</h5>
                    <div class="container-contenedores  sub-container-rechazo">
                        <svg id="contenedores"></svg>
                    </div>
                    <div class="tooltip" id="tooltipContenedor"></div>
                </div>
            </div>
        </div>

        <div class="row d-flex justify-content-between mt-3">
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Materia Prima - Contenedor.</h5>
                    <p class="subtitle">
                        Platano Verde Procesado por contenedor.
                    </p>
                    <div class="container-materia  sub-container-rechazo">
                        <svg id="container"></svg>
                    </div>
                    <div class="tooltip" id="tooltipMateria"></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Información de Proveedores.</h5>
                    <p class="subtitle" >
                        Proveedores de Platano Verde en el Año.
                    </p>
                    <div class="container-proveedores sub-container-rechazo">
                        <svg id="proveedores"></svg>
                    </div>
                </div>
                <div class="tooltip" id="tooltipProveedores"></div>
            </div>
        </div>

        <div class="row d-flex justify-content-between mt-3">
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Cajas Producidas - Contenedores.</h5>
                    <div class="row">
                        <div class="col-7">
                            <p class="subtitle" id="subtitle-cajas">
                                Haz clic en una barra para ver su desglose detallado.
                            </p>
                        </div>
                        <div class="col text-end">
                            <button id="back-button-cajas" class="btn back-button-chart">← Volver a
                                categorías
                                principales
                            </button>
                        </div>
                    </div>

                    <div class="container-cajas sub-container-rechazo">
                        <svg id="cajasContenedor"></svg>
                    </div>

                </div>
                <div class="tooltip" id="tooltipCajas"></div>
            </div>
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Rechazo o Perdidas - Contenedores.</h5>
                    <div class="row">
                        <div class="col-7">
                            <p class="subtitle" id="subtitle">
                                Haz clic en una barra para ver su desglose detallado.
                            </p>
                        </div>
                        <div class="col text-end">
                            <button id="back-button-rechazo" class="btn back-button-chart">← Volver a
                                categorías
                                principales
                            </button>
                        </div>
                    </div>
                    <div class="container-rechazo sub-container-rechazo">
                        <svg id="rechazoContenedores"></svg>
                    </div>
                </div>
                <div class="tooltip" id="tooltip"></div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>