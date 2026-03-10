<!-- Header -->
<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Producción</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1"></i>
        <span>Inicio</span>
    </a>
</div>
<!-- Tabs -->
<ul class="nav nav-tabs" id="prodTabs" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active text-dark" id="general-tab" data-bs-toggle="tab" data-bs-target="#general"
            type="button" role="tab">Vista General</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link " id="infoContenedor-tab" data-bs-toggle="tab" data-bs-target="#infoContenedor"
            type="button" role="tab">Reporte Contenedor</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link " id="produccion-tab" data-bs-toggle="tab" data-bs-target="#produccion" type="button"
            role="tab">Info Contenedor</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link " id="reportes-tab" data-bs-toggle="tab" data-bs-target="#reportes" type="button"
            role="tab">Reporte Producciones</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link text-dark" id="enviar-tab" data-bs-toggle="tab" data-bs-target="#enviar" type="button"
            role="tab">Enviar</button>
    </li>
</ul>

<div class="tab-content">
    <!-- Vista General -->
    <div class="tab-pane fade show active" id="general" role="tabpanel">
        <div class="card mb-4 mt-4 shadow border-0 rounded-4">
            <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                style="background-color: #6c780d;">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                        style="max-height: 55px;">
                    <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                </div>

                <H3 class="fw-bold text-white m-0">PANEL DE CONTROL - CONTENEDOR</H3>
                <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                    data-bs-toggle="modal" data-bs-target="#ModalProduccion"><i
                        class="fa-solid fa-file-circle-plus fs-4" style="color: #6c780d"></i></button>
            </div>
            <div class="card-body">
                <div class="container-fluid mb-4 g-3">
                    <div class="row">
                        <div class="col-4">
                            <div class="card border-0 shadow p-4 rounded-4" style="background: #ffffff;">

                                <div class="d-flex align-items-center mb-3">
                                    <img src="/assets/images/logo-clean.png" alt="Logo" class="me-2"
                                        style="width: 45px;">
                                    <h5 class="fw-bold mb-0">Orden de Producción</h5>
                                </div>


                                <!-- ORDEN ACTUAL -->
                                <label for="ordenactualHidden"
                                    class="form-label text-secondary fw-semibold">Actual</label>
                                <div class="mb-3">
                                    <span class="badge rounded-pill px-3 py-2"
                                        style="background:#f1f1f1; color:#333; font-size: 1rem;">
                                        <span id="ordenactual"></span>
                                    </span>

                                    <!-- Campo oculto que sigues usando -->
                                    <input type="hidden" id="ordenactualHidden" name="ordenactual">
                                </div>

                                <label for="clienteHidden" class="form-label text-secondary fw-semibold">Cliente</label>
                                <div class="mb-3">
                                    <span class="badge rounded-pill px-3 py-2"
                                        style="background:#f1f1f1; color:#333; font-size: 1rem;">
                                        <span id="clienteActual"></span>
                                    </span>
                                </div>

                                <!-- CAMBIAR ORDEN -->
                                <label for="nombreorden" class="form-label text-secondary fw-semibold">Cambiar a</label>
                                <input type="text" id="nombreorden" name="nombreorden"
                                    class="form-control rounded-3 mb-3" placeholder="Lista de órdenes..."
                                    list="ordenlist">

                                <input type="hidden" id="ordenid" name="ordenid">
                                <datalist id="ordenlist"></datalist>

                                <!-- BOTÓN -->
                                <button class="btn text-white fw-bold py-2 rounded-3 w-100 fs-6"
                                    style="background-color:#ec6704;" data-bs-toggle="modal"
                                    data-bs-target="#confirmModal">
                                    <i class="fa-solid fa-floppy-disk me-1 fs-5"></i> Guardar cambios
                                </button>
                            </div>

                        </div>
                        <div class="col-8">
                            <div class="card border-0 shadow rounded-4">
                                <div class="card-body">
                                    <div class="row d-flex justify-content-between g-3">
                                        <div class="col">
                                            <div class="table-responsive">
                                                <table class="table table-hover tabla-personalized w-100 p-2"
                                                    id="tableContenedores">
                                                    <thead>
                                                        <tr>
                                                            <th class="M text-center">FECHA</th>
                                                            <th class="AG text-center">CONTENDOR</th>
                                                            <th class="AG text-center">NUMERO DE CAJAS</th>
                                                            <th class="AG text-center">PROCESO</th>
                                                            <th class=" text-center">ACCIONES</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td colspan="5">No hay Información </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Informacion del Contenedor Actual  -->
    <div class="tab-pane fade mb-5" id="infoContenedor" role="tabpanel">
        <div class="container-fluid">
            <div class="row g-4 mt-3 justify-content-end align-items-center">
                <div class="col text-center">
                    <h3><i class="fa-solid fa-chart-simple"></i> Proyección de Producción</h3>
                </div>
            </div>

            <div class="row g-4 mb-4 mt-3">

                <div class="col-12">
                    <div class="dashboard-grid-proyeccion">
                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Cajas Solicitadas</div>
                            <div class="card-value-proyeccion" id="cajasSolicitadas">-</div>
                            <div class="card-subtitle-proyeccion">Total del pedido</div>
                        </div>

                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Cajas Producidas</div>
                            <div class="card-value-proyeccion" id="cajasProducidas">-</div>
                            <div class="card-subtitle-proyeccion" id="porcentaje">0% completado</div>
                            <div class="progress-bar-proyeccion">
                                <div class="progress-fill-proyeccion" id="progressBar" style="width: 0%"></div>
                            </div>
                        </div>

                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Cajas Faltantes</div>
                            <div class="card-value-proyeccion" id="cajasFaltantes">-</div>
                            <div class="card-subtitle-proyeccion">Por producir</div>
                        </div>

                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Proyección</div>
                            <div class="card-value-proyeccion" id="diasProyeccion">-</div>
                            <div class="card-subtitle-proyeccion">días restantes</div>
                        </div>

                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Kilos Totales/Patacon</div>
                            <div class="card-value-proyeccion" id="kilosTotales">-</div>
                            <div class="card-subtitle-proyeccion" id="kilosFaltantes">- kg faltantes</div>
                        </div>

                        <div class="card-dashboard">
                            <div class="card-title-proyeccion">Cajas En Bodega</div>
                            <div class="card-value-proyeccion" id="cajasBodega">-</div>
                            <div class="card-subtitle-proyeccion">bodega</div>
                        </div>

                    </div>
                </div>

            </div>
            <div class="row mt-3">
                <ul class="nav nav-tabs justify-content-end" id="prodTabs" role="tablist">

                    <li class="nav-item" role="presentation">
                        <button class="nav-link active text-dark" id="principalTable-tab" data-bs-toggle="tab"
                            data-bs-target="#principalTable" type="button" role="tab">Progresión</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link " id="produccioTable-tab" data-bs-toggle="tab"
                            data-bs-target="#produccioTable" type="button" role="tab">Producciones</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link " id="bodegaTable-tab" data-bs-toggle="tab"
                            data-bs-target="#bodegaTable" type="button" role="tab">Bodega</button>
                    </li>

                </ul>

                <div class="tab-content">
                    <div class="tab-pane fade show active" id="principalTable" role="tabpanel">
                        <div class="col mt-4 mb-2">
                            <!-- Tabla de Proyecciones por Tipo -->
                            <div class="card border-0 shadow p-4 rounded-4">
                                <div class="d-flex justify-content-between align-items-center gap-2 mb-3"
                                    style="align-items: center; gap: 10px;">
                                    <i class="fa-solid fa-chart-line fs-3 p-1 shadow-sm rounded"
                                        style="color:#1e1e2f"></i>
                                    <span class="fw-bold text-dark">Proyección de Contenedor</span>
                                    <button type="button" class="btn btn-dark" data-bs-toggle="modal"
                                        data-bs-target="#modalId">
                                        Config <i class="fa-solid fa-gears "></i>
                                    </button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-hover tabla-personalized w-100 p-2"
                                        id="tablaProyecciones">
                                        <thead>
                                            <tr>
                                                <th rowspan="2" class="text-center G">Tipo</th>
                                                <th colspan="3" class="text-center BAG">PRODUCCIÓN DE CAJAS</th>
                                                <th colspan="3" class="text-center MB"> PATACÓN</th>
                                                <th class="text-center AG"> MATERIA PRIMA</th>
                                                <th colspan="2" class="text-center F">PROYECCIÓN DE CONTENEDOR</th>

                                            </tr>
                                            <tr>
                                                <th class="text-center BAGC">Solicitadas</th>
                                                <th class="text-center BAGC">Producidas</th>
                                                <th class="text-center BAGC">Faltantes</th>
                                                <th class="text-center MBC">kg Procesar</th>
                                                <th class="text-center MBC">kg Producidos</th>
                                                <th class="text-center MBC">kg Faltantes</th>
                                                <th class="text-center AGC">kg Platano Verde</th>
                                                <th class="text-center FC">Progreso</th>
                                                <th class="text-center FC">Días Rest.</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <div class="row justify-content-between">
                            <div class="col-8 mt-4 mb-2">
                                <!-- Tabla de Inventario -->
                                <div class="card border-0 shadow p-3 rounded-4">
                                    <div class="d-flex align-items-center gap-2 mb-3"
                                        style="align-items: center; gap: 10px;">

                                        <i class="fa-solid fa-scale-balanced fs-3 p-1 shadow-sm rounded"
                                            style="color: #6c780d"></i>
                                        <span class="fw-bold text-dark">Patacón por Empacar

                                    </div>
                                    <div class="table-responsive">

                                        <table class="table table-hover tabla-personalized w-100 p-2"
                                            id="tablaPorEmpacar">
                                            <thead>
                                                <tr>
                                                    <th class="text-center G">Tipo</th>
                                                    <th class="text-center G">Kg Patacón</th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="tab-pane fade" id="bodegaTable" role="tabpanel">
                        <div class="col mt-4 mb-2">
                            <!-- Tabla de Inventario Historico -->
                            <div class="card border-0 shadow p-3 rounded-4">

                                <div class="d-flex align-items-center gap-2 mb-3"
                                    style="align-items: center; gap: 10px;">

                                    <i class="fa-solid fa-clipboard fs-3 p-1 shadow-sm rounded"
                                        style="color:#e6a717"></i>
                                    <span class="fw-bold text-dark">Inventario de Bodega

                                </div>
                                <div class="table-responsive">
                                    <table class="table table-hover tabla-personalized w-100 p-2" id="tablaInventario">
                                        <thead>
                                            <tr>
                                                <th class="text-center">Fecha</th>
                                                <th class="text-center F">Tipo A</th>
                                                <th class="text-center F">Tipo AF</th>
                                                <th class="text-center F">Tipo XL</th>
                                                <th class="text-center F">Tipo B</th>
                                                <th class="text-center F">Tipo BH</th>
                                                <th class="text-center F">Tipo C</th>
                                                <th class="text-center F">Tipo CIL</th>
                                                <th class="text-center F">Tipo Pinton</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-4 mb-2">
                            <!-- Tabla de Estadísticas de Producción -->
                            <div class="card border-0 shadow p-3 rounded-4">
                                <div class="d-flex align-items-center gap-2 mb-3"
                                    style="align-items: center; gap: 10px;">
                                    <i class="fa-solid fa-chart-column fs-3 p-1 shadow-sm rounded"
                                        style="color:#ec6704"></i>
                                    <span class="fw-bold text-dark">Estadísticas de Empaque
                                </div>
                                <div class="table-responsive">

                                    <table class="table table-hover tabla-personalized w-100 p-2"
                                        id="tablaEstadisticas">
                                        <thead>
                                            <tr>
                                                <th class="text-center X">Tipo</th>
                                                <th class="text-center X">Total Prod.</th>
                                                <th class="text-center X">Promedio/Día</th>
                                                <th class="text-center X">Días Activos</th>
                                                <th class="text-center X">Máximo</th>
                                                <th class="text-center X">Mínimo</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="tab-pane fade" id="produccioTable" role="tabpanel">
                        <div class="col mt-4 mb-2">
                            <!-- Tabla de Indicadores -->
                            <div class="card border-0 shadow p-3 rounded-4">
                                <div class="d-flex align-items-center gap-2 mb-3"
                                    style="align-items: center; gap: 10px;">
                                    <i class="fa-solid fa-box fs-3 p-1 shadow-sm rounded" style="color: #6c780d"></i>
                                    <span class="fw-bold text-dark">Incadores de Empaque
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-hover tabla-personalized w-100 p-2"
                                        id="tablaPorEmpacarProducciones">
                                        <thead>
                                            <tr>
                                                <th class="text-center M">Produccion</th>
                                                <th class="text-center M">
                                                    Tipo
                                                </th>
                                                <th colspan="10" class="text-center AG">
                                                    ASIGNACIÓN DE CANASTILLAS
                                                </th>
                                            </tr>
                                            <tr>
                                                <th class="text-center">
                                                    <select class="form-select"></select>
                                                </th>
                                                <th class="text-center">
                                                    <select class="form-select"></select>
                                                </th>
                                                <th class="text-center AGC">Kg Producidos</th>
                                                <th class="text-center AGC">Total/Canastas</th>
                                                <th class="text-center AGC">Kg Promedio/Canasta</th>
                                                <th class="text-center AGC">Cajas Empacadas</th>
                                                <th class="text-center AGC">Kg Empacados</th>
                                                <th class="text-center AGC">Kg Pendientes</th>
                                                <th class="text-center AGC">Empacadas</th>
                                                <th class="text-center AGC">Disponibles</th>
                                                <th class="text-center AGC">Desfasadas</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="tab-pane fade" id="produccion" role="tabpanel">

        <div class="container-fluid">
            <div class="row g-4 mt-3 mb-3 justify-content-end align-items-center">
                <div class="col text-center">
                    <h3><i class="fa-solid fa-chart-pie"></i> Información de Contenedor</h3>
                </div>
            </div>
            <div class="row justify-content-end align-items-center g-2 mb-3 mt-4">
                <div class="col-4">
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm shadow-sm"
                            placeholder="Buscar Contenedor.." id="inputSearhC" aria-label="Username"
                            aria-describedby="basic-addon1" autocomplete="off">
                        <span class="input-group-text" id="basic-addon1"><i
                                class="fa-solid fa-magnifying-glass"></i></span>
                    </div>
                    <div class="input-group">
                        <div class="list-group suggestions" id="suggestionsC" data-tipo="C">

                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <!-- Recepción -->
                <div class="col-12">
                    <div class="dashboard-grid">
                        <div
                            class="card card-dashboard border-0 shadow p-4 mt-1 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <i class="fa-solid fa-truck-ramp-box fa-2x mb-2" style="color: #66b30f"></i>
                            <h6 class="fw-bold " style="color:#66b30f">
                                Pátano</h6>
                            <div class="d-flex justify-content-center align-items-center gap-2">
                                <button type="button"
                                    class="btn btn-light d-flex align-items-center justify-content-center"
                                    data-bs-toggle="modal" data-bs-target="#ModalInfoRecepcion" id="btnInfoRecepcion" da
                                    style="width: 45px; height: 45px; border-radius: 50%;"><i
                                        class="fa-solid fa-circle-info fs-4" style="color: #449fdb"></i>
                                </button>
                            </div>

                        </div>

                        <!-- Alistamiento -->
                        <div
                            class="card card-dashboard border-0 shadow p-3 mt-1 rounded-4 d-flex justify-content-center align-items-center gap-2">

                            <i class="fa-solid fa-seedling fa-2x  mb-2" style="color: #798610"></i>
                            <h6 class="fw-bold"> Alistamiento
                            </h6>
                            <div class="d-flex justify-content-center align-items-center gap-2">
                                <button type="button"
                                    class="btn btn-light d-flex align-items-center justify-content-center"
                                    data-bs-toggle="modal" data-bs-target="#ModalInfoAlistamiento"
                                    id="btnInfoAlistamiento" style="width: 45px; height: 45px; border-radius: 50%;"><i
                                        class="fa-solid fa-circle-info fs-4 " style="color: #449fdb"></i>
                                </button>
                            </div>

                        </div>
                        <!-- Fritura -->
                        <div
                            class="card card-dashboard border-0 shadow p-3  mt-1 rounded-4 justify-content-center align-items-center gap-2">
                            <i class="fa-solid fa-fire-flame-curved fa-2x text-warning mb-2"></i>
                            <h6 class="fw-bold text-danger"> Fritura
                            </h6>
                            <div class="d-flex justify-content-center align-items-center gap-2">

                                <button type="button"
                                    class="btn btn-light d-flex align-items-center justify-content-center"
                                    data-bs-toggle="modal" data-bs-target="#ModalInfoFritura" id="btnInfoFritura"
                                    style="width: 45px; height: 45px; border-radius: 50%;"><i
                                        class="fa-solid fa-circle-info fs-4 " style="color: #449fdb"></i>
                                </button>

                            </div>
                        </div>
                        <!-- Empaque -->
                        <div
                            class="card card-dashboard  border-0 shadow p-3  mt-1 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <i class="fa-solid fa-box-open fa-2x text-dark mb-2"></i>
                            <h6 class="fw-bold text-dark"> Empaque
                            </h6>
                            <div class="d-flex justify-content-center align-items-center gap-2">

                                <button type="button"
                                    class="btn btn-light d-flex align-items-center justify-content-center"
                                    data-bs-toggle="modal" data-bs-target="#ModalInfoEmpaque" id="btnInfoEmpaque"
                                    style="width: 45px; height: 45px; border-radius: 50%;"><i
                                        class="fa-solid fa-circle-info fs-4 " style="color: #449fdb"></i>
                                </button>

                            </div>
                        </div>
                        <!-- Proveedores -->

                    </div>
                </div>
            </div>


            <h5 class="fw-bold mb-3 mt-4"><i class="fa-solid fa-circle-info me-2"></i>Datos Globales</h5>
            <div class="row  g-3 text-center mb-5 justify-content-between">

                <div class="col-12">
                    <div class="dashboard-grid">
                        <div
                            class="card card-dashboard  border-0 shadow p-3 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <div class="card-body justify-content-center">
                                <i class="fa-solid fa-arrows-spin fa-2x text-dark mb-2"></i>
                                <h6 class="fw-bold text-secondary mt-1">Materia Prima</h6>
                                <small class="fw-bold fs-5" style="color:#66b30f" id="materiaContenedor">

                                </small>
                            </div>
                        </div>
                        <div
                            class="card card-dashboard border-0 shadow p-3 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <div class="card-body justify-content-center">
                                <i class="fa-solid fa-seedling fa-2x  mb-2" style="color: #297ece"></i>
                                <h6 class="fw-bold  text-secondary mt-1">Proveedores</h6>
                                <small class="fw-bold fs-5 text-dark" id="proveedoreContenedor">

                                </small>
                            </div>
                        </div>
                        <div
                            class="card card-dashboard border-0 shadow p-3 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <div class="card-body justify-content-center">
                                <i class="fa-solid fa-bottle-droplet fa-2x text-secondary mb-2"></i>
                                <h6 class="fw-bold  text-secondary mt-1">Bidones Aceite</h6>
                                <small class="fw-bold fs-5" style="color: #449fdb" id="bidonesContenedor">

                                </small>
                            </div>
                        </div>
                        <div
                            class="card card-dashboard border-0 shadow p-3 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <div class="card-body justify-content-center">
                                <i class="fa-solid fa-fire fa-2x text-danger mb-2"></i>
                                <h6 class="fw-bold  text-secondary mt-1">Gas</h6>
                                <small class="fw-bold fs-5" style="color: #449fdb" id="gasContenedor">

                                </small>
                            </div>
                        </div>
                        <div
                            class="card card-dashboard border-0 shadow p-3 rounded-4 d-flex justify-content-center align-items-center gap-2">
                            <div class="card-body justify-content-center">
                                <i class="fa-solid fa-ban fa-2x text-danger mb-2"></i>
                                <h6 class="fw-bold  text-secondary mt-1">Total Rechazo:</h6>
                                <span class="fw-bold fs-5 text-dark" id="rechazoContenedor"></span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <h5 class="fw-bold mb-2"><i class="fa-solid fa-circle-info me-2"></i>Rechazo En Áreas</h5>
            <div class="dashboard-grid">
                <div class="card card-dashboard mt-3 border-0 shadow p-3 rounded-4 ">
                    <div class="card-body">
                        <div class="row d-flex justify-content-between g-2">
                            <div class="col mt-2 mb-3">
                                <h5 class="fw-bold mb-3 mt-1"></h5>
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="fw-bold mb-3"></h4>
                                        <canvas id="rendimientoChart" height="100"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Reportes Rendimiento Produccion -->
    <div class="tab-pane fade" id="reportes" role="tabpanel">

        <div class="container-fluid">
            <div class="row g-4 mt-3 mb-3 justify-content-end align-items-center">
                <div class="col text-center">
                    <h3><i class="fa-solid fa-chart-area"></i> Rendimiento de Producción</h3>
                </div>
            </div>
            <!-- MODIFICACIÓN: Botón de rendimiento general al principio y opuesto a la fecha -->
            <div class="row justify-content-between align-items-end g-2 mb-3 mt-4">
                <!-- Botón de Rendimiento General a la izquierda -->
                <div class="col-auto">
                    <button class="btn btn-success px-4 py-2 shadow-sm" id="btnRendimientoGeneral"
                        style="background-color: #6c780d; border-color: #6c780d;">
                        <i class="fa-solid fa-chart-line me-2"></i> Ver Rendimiento General
                    </button>
                </div>

                <!-- Selector de Fecha a la derecha -->
                <div class="col-auto">
                    <div class="d-flex align-items-center gap-2">
                        <label for="inputSearhR" class="form-label fw-semibold mb-0 text-secondary">Fecha:</label>
                        <div class="input-group" style="width: 250px;">
                            <input type="date" class="form-control form-control-sm shadow-sm" id="inputSearhR"
                                autocomplete="off">
                            <span class="input-group-text bg-white" id="basic-addon1">
                                <i class="fa-solid fa-calendar-day text-success"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row align-items-center mb-3 mt-4">
                <div class="col-12">
                    <div class="dashboard-grid text-center">
                        <!-- Recepción -->
                        <div class="card-dashboard">
                            <div class="circle-wrap">
                                <div class="circle">
                                    <div class="mask half">
                                        <div class="fill" style="background-color:#5cad1a"></div>
                                    </div>
                                    <div class="inside-circle  fw-bold fs-3"
                                        style="background-color:rgb(210, 241, 218); color:#61a52a"" id=" platano">
                                    </div>
                                </div>
                            </div>
                            <h5 class="fw-bold mt-3" style="color:#6fbd30"> Plátano </h5>
                        </div>

                        <!-- Fritura -->
                        <div class="card-dashboard">
                            <div class="circle-wrap">
                                <div class="circle">
                                    <div class="mask half">
                                        <div class="fill" style="background-color: #6cbae7;"></div>
                                    </div>
                                    <div class="inside-circle fw-bold fs-3" style="color: #4faee6" id="fritura">
                                    </div>
                                </div>
                            </div>
                            <h5 class="fw-bold  mt-3" style="color: #449fdb"> Fritura </h5>
                        </div>

                        <!-- Fritura -->
                        <div class="card-dashboard">
                            <div class="circle-wrap">
                                <div class="circle">
                                    <div class="mask half">
                                        <div class="fill" style="background-color: #ec6704"></div>
                                    </div>
                                    <div class="inside-circle fs-3"
                                        style="background-color:rgb(241, 225, 210); color: #ec6704;" id="hfritura">

                                    </div>
                                </div>
                            </div>
                            <h5 class="fw-bold  mt-3" style="color:#ec6704"> H. Fritura </h5>
                        </div>

                        <!-- Fritura -->
                        <div class="card-dashboard">
                            <div class="circle-wrap">
                                <div class="circle">
                                    <div class="mask half">
                                        <div class="fill bg-warning"></div>
                                    </div>
                                    <div class="inside-circle fs-3"
                                        style="background-color:rgb(241, 236, 210); color:rgb(209, 160, 1);"
                                        id="empaque">

                                    </div>
                                </div>
                            </div>
                            <h5 class="fw-bold text-warning mt-3"> Empaque </h5>
                        </div>

                        <!-- Empaque -->
                        <div class="card-dashboard">
                            <div class="circle-wrap">
                                <div class="circle">
                                    <div class="mask half">
                                        <div class="fill bg-danger"></div>
                                    </div>
                                    <div class="inside-circle text-danger fs-3"
                                        style="background-color:rgb(241, 210, 212)" id="total">
                                    </div>
                                </div>
                            </div>
                            <h5 class="fw-bold text-danger mt-3"> Total </h5>
                        </div>

                        <div class="card-dashboard">
                            <div class="circle-wrap">

                                <div class="inside-circle  fs-3" style="background-color:#313146; color: #bcbcc0;"
                                    id="rechazoTotal">
                                </div>
                            </div>
                            <h5 class="fw-bold text-dark mt-3"> Rechazo Total </h5>
                        </div>
                    </div>
                </div>

            </div>
            <div class="row d-flex mt-4">
                <div class="col-12">
                    <div class="dashboard-grid text-center">
                        <div class=" card-dashboard border-0 shadow p-3 rounded-4">
                            <div class="card-body">
                                <div class="row mt-3">
                                    <div class="col">
                                        <h6 class="fw-bold" style="color:#6fbd30">
                                            <i class="fa-solid fa-truck  mb-2" style="color:#6fbd30"></i> Recepción
                                        </h6>
                                        <h3 class="fw-semibold" id="materiaPrima"></h3>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class=" card-dashboard border-0 shadow p-3 rounded-4">
                            <div class="card-body">
                                <div class="row mt-3">
                                    <div class="col">
                                        <h6 class="fw-bold" style="color:#ec6704">
                                            <i class="fa-solid fa-scissors  mb-2" style="color:#ec6704"></i> Corte
                                        </h6>
                                        <h3 class="fw-semibold" id="materiaCorte"></h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class=" card-dashboard border-0 shadow p-3 rounded-4">
                            <div class="card-body">

                                <div class="row mt-3">
                                    <div class="col">
                                        <h6 class="fw-bold text-danger">
                                            <i class="fa-solid fa-fire text-danger mb-2"></i> Fritura
                                        </h6>
                                        <h3 class="fw-semibold" id="materiaProcesada"></h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class=" card-dashboard border-0 shadow p-3 rounded-4">
                            <div class="card-body">
                                <div class="row mt-3">
                                    <div class="col">
                                        <h6 class="fw-bold" style="color: #1e1e2f">
                                            <i class="fa-solid fa-dolly mb-2"></i> Canastillas
                                        </h6>
                                        <h3 class="fw-semibold" id="canastillas"></h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h4 class="fw-bold mb-3"><i class="fa-solid fa-circle-info me-2"></i>Proveedores y Rechazo</h4>
            <div class="row d-flex mt-4">
                <div class="col-12">
                    <div class="dashboard-grid text-center">
                        <div class="card shadow rounded-4 border-0">
                            <div class="card-body">
                                <div class="row mt-3">
                                    <div class="col">
                                        <div class="d-flex justify-content-between mb-2"
                                            style="align-items: center; gap: 10px;">
                                            <div><i class="fa-solid fa-truck fs-4 p-1 shadow-sm rounded"
                                                    style="color:#ec6704"></i>
                                                <span class="fw-bold text-dark"> Rendimiento Proveedores
                                                </span>
                                            </div>
                                            <div class="btn-group">
                                                <button
                                                    class="btn btn-sm shadow-sm dropdown-toggle text-white fw-semibold"
                                                    data-bs-toggle="modal" data-bs-target="#ModalInfoProveedor"
                                                    type="button" data-bs-toggle="dropdown" aria-expanded="false"
                                                    style="background-color:#313146; color: #bcbcc0;">
                                                    <i class="fa-solid fa-eye"></i> MÁS
                                                </button>

                                            </div>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table tabla-personalized table-hover w-100 g-2"
                                                id="tablaProveedores">
                                                <thead class="table-dark">
                                                    <tr>
                                                        <th class="text-center N">PROVEEDOR</th>
                                                        <th class="text-center N">RECEPCIÓN</th>
                                                        <th class="text-center N">CORTE</th>
                                                        <th class="text-center N">RENDIMIENTO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colspan="4">No Hay Información Disponible</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card shadow border-0 rounded-4">
                            <div class="card-body">
                                <div class="row mt-2">
                                    <div class="col-12">
                                        <div class="d-flex align-items-center gap-2 mb-2"
                                            style="align-items: center; gap: 10px;">
                                            <i class="fa-solid fa-box fs-3 p-1 shadow-sm rounded"
                                                style="color:#e6a717"></i>
                                            <span class="fw-bold text-dark">Cajas Producidas
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-hover display tabla-personalized w-100"
                                                id="tablaCajas">
                                                <thead>
                                                    <tr>
                                                        <th class="text-center N">TIPO</th>
                                                        <th class="text-center N">CANTIDAD</th>
                                                    </tr>
                                                </thead>
                                                <tfoot>
                                                    <tr>
                                                        <th style="text-align:right">TOTAL :</th>
                                                        <th style="text-align:center"></th>
                                                    </tr>
                                                </tfoot>
                                                <tbody>
                                                    <td colspan="2">No Hay Información Disponible</td>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="col-10">
                            <div class="card shadow rounded-4 border-0">
                                <div class="card-body">
                                    <div class="d-flex align-items-center gap-2 mb-2"
                                        style="align-items: center; gap: 10px;">
                                        <i class="fa-solid  fa-circle-xmark fs-4 p-1 shadow-sm rounded"
                                            style="color:#1e1e2f"></i>
                                        <span class="fw-bold text-dark"> Rechazo Areas
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-12">
                                            <div id="graficaRechazo"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Enviar -->
    <div class="tab-pane fade" id="enviar" role="tabpanel">
        <div class="container-fluid">
            <div class="row g-4 mt-3 mb-3 justify-content-end align-items-center">
                <div class="col text-center">
                    <h3><i class="fa-solid fa-paper-plane"></i> Envío de Producción</h3>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-between align-items-center">
                    <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#modalSobrantes">
                        <i class="fa-solid fa-boxes"></i> Registrar Cajas Sobrantes
                    </button>

                    <button class="btn btn-warning" id="BtnPdf">
                        <i class="fa-solid fa-file-pdf"></i> Generar PDF
                    </button>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12">
                    <div class="card border-0 shadow rounded-4">
                        <div class="card-header text-white py-3"
                            style="background-color: #6c780d; border-top-left-radius: 16px; border-top-right-radius: 16px;">
                            <div class="d-flex align-items-center gap-2">
                                <i class="fa-solid fa-truck-fast fs-4"></i>
                                <h5 class="fw-bold mb-0">Órdenes de Producción Listas para Envío</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover tabla-personalized w-100" id="tableEnviar">
                                <thead>
                                    <tr>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">PRODUCCIÓN</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO A</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO B</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO C</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO AF</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO BH</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO XL</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO CILINDRO</th>
                                        <th class="text-center align-middle"
                                            style="background-color: #1e1e2f; color: white;">CAJA TIPO PINTÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="9" class="text-center py-4">
                                            <div class="d-flex flex-column align-items-center">
                                                <i class="fa-solid fa-box-open fa-3x text-secondary mb-2"></i>
                                                <span class="text-secondary fw-semibold">No hay órdenes de producción
                                                    listas para envío</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr style="background-color: #f8f9fa;">
                                        <th class="text-center fw-bold" colspan="1">TOTALES:</th>
                                        <th class="text-center" id="totalTipoA">0</th>
                                        <th class="text-center" id="totalTipoB">0</th>
                                        <th class="text-center" id="totalTipoC">0</th>
                                        <th class="text-center" id="totalTipoAF">0</th>
                                        <th class="text-center" id="totalTipoBH">0</th>
                                        <th class="text-center" id="totalTipoXL">0</th>
                                        <th class="text-center" id="totalTipoCIL">0</th>
                                        <th class="text-center" id="totalTipoPINTON">0</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resumen de Envíos Realizados -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card border-0 shadow rounded-4">
                    <div class="card-header py-3"
                        style="background-color: #313146; border-top-left-radius: 16px; border-top-right-radius: 16px;">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fa-solid fa-clock-rotate-left fs-4 text-white"></i>
                            <h5 class="fw-bold mb-0 text-white">Historial de Envíos</h5>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover tabla-personalized w-100" id="tableHistorialEnviar">
                                <thead>
                                    <tr>
                                        <th class="text-center">FECHA ENVÍO</th>
                                        <th class="text-center">PRODUCCIÓN</th>
                                        <th class="text-center">TIPO A</th>
                                        <th class="text-center">TIPO B</th>
                                        <th class="text-center">TIPO C</th>
                                        <th class="text-center">TIPO AF</th>
                                        <th class="text-center">TIPO BH</th>
                                        <th class="text-center">TIPO XL</th>
                                        <th class="text-center">TIPO CIL</th>
                                        <th class="text-center">TIPO PINTÓN</th>
                                        <th class="text-center">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="11" class="text-center py-4">
                                            <span class="text-secondary">Cargando historial...</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>

<!-- Modal para registrar cajas sobrantes -->
<div class="modal fade" id="modalSobrantes" tabindex="-1" aria-labelledby="modalSobrantesLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header" style="background-color: #ffc107;">
                <h5 class="modal-title fw-bold" id="modalSobrantesLabel">
                    <i class="fa-solid fa-boxes"></i> Registrar Cajas Sobrantes por Lote
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="formSobrantes">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="fechaSobrantes" class="form-label fw-semibold">Fecha de Registro:</label>
                            <input type="date" class="form-control" id="fechaSobrantes" required>
                        </div>
                    </div>

                    <!-- Buscador de lotes -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <label for="buscadorLotes" class="form-label fw-semibold">
                                <i class="fa-solid fa-search"></i> Buscar y Agregar Lote:
                            </label>
                            <div class="input-group">
                                <select class="form-select" id="buscadorLotes">
                                    <option value="">Seleccione un lote para agregar...</option>
                                    <!-- Los lotes se cargarán dinámicamente -->
                                </select>
                                <button class="btn btn-outline-primary" type="button" id="btnAgregarLote">
                                    <i class="fa-solid fa-plus"></i> Agregar
                                </button>
                            </div>
                            <div class="form-text">Busque un lote y asígnele las cantidades sobrantes</div>
                        </div>
                    </div>

                    <!-- Tabla de lotes seleccionados -->
                    <div class="table-responsive mt-4">
                        <h6 class="fw-bold mb-3">
                            <i class="fa-solid fa-list"></i> Lotes Seleccionados con Sobrantes:
                        </h6>
                        <table class="table table-bordered table-hover" id="tablaLotesSeleccionados">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-center">Lote</th>
                                    <th class="text-center">A</th>
                                    <th class="text-center">B</th>
                                    <th class="text-center">C</th>
                                    <th class="text-center">AF</th>
                                    <th class="text-center">BH</th>
                                    <th class="text-center">XL</th>
                                    <th class="text-center">CIL</th>
                                    <th class="text-center">PINTON</th>
                                    <th class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyLotesSeleccionados">
                                <!-- Aquí se agregarán las filas dinámicamente -->
                                <tr id="filaVacia">
                                    <td colspan="10" class="text-center py-4 text-muted">
                                        <i class="fa-solid fa-box-open fa-2x mb-2"></i><br>
                                        No hay lotes seleccionados. Agregue lotes usando el buscador.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Totales de sobrantes -->
                    <div class="row mt-4 p-3 bg-light rounded">
                        <h6 class="fw-bold mb-3">
                            <i class="fa-solid fa-calculator"></i> Totales de Sobrantes:
                        </h6>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total A:</span> <span id="totalSobranteA">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total B:</span> <span id="totalSobranteB">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total C:</span> <span id="totalSobranteC">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total AF:</span> <span id="totalSobranteAF">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total BH:</span> <span id="totalSobranteBH">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total XL:</span> <span id="totalSobranteXL">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total CIL:</span> <span id="totalSobranteCIL">0</span>
                        </div>
                        <div class="col-md-3">
                            <span class="fw-semibold">Total PINTON:</span> <span id="totalSobrantePINTON">0</span>
                        </div>
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-warning" id="BtnEnviar">
                    <i class="fa-solid fa-save"></i> Guardar Sobrantes
                </button>
            </div>
        </div>
    </div>
</div>

</div>


{{-- Modal de Confirmación de Cambio de Orden de Producción --}}
<div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow">

            <div class="modal-header justify-content-center"
                style="background:#6E7B12; color:white; border-top-left-radius:14px; border-top-right-radius:14px;">

                <p class="mb-0 text-white"
                    style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.25rem; font-weight: bold;">
                    ¿Estás seguro de cambiar la orden de producción?
                </p>

            </div>

            <div class="modal-body py-4 text-center">
                <i class="fa-solid fa-circle-exclamation fa-2x text-warning mb-3"></i>
                <p class="mb-0 fw-semibold text-secondary">
                    Al confirmar este cambio, se actualizará la orden de producción actual. ¿Deseas
                    continuar?
                </p>
            </div>

            <div class="modal-footer border-0 d-flex justify-content-between">
                <button type="button" class="btn btn-outline-secondary rounded-3 px-4"
                    data-bs-dismiss="modal">Cancelar</button>

                <button type="button" class="btn text-white fw-bold px-4 rounded-3" style="background:#e6a717;"
                    id="confirmButton">
                    Confirmar
                </button>
            </div>

        </div>
    </div>
</div>

<div class="modal fade" id="ModalProduccion" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0  p-2"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header border-0 mt-2"
                style="background-color: #1e1e2f; color: #fff; border-radius: 1rem;">
                <h5 class="modal-title fw-bold" id="createModalLabel">CONTENEDOR</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <form id="formProduccion" class="row g-3 mt-1">
                    <input type="hidden" name="id_produccion" id="id_produccion">
                    <div class="mb-3 col-md-6">
                        <label for="fecha_creacion" class="form-label">Fecha Inicio.</label>
                        <input type="date" class="form-control form-control-md  rounded-3 shadow-sm"
                            placeholder="Inicio de Contenedor" name="fecha_creacion" id="fecha_creacion" required>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_cierre" class="form-label">Fecha Cierre.</label>
                        <input type="date" class="form-control form-control-md  rounded-3 shadow-sm"
                            placeholder="Cierre de Contenedor" name="fecha_cierre" id="fecha_cierre">
                    </div>
                    <!-- Sección: Información Personal -->
                    <div class="col-7">

                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de
                                Orden</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="lote_produccion" class="form-label">Lote Produccion.</label>
                        <input type="text" class="form-control form-control-md  rounded-3shadow-sm"
                            placeholder="Lote Contenedor" name="lote_produccion" id="lote_produccion" disabled>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="numero_orden" class="form-label">Numero Orden.</label>
                        <input type="text" class="form-control form-control-md  rounded-3shadow-sm"
                            placeholder="Numero Contenedor" name="numero_orden" id="numero_orden">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="numero_cajas" class="form-label"> Cantidad de Cajas </label>
                        <input type="text" class="form-control form-control-md  rounded-3 shadow-sm"
                            placeholder="Cajas a elaborar" name="numero" id="numero_cajas" required>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="inputElaboracion" class="form-label">Elaboración.</label>
                        <input list="listElaboracion" id="inputElaboracion"
                            class="form-control form-control-md  rounded-3 shadow-sm " autocomplete="off"
                            placeholder="Encargado de la elaboración">
                        <datalist id="listElaboracion"></datalist>
                        <input type="hidden" name="id_elaboracion" id="id_elaboracion" required>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="inputCliente" class="form-label">Cliente</label>
                        <input list="listCliente" id="inputCliente"
                            class="form-control form-control-md rounded-3 shadow-sm" autocomplete="off"
                            placeholder="Asignar cliente (opcional)">
                        <datalist id="listCliente"></datalist>
                        <!-- Campo hidden para almacenar el ID del cliente -->
                        <input type="hidden" id="clienteId" name="cliente_id">
                    </div>

                    <div class="col-12 text-end">
                        <button type="submit" class="btn btn-success text-white border-0 shadow"
                            style="background-color: #36be13">Registrar</button>
                    </div>
                    <div class="col-12 text-center mt-3">
                        <small>Aceptas nuestras Políticas de Privacidad y Términos de Servicio al enviar
                            este
                            formulario.</small>
                    </div>
                </form>

            </div>

        </div>
    </div>
</div>

<div class="modal fade" id="ModalReferencias" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
            <div class="modal-container border-0">
                <input type="hidden" id="id_produccion_referencias">
                <div class="modal-header-custom">
                    <h2><i class="fas fa-boxes"></i> Asignar Referencias</h2>
                    <div class="subtitle">Configure las cajas y cantidades para la producción</div>
                </div>
                <div class="modal-body-custom">
                    <div class="error-message" id="errorMessage">
                        <i class="fas fa-exclamation-circle"></i>
                        <span id="errorText"></span>
                    </div>

                    <div class="peso-section">
                        <label>
                            <i class="fas fa-weight-hanging"></i>
                            Peso Promedio por Caja
                        </label>
                        <div class="peso-input-wrapper">
                            <input type="number" id="peso_promedio" placeholder="Ingrese el peso promedio" min="0.01"
                                step="0.01">
                            <span class="unit">kg</span>
                        </div>
                    </div>

                    <div class="summary-box" id="summaryBox">
                        <div class="summary-content">
                            <div class="summary-item">
                                <div class="label">Total Cajas</div>
                                <div class="value" id="totalCajas">0</div>
                            </div>
                            <div class="summary-item">
                                <div class="label">Tipos Seleccionados</div>
                                <div class="value" id="tiposSeleccionados">0</div>
                            </div>
                            <div class="summary-item">
                                <div class="label">Peso Total</div>
                                <div class="value" id="pesoTotal">0 kg</div>
                            </div>
                        </div>
                    </div>

                    <div class="cajas-grid" id="cajasGrid">
                        <!-- Las tarjetas se generarán dinámicamente -->
                    </div>

                    <div class="action-buttons">
                        <button class="btn-custom btn-cancel">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button class="btn-custom btn-submit" id="btnRegistrar">
                            <i class="fas fa-check"></i>
                            Registrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="ModalInfoproduccion" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header border-0 mt-2"
                style="background-color: #1e1e2f; color: #fff; border-radius: 1rem;">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACIÓN</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-2 mt-1 p-2">

                    <div class="mb-3 col-md-6">
                        <label for="fecha_creacion_info" class="form-label">Fecha Inicio.</label>
                        <input type="date" class="form-control form-control-sm rounded shadow-sm"
                            name="fecha_creacion_info" id="fecha_creacion_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_cierre_info" class="form-label">Fecha Cierre.</label>
                        <input type="date" class="form-control form-control-sm rounded shadow-sm"
                            name="fecha_cierre_info" id="fecha_cierre_info" readonly>
                    </div>
                    <!-- Sección: Información Personal -->
                    <div class="col-7">

                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de
                                Orden</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="lote_produccion_info" class="form-label">Lote Produccion.</label>
                        <input type="text" class="form-control form-control-sm rounded shadow-sm"
                            name="lote_produccion_info" id="lote_produccion_info" readonly>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="numero_orden_info" class="form-label">Numero Orden.</label>
                        <input type="text" class="form-control form-control-sm rounded shadow-sm"
                            name="numero_orden_info" id="numero_orden_info" readonly>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="cliente_info" class="form-label">Cliente.</label>
                        <input type="number" min="0" class="form-control form-control-sm rounded shadow-sm"
                            placeholder="Sin cliente asignado" name="cliente_info" id="cliente_info" readonly>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="cantidad_info" class="form-label">Cantidad.</label>
                        <input type="number" min="0" class="form-control form-control-sm rounded shadow-sm"
                            placeholder="Cantidad Aproximada de producto" name="cantidad_info" id="cantidad_info"
                            readonly>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

{{-- Info Recepción --}}
<div class="modal fade" id="ModalInfoRecepcion" tabindex="-1" aria-labelledby="modalInfoRecepcionLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN ÁREA RECEPCIÓN
                </h5>
            </div>

            <!-- Body -->
            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">
                <div class="container-fluid mb-4 g-3">
                    <div class="row">
                        <div class="col-12">
                            <div class="card shadow-sm p-1">
                                <div class="row d-flex justify-content-center text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="circle-wrap">
                                            <div class="circle">
                                                <div class="mask half">
                                                    <div class="fill" style="background-color:#5cad1a"></div>
                                                </div>
                                                <div class="inside-circle  fw-bold fs-3"
                                                    style="background-color:rgb(210, 241, 218); color:#66b30f"
                                                    id="rendMate">
                                                </div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold mt-3" style="color: #5cad1a"> Plátano </h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row d-flex mt-2">
                        <div class="col-12">
                            <div>
                                <div class="row d-flex justify-content-between text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="card border-0 shadow-sm p-3 rounded-4 mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-truck-front fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Materia Prima</h6>
                                                <small class="fw-bold fs-5 t" style="color: #5cad1a" id="platanoRecep">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 shadow-sm p-3 rounded-4 mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-arrows-spin fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Patacón kg</h6>
                                                <small class="fw-bold fs-5 t" style="color: #5cad1a"
                                                    id="platanoProcesado">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 justify-content-center rounded-bottom-4"
                style="background-color:#f5f7ff;">
                <button type="button" class="btn btn-sm px-4 rounded-pill fw-semibold" data-bs-dismiss="modal"
                    aria-label="Close" style="background-color:#6c780d; color:#ffffff;">
                    Cerrar
                </button>
            </div>

        </div>
    </div>
</div>

{{-- Info Alistamiento --}}
<div class="modal fade" id="ModalInfoAlistamiento" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN ÁREA ALISTAMIENTO
                </h5>
            </div>
            <!-- Body -->
            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">

                <div class="container-fluid mb-4 g-3">
                    <div class="row">
                        <div class="col-12">
                            <div class="card shadow-sm p-1">
                                <div class="row d-flex justify-content-center text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="circle-wrap">
                                            <div class="circle" style="color: #297ece">
                                                <div class="inside-circle fw-bold fs-3" style="color:#4faee6"
                                                    id="canastasPeladas">
                                                </div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold mt-3" style="color: #297ece"> Canastas </h5>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row d-flex mt-2">
                        <div class="col-12">
                            <div>
                                <div class="row d-flex justify-content-between text-center mb-3 mt-1">
                                    <!-- aLISTAMIENTO -->
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-ban fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Rechazo</h6>
                                                <small class="fw-bold fs-5" style="color: #297ece" id="rechazoAlist">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-arrows-spin fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Maduro</h6>
                                                <small class="fw-bold fs-5" style="color: #297ece" id="maduroAlist">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 justify-content-center rounded-bottom-4"
                style="background-color:#f5f7ff;">
                <button type="button" class="btn btn-sm px-4 rounded-pill fw-semibold" data-bs-dismiss="modal"
                    aria-label="Close" style="background-color:#6c780d; color:#ffffff;">
                    Cerrar
                </button>
            </div>

        </div>
    </div>
</div>

{{--Fritura --}}
<div class="modal fade" id="ModalInfoFritura" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN ÁREA FRITURA
                </h5>
            </div>
            <!-- Body -->
            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">
                <div class="container-fluid mb-4 g-3">
                    <div class="row d-flex mt-2">
                        <div class="col-12">
                            <div>
                                <div class="row d-flex justify-content-between text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-truck-front fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Pátacon</h6>
                                                <small class="fw-bold fs-5 text-warning" id="patacones">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-box-archive fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Canastillas</h6>
                                                <small class="fw-bold fs-5 text-warning" id="canastillasConte">

                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div class="row d-flex justify-content-between text-center mb-3 mt-1">
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-ban fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Rechazo</h6>
                                                <small class="fw-bold fs-5 text-warning" id="rechazoFrit">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-cubes-stacked fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Migas</h6>
                                                <small class="fw-bold fs-5 text-warning" id="migasFrit">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 justify-content-center rounded-bottom-4"
                style="background-color:#f5f7ff;">
                <button type="button" class="btn btn-sm px-4 rounded-pill fw-semibold" data-bs-dismiss="modal"
                    aria-label="Close" style="background-color:#6c780d; color:#ffffff;">
                    Cerrar
                </button>
            </div>

        </div>
    </div>
</div>

{{-- Empaque--}}
<div class="modal fade" id="ModalInfoEmpaque" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN ÁREA EMPAQUE
                </h5>
            </div>
            <!-- Body -->
            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">
                <div class="container-fluid mb-4 g-3">
                    <div class="row">
                        <div class="col-12">
                            <div class="card shadow-sm p-1">
                                <div class="row d-flex justify-content-center text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="circle-wrap">
                                            <div class="circle">
                                                <div class="mask half">
                                                    <div class="fill bg-dark"></div>
                                                </div>
                                                <div class="inside-circle text-dark fw-bold fs-3" id="cajasConte">
                                                </div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold text-dark mt-3"> Cajas </h5>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row d-flex mt-2">
                        <div class="col-12">
                            <div>
                                <div class="row d-flex justify-content-between text-center mb-3 mt-1">
                                    <!-- Recepción -->
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-ban fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Rechazo</h6>
                                                <small class="fw-bold fs-5 text-dark" id="rechazoEmp">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 shadow-sm mt-4">
                                            <div class="card-body">
                                                <i class="fa-solid fa-cubes-stacked fa-2x text-dark mb-2"></i>
                                                <h6 class="fw-bold text-secondary">Migas</h6>
                                                <small class="fw-bold fs-5 text-dark" id="migasEmp">

                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 justify-content-center rounded-bottom-4"
                style="background-color:#f5f7ff;">
                <button type="button" class="btn btn-sm px-4 rounded-pill fw-semibold" data-bs-dismiss="modal"
                    aria-label="Close" style="background-color:#6c780d; color:#ffffff;">
                    Cerrar
                </button>
            </div>

        </div>
    </div>
</div>

{{-- Info Proveedor : Produccion --}}
<div class="modal fade" id="ModalInfoProveedor" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                style="background-color: #ec6704;">
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
                <h4 class="fw-bold text-white m-0">INFORMACIÓN PROVEEDORES</h4>
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
            </div>

            <!-- Body -->
            <div class="modal-body px-2 py-4" style="background-color: #f5f7ff; color: #070707;">
                <div class="container-fluid mb-3 g-2">

                    <div class="card border-0 shadow-sm p-2">
                        <div class="row d-flex justify-content-center text-center mb-3 mt-1">
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-hover tabla-personalized w-100"
                                        id="tablaCanastasProveedor">
                                        <thead>
                                            <tr>
                                                <th class="text-center AG">PROVEEDOR</th>
                                                <th class="text-center N">TIPO</th>
                                                <th class="text-center N">MATERIA</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            <td colspan="3">No Hay Información Disponible</td>

                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 justify-content-center rounded-bottom-4"
                style="background-color:#f5f7ff;">
                <button type="button" class="btn btn-sm px-4 rounded-pill fw-semibold" data-bs-dismiss="modal"
                    aria-label="Close" style="background-color:#6c780d; color:#ffffff;">
                    CERRAR
                </button>
            </div>

        </div>
    </div>
</div>

<div class="modal fade" id="ModalInfoCajas" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-between align-items-center rounded-top-4"
                style="background-color: #ec6704;">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <div class="bg-white btn-light shadow-lg rounded-circle p-2">
                        <i class="fa-solid fa-box-open fs-3 p-1 shadow-sm rounded" style="color: #6c780d"></i>
                    </div>
                </div>
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN DE CAJAS
                </h5>
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
            </div>

            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">

                <div class="row g-3">
                    <div class="col-md-12">
                        <div class="table-responsive">
                            <table class="table tabla-personalized w-100 p-3" id="tablaCajasProduccion">
                                <thead class="table display">
                                    <tr>
                                        <th class="M text-center">FECHA PRODUCCIÓN</th>
                                        <th class="AG text-center">TIPO</th>
                                        <th class="AG text-center">LOTE DE PRODUCCIÓN</th>
                                        <th class="AG text-center">LOTE DE PROVEEDOR</th>
                                        <th class="AG text-center">PROVEEDOR</th>
                                        <th class="AG text-center">CAJAS</th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th colspan="5" style="text-align:right">TOTALES</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

{{-- Configuracion de PROYECCIÓN--}}

<div class="modal fade" id="modalId" tabindex="-1" data-bs-keyboard="false" role="dialog" aria-labelledby="modalTitleId"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role="document">
        <div class="modal-content rounded-4 border-0">
            <div class="modal-container border-0">
                <div class="modal-header-custom">
                    <h2><i class="fas fa-gears"></i> Configuración Proyección</h2>
                </div>
                <div class="modal-body-custom">
                    <div class="peso-section">
                        <label>
                            <i class="fas fa-weight-hanging"></i>
                            Kilos Materia Prima / Dia.
                        </label>
                        <div class="peso-input-wrapper">
                            <input type="number" id="ritmoKg" placeholder="Ingrese el peso" min="0.01" step="0.01">
                            <span class="unit">kg</span>
                        </div>
                    </div>
                    <div class="card-title text-center fw-semibold"><i class="fa-solid fa-tags me-2"></i>Rendimientos
                        Por Referencia</div>
                    <div id="inputsRitmo" class="row mt-4 mb-2"></div>
                    <div class="cajas-grid" id="ritmoCajas">
                        <!-- Las tarjetas se generarán dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>