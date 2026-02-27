<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Área Corte</p>
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
                    <div class="content d-flex justify-content-mb-3 gap-3">
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Registros</h6>
                                            <h2 class="mb-1" id="Registros">0</h2>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da">
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
                                            <h2 class="mb-1" id="Rechazo">0</h2>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #da2a2a">
                                            <i class="fa-solid fa-chart-pie fa-2x p-1"></i>
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
                    <input type="text" class="form-control shadow-sm" id="inputSearch" placeholder="Buscar Contenedor.."
                        autocomplete="off">
                    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
                <div class="input-group">
                    <div class="list-group suggestions" id="suggestions" data-tipo="C">

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-4">
        <div class="col-12">
            <div class="card shadow border-0 rounded-4 ">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center p-3"
                    style="background-color: #df751eff">
                    <div class="col">
                        <h3 class="fw-bold text-white m-0 text-uppercase"> Produccion Área Corte</h3>
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
                                <div class="content d-flex justify-content gap-3">
                                    <div class="col-12 mt-2 mb-3">
                                        <div class="table-responsive" id="tabl-dinamica-corte">
                                            <table class="table table-hover tabla-personalized w-100 p-3"
                                                id="tablaCortes">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-calendar me-1"></i>Fecha
                                                        </th>

                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-seedling me-1"></i>Materia
                                                        </th>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-ban me-1"></i>Rechazo
                                                        </th>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-person-circle-question me-1"></i>Observaciones
                                                        </th>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-person me-1"></i>Resposable
                                                        </th>

                                                        <th scope="col" class="M text-center">
                                                            <i class="fa-solid fa-screwdriver-wrench me-2"></i>Acciones
                                                        </th>
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
    </div>
</div>

<div class="modal fade" id="ModalInfoCorte" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header border-0  justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACIÓN DE REGISTRO DE CORTE</h5>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="card p-1 border-0 shadow-sm mb-2">
                        <div class="card-body rounded p-2">
                            <div class="row d-flex justify-content-center">
                                <div class="col">
                                    <table class="table tabla-personalized mt-2 " id="tablaInfoCorte"
                                        style="width: 100%">
                                        <thead>
                                            <tr>
                                                <th class="S" rowspan="2" style="text-align: center">PROVEEDORES</th>
                                                <th class="I text-center" colspan="5">INFORMACIÓN</th>
                                            </tr>
                                            <tr>
                                                <th class="F text-center">Fecha </th>
                                                <th class="F text-center">Lote </th>
                                                <th class="F text-center">Total Kg </th>
                                                <th class="F text-center">Rechazo </th>
                                                <th class="F text-center">Rendmiento</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-center mt-3">
                                <div class="col">
                                    <table class="table tabla-personalized mt-3" id="tablaCortesProveedor"
                                        style="width: 100%">
                                        <thead>
                                            <tr>
                                                <th class="I text-center" colspan="4">INFORMACIÓN DE CORTES DE PROVEEDOR
                                                </th>
                                            </tr>
                                            <tr>
                                                <th class="F text-center">Proveedor </th>
                                                <th class="F text-center">lote </th>
                                                <th class="F text-center">Tipo </th>
                                                <th class="F text-center">Cantidad</th>
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
            <footer>
                <div class="row g-3 mt-1 justify-content-between p-3">
                    <div class="mb-3 col-4 mt-3 text-center">
                        <label for="fecha" class="form-label fw-bold mb-2">FECHA PRODUCCIÓN</label>
                        <input type="date" class="form-control form-control-sm rounded-pill shadow-sm"
                            style="text-align: center; font-size: large;" id="fecha_info" readonly>
                    </div>
                    <div class="mb-3 col-4 mt-3 text-center">
                        <label for="fecha" class="form-label fw-bold mb-2">RECHAZO</label>
                        <input type="text" class="form-control form-control-sm rounded-pill shadow-sm"
                            style="text-align: center; font-size: large;" id="rechazo_info" readonly>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</div>