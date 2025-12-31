<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión del Área de Alistamiento</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1"></i>
        <span>Inicio</span>
    </a>
</div>

<div class="container-fluid">
    <div class="row mb-4">
        <div id="carouselCards" class="carousel slide" data-bs-ride="slide">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <div class="content d-flex justify-content-between gap-3">
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Maduros</h6>
                                            <h3 class="mb-1" id="Maduros">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow" style="background-color: #2a93da">
                                            <i class="fa-solid fa-chart-bar fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Rechazo</h6>
                                            <h3 class="mb-1" id="Rechazo">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow" style="background-color: #da2a2a">
                                            <i class="fa-solid fa-chart-pie fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Canastillas</h6>
                                            <h3 class="mb-0" id="Canastillas">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow" style="background-color: #000000">
                                            <i class="fa-solid fa-kaaba fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselCards" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselCards" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    </div>
    <div class="row mt-4 mb-2 justify-content-center">
        <div class="col-12 mb-2 mt-4">
            <div class="col-4">
                <div class="input-group">
                    <input type="text" class="form-control shadow-sm" id="inputSearch"
                        placeholder="Buscar Contenedor.." autocomplete="off">
                    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
                <div class="input-group">
                    <div class="list-group suggestions" id="suggestions">

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2 justify-content-between">
        <div class="col mb-3">
            <div class="card border-0 rounded-4 shadow-sm ">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #df751eff">
                    <div class="col">
                        <h3 class="fw-bold text-white m-0 text-uppercase">Informe Control de Alistamiento</h3>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                    </div>
                </div>
                <div class="card-body">
                    <div id="carouselTbl" class="carousel slide" data-bs-ride="slide">
                        <div class="carousel-inner" id="carousel-inner">
                            <div class="carousel-item active text-center" id="carousel-item1" data-index="0">
                                <div class="content d-flex justify-content gap-3">
                                    <img src="/assets/images/logo-clean.png" alt="logo empresa"
                                        class="img-fluid mx-auto">
                                </div>
                            </div>
                            <div class="carousel-item text-center" id="carousel-item2" data-index="1">
                                <div class="content d-flex justify-content">
                                    <div class="col-12 mt-2 mb-3">
                                        <div class="table-responsive" id="tabl-dinamica-alistamiento">
                                            <table class="table table-hover tabla-personalized w-100 p-1"
                                                id="tablaAlistamiento">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" class="I text-center">
                                                            Fecha Produccion</th>
                                                        <th scope="col" class="I text-center">
                                                            Maduro</th>
                                                        <th scope="col" class="I text-center">
                                                            Rechazo</th>
                                                        <th scope="col" class="I text-center">
                                                            Desinfectados</th>
                                                        <th scope="col" class="I text-center">
                                                            Canastillas</th>
                                                        <th scope="col" class="M text-center">
                                                            Accion</th>
                                                    </tr>
                                                </thead>
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
            </div>
        </div>
        <div class="col mb-3">
            <div class="card border-0 rounded-4 shadow-sm">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #24243c">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0">RENDIMIENTO PELADORES</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-pelares">
                        <table class="table table-hover tabla-personalized w-100 p-2" id="tablaInfoPersonal">
                            <thead>
                                <tr>
                                    <th scope="col" class="I text-center"><i class="fa-solid fa-hashtag"></i></i>
                                        Pelador</th>
                                    <th scope="col" class="I text-center"><i class="fa-solid fa-circle-user"></i>
                                        Promedio</th>
                                    <th scope="col" class="I text-center"><i class="fa-solid fa-location-dot"></i>
                                        Total</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="ModalInfoAlistamiento" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="card-header">
                <div class="row g-3 mt-1 p-3">
                    <div class="mb-3 col-3 text-center">
                        <label for="fecha_info" class="form-label fw-bold mb-1 mt-1">FECHA PRODUCCIÓN</label>
                        <input type="date" class="form-control form-control-sm rounded-pill shadow-sm mt-1"
                            style="text-align: center; font-size: large;" id="fecha_info" readonly>

                    </div>
                    <div class="mb-3 col-9" style="text-align: end">
                        <button class="btn btn- rounded-pill shadow-sm mt-4 text-white " type="button"
                            style="background-color: #24243c" data-bs-toggle="collapse" data-bs-target=".multi-collapse"
                            aria-expanded="false" aria-controls="collapse1 collapse2">PROVEEDORES</button>
                    </div>

                </div>
            </div>
            <div class="modal-body p-3">
                <div class="row g-3">
                    <div class="collapse multi-collapse mb-2" id="collapse2">
                        <div class="card border-0 rounded-4 shadow-sm mb-2">
                            <div class="card-body">
                                <table class="table tabla-personalized" id="tablaProveedores" style="width: 100%">
                                    <thead>
                                        <tr>
                                            <th class="fw-bold F text-center" colspan="4">PROVEDORES PROCESADOS</th>
                                        </tr>
                                        <tr>
                                            <th class="T text-center">Nombre</th>
                                            <th class="T text-center">Canastillas</th>
                                            <th class="T text-center">Rechazo</th>
                                            <th class="T text-center">Maduro</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="card border-0 rounded-4 shadow-sm mb-2">
                        <div class="card-body rounded">
                            <table class="table tabla-personalized" id="tablaInfoAlistamiento" style="width: 100%">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="AG" style="text-align: center">PELADORES</th>
                                        <th class="F" style="text-align: center" colspan="4">INFORMACIÓN</th>
                                    </tr>
                                    <tr>
                                        <th class="X text-center">RONDAS</th>
                                        <th class="F text-center">TOTAL</th>
                                        <th class="R text-center">RECHAZO</th>
                                        <th class="M text-center">MADURO</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
            <footer>
                <div class="row g-3 mt-1 text-center p-3">
                    <div class="mb-3 col-4 mt-3">
                        <label for="maduro_info" class="form-label fw-bold">MADURO</label>
                        <input type="text" step="0.1" class="form-control form-control-sm rounded-pill shadow-sm"
                            style="text-align: center; font-size: large;" id="maduro_info" readonly>
                    </div>
                    <div class="mb-3 col-4 mt-3">
                        <label for="rechazo_info" class="form-label fw-bold">RECHAZO</label>
                        <input type="text" step="0.1" class="form-control form-control-sm rounded-pill shadow-sm"
                            style="text-align: center; font-size: large;" id="rechazo_info" readonly>
                    </div>
                    <div class="mb-3 col-4 mt-3">
                        <label for="total_info" class="form-label fw-bold">TOTAL CANASTILLAS</label>
                        <input type="number" class="form-control form-control-sm rounded-pill shadow-sm"
                            style="text-align: center; font-size: large;" id="total_info" readonly>
                    </div>
                </div>
            </footer>

        </div>
    </div>
</div>