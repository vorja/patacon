<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Empaque</p>
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
                                            <h6 class="text-uppercase text-muted mb-2">Registros</h6>
                                            <h3 class="mb-0" id="Registros">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da;">
                                            <i class="fa-solid fa-chart-bar fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4  shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Rechazo</h6>
                                            <h3 class="mb-0" id="Rechazo">0</h3>
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
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Migas</h6>
                                            <h3 class="mb-0" id="Migas">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-cubes-stacked"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #ff9939">
                                            <i class="fa-solid fa-cubes-stacked fa-2x p-1"></i>
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
    <div class="row mt-4 justify-content-center">
        <div class="col-12">
            <div class="card border-0 rounded-4 shadow-sm">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #df751eff">

                    <div class="col">
                        <h3 class="fw-bold text-white m-0 text-uppercase"> Registros Área Empaque</h3>
                    </div>
                    <div class="col-2">
                        <input type="month" class="form-control rounded-4 border-0 shadow-sm text-center text-uppercase"
                            id="inputFecha">
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
                                        <div class="table-responsive" id="tabl-dinamica-empaque">
                                            <table class="table table-hover tabla-personalized w-100 p-3"
                                                id="tableEmpaque">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-calendar"></i> Empaque
                                                        </th>
                                                        <th scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-tag"></i> Lote Empaque
                                                        </th>

                                                        <th rowspan="2" scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-box-open"></i> Cajas
                                                        </th>

                                                        <th rowspan="2" scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-ban"></i> Rechazo
                                                        </th>
                                                        <th rowspan="2" scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-cubes-stacked"></i> Migas
                                                        </th>
                                                        <th rowspan="2" scope="col" class="AG text-center">
                                                            <i class="fa-solid fa-person-circle-question"></i>
                                                            Observaciones
                                                        </th>
                                                        <th rowspan="2" scope="col" class="M text-center"><i
                                                                class="fa-solid fa-screwdriver-wrench me-1"></i>Acciones
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th> <input type="date"
                                                                class="form-control form-control-sm text-center">
                                                        </th>
                                                        <th><select
                                                                class="form-select form-select-sm text-center"></select>
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

<div class="modal fade" id="ModalEmpaque" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header rounded-top-4 justify-content-center align-items-center">
                <h3 class="fw-bold m-0" style="color: #1e1e2f;" id="createModalLabel">INFORMACIÓN DE EMPAQUE</h3>
            </div>
            <div class="modal-body">
                <div class="row g-3 mb-3 mt-3">
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Fecha Empaque</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="fechaEmpaque">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Lote Empaque</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="loteEmpaque">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Total Cajas</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="totalCajas">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Total Canastas</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="totalCanastas">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Rechazo</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="totalRechazo">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="alert"
                            style="background-color:#f1f3f6; color:#6c780d; border-left:5px solid #ff9900;">
                            <span class="fw-bold">Migas</span>
                            <div class="mt-2 fw-semibold" style="font-size: 0.95rem; color:#2c3f53;" id="totalMigas">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row g-3 mb-3 mt-3">
                    <div class="card p-2 shadow-sm border-0 rounded-4 mb-2">
                        <div class="card-body">
                            <div class="table-responsive">

                                <table class="table tabla-personalized display" id="tablaProveedores"
                                    style="width: 100%">
                                    <thead>
                                        <tr>
                                            <th class="fw-bold AG text-center" colspan="7">PROVEDORES REGISTRADOS</th>
                                        </tr>
                                        <tr>{{--
                                            <th class="T">Nombre</th> --}}
                                            <th class="T text-center">FECHA PRODUCCION</th>
                                            <th class="T text-center">LOTE PROVEEDORES</th>
                                            <th class="O text-center">CAJA TIPO</th>
                                            <th class="O text-center">CANASTAS</th>
                                            <th class="O text-center"># CAJAS</th>
                                            <th class="O text-center">RECHAZO</th>
                                            <th class="O text-center">MIGAS</th>
                                        </tr>
                                    </thead>
                                    <tfoot>
                                        <tr>
                                            <th colspan="4" style="text-align:right">TOTALES:</th>
                                            <th></th>
                                            <th></th>
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
</div>