<div class="d-flex justify-content-between align-items-center mb-2 mt-1">
    <div class="d-flex align-items-center">
        <p class="text-dark mb-0 me-2">Dashboard</p>
        <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
            <span class="me-1">/</span>
            <i class="fas fa-home text-secondary me-1"></i>
            <span>Inicio</span>
        </a>
    </div>
    
    <div class="d-flex gap-2">
        <!-- Botón de Generar Excel -->
        <button class="btn btn-excel d-flex align-items-center" id="btnGenerarExcel" style="background-color: #198754; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500;">
            <i class="fas fa-file-excel me-2" style="font-size: 16px;"></i>
            Generar Excel
        </button>

        <!-- Botón de Generar PDF -->
        <button class="btn btn-pdf d-flex align-items-center" id="btnGenerarPDF" style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500;">
            <i class="fas fa-file-pdf me-2" style="font-size: 16px;"></i>
            Generar PDF
        </button>
    </div>
</div>

<div>
    <div class="container-fluid p-2 mt-4">
        <div class="row d-flex justify-content-between mt-3">
            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="card-title-proyeccion">Contenedores</div>
                <div class="card-value-proyeccion" style="color:#74820c" id="contenedoresTotal">-</div>
                <div class="card-subtitle-proyeccion" id="ano1"></div>
            </div>

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="container-fluid">
                    <div class="card-title-proyeccion">Producciones</div>
                    <div class="card-value-proyeccion" style="color:#6c780d" id="produccionesTotal">-</div>
                    <div class="card-subtitle-proyeccion" id="ano2"></div>
                </div>
            </div>

            <div class="card-dashboard col mx-2 p-3 rounded-3 shadow" style="border: 1px solid #fff">
                <div class="container-fluid">
                    <div class="card-title-proyeccion">Cajas Producidas</div>
                    <div class="card-value-proyeccion" style="color:#6c780d" id="cajasTotal">-</div>
                    <div class="card-subtitle-proyeccion" id="ano3"></div>
                </div>
            </div>
        </div>

        <div class="row d-flex justify-content-center mt-4">
            <div class="col-12 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Contenedores Producidos En El Año.</h5>
                    <div class="container-contenedores sub-container-rechazo">
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
                    <p class="subtitle">Platano Verde Procesado por contenedor.</p>
                    <div class="container-materia sub-container-rechazo">
                        <svg id="container"></svg>
                    </div>
                    <div class="tooltip" id="tooltipMateria"></div>
                </div>
            </div>
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Información de Proveedores.</h5>
                    <p class="subtitle">Proveedores de Platano Verde en el Año.</p>
                    <div class="container-proveedores sub-container-rechazo">
                        <svg id="proveedores"></svg>
                    </div>
                    <div class="tooltip" id="tooltipProveedores"></div>
                </div>
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
                            <button id="back-button-cajas" class="btn back-button-chart">← Volver a categorías principales</button>
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
                            <button id="back-button-rechazo" class="btn back-button-chart">← Volver a categorías principales</button>
                        </div>
                    </div>
                    <div class="container-rechazo sub-container-rechazo">
                        <svg id="rechazoContenedores"></svg>
                    </div>
                </div>
                <div class="tooltip" id="tooltip"></div>
            </div>
        </div>

        {{-- Indicadores de calidad --}}
        <div class="row d-flex justify-content-between mt-4">
            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Recepción y Alistamiento de Materia Prima.</h5>
                    <p class="subtitle">
                        Rendimiento por lote de proveedor, comparando materia útil vs rechazo y maduro.
                    </p>
                    <div class="container-calidad-recepcion sub-container-rechazo">
                        <svg id="graficaRecepcionAlistamiento"></svg>
                    </div>
                    <div class="tooltip" id="tooltipRecepcionAlistamiento"></div>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Control de Fritura.</h5>
                    <p class="subtitle">
                        Variables clave del proceso de fritura por lote de producción.
                    </p>
                    <div class="container-calidad-fritura sub-container-rechazo">
                        <svg id="graficaControlFritura"></svg>
                    </div>
                    <div class="tooltip" id="tooltipControlFritura"></div>
                </div>
            </div>
        </div>

        <div class="row d-flex justify-content-center mt-3">
            <div class="col-12 mb-3">
                <div class="container-chart">
                    <h5 class="fw-bold mb-3">Verificación de Empaque y Peso.</h5>
                    <p class="subtitle">
                        Distribución de pesos por lote y tipo de empaque / paquete verificados.
                    </p>
                    <div class="container-calidad-empaque sub-container-rechazo">
                        <svg id="graficaVerificacionEmpaque"></svg>
                    </div>
                    <div class="tooltip" id="tooltipVerificacionEmpaque"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Estilos adicionales para los botones PDF y Excel -->
<style>
    .btn-pdf {
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
    }
    
    .btn-pdf:hover {
        background-color: #c82333 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    .btn-pdf:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
    }
    
    .btn-pdf i {
        transition: transform 0.3s ease;
    }
    
    .btn-pdf:hover i {
        transform: scale(1.1);
    }

    .btn-excel {
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(25, 135, 84, 0.2);
    }

    .btn-excel:hover {
        background-color: #157347 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(25, 135, 84, 0.3);
    }

    .btn-excel:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(25, 135, 84, 0.2);
    }

    .btn-excel i {
        transition: transform 0.3s ease;
    }

    .btn-excel:hover i {
        transform: scale(1.1);
    }
</style>

<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>