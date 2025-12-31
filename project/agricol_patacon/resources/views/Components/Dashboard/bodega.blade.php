<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Bodega</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1"></i>
        <span>Inicio</span>
    </a>
</div>

<!-- Tabs -->
<ul class="nav nav-tabs mb-3" id="prodTabs" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active fw-semibold" id="general-tab" data-bs-toggle="tab" data-bs-target="#general"
            type="button" role="tab">Inv. Canastas</button>
    </li>

    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" id="produccion-tab" data-bs-toggle="tab" data-bs-target="#inventario"
            type="button" role="tab">Inv. Cajas</button>
    </li>

</ul>

<div class="tab-content">
    <div class="tab-pane fade show active" id="general" role="tabpanel">
        <div class="card mb-4 shadow-sm rounded-4 border-0">
            <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                style="background-color:rgb(223,117,30);">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                        style="max-height: 55px;">
                    <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                </div>
                <H3 class="fw-bold text-white m-0">CANASTILLAS DE PRODUCCIONES</H3>
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                        style="max-height: 55px;">
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table tabla-personalized w-100 p-3" id="tablaCanastillas">
                        <thead>
                            <tr>
                                <th class="AG text-center"><i class="fa-solid fa-calendar"></i> Fecha de Produccion</th>
                                <th class="AG text-center"><i class="fa-solid fa-tags"></i> Lote de Produccion</th>
                                <th colspan="2" class="AG text-center"><i class="fa-solid fa-kaaba"></i>
                                    Canastillas</th>
                                <th rowspan="2" class="F text-center">Saldo</th>
                                <th rowspan="2" class="H text-center">Info</th>
                            </tr>
                            <tr>
                                <th><input type="date" class="form-control form-control-sm text-center"></th>
                                <th><input type="text" class="form-control form-control-sm text-center"></th>
                                <th class="text-center"><i class="fa-solid fa-boxes-packing"></i> Producidas</th>
                                <th class="text-center"><i class="fa-solid fa-box-open"></i> Empacadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6"> No hay Información Disponible</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="tab-pane fade" id="inventario" role="tabpanel">
        <div class="row mb-4">
            <div id="carouselCards" class="carousel slide" data-bs-ride="slide">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <div class="content d-flex justify-content gap-3">
                            <div class="col mt-2 mb-3">
                                <div class="card border-0 rounded-4 shadow-sm">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - A</h6>
                                                <h2 class="mb-1" id="A">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
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
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - B</h6>
                                                <h2 class="mb-1" id="B">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col mt-2 mb-3">
                                <div class="card border-0 shadow-sm rounded-4 ">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - C</h6>
                                                <h2 class="mb-1" id="C">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
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
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - AF</h6>
                                                <h2 class="mb-1" id="AF">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Cantidad Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <div class="content d-flex justify-content gap-3">
                            <div class="col mt-2 mb-3">
                                <div class="card border-0 rounded-4 shadow-sm">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - BH</h6>
                                                <h2 class="mb-1" id="BH">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
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
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - XL</h6>
                                                <h2 class="mb-1" id="XL">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
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
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - CILINDRO</h6>
                                                <h2 class="mb-1" id="Cilindro">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
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
                                                <h6 class="text-uppercase text-muted mb-2">CAJAS - PINTÓN</h6>
                                                <h2 class="mb-1" id="Pinton">0</h2>
                                                <small style="color:#6c780d">
                                                    <i class="fas fa-box"></i>
                                                </small>
                                                <span class="text-muted">Total</span>
                                            </div>
                                            <div class="icon icon-shape bg-warning text-white border-0 rounded shadow">
                                                <i class="fa-solid fa-box-open fa-2x p-1"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselCards"
                    data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselCards"
                    data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>
        <div class="card mb-4 shadow-sm rounded-4 border-0 ">
            <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                style="background-color: rgb(108, 120, 13);">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                        style="max-height: 55px;">
                    <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                </div>
                <H3 class="fw-bold text-white m-0">INVENTARIO DE CAJAS </H3>
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                        style="max-height: 55px;">
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table tabla-personalized w-100 p-2" id="tableInventario">
                        <thead>
                            <tr>
                                <th class="M text-center">PRODUCCIÓN</th>
                                <th class="M text-center"> <i class="fas fa-box"></i> CAJA TIPO A</th>
                                <th class="M text-center"><i class="fas fa-box"></i> CAJA TIPO B</th>
                                <th class="M text-center"><i class="fas fa-box"></i> CAJA TIPO C</th>
                                <th class="AG text-center"><i class="fas fa-box"></i> CAJA TIPO AF</th>
                                <th class="AG text-center"><i class="fas fa-box"></i> CAJA TIPO BH</th>
                                <th class="AG text-center"><i class="fas fa-box"></i> CAJA TIPO XL</th>
                                <th class="AG text-center"><i class="fas fa-box"></i> CAJA TIPO CILINDRO</th>
                                <th class="AG text-center"><i class="fas fa-box"></i> CAJA TIPO PINTÓN</th>
                                <th class="H text-center">Info</th>
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
{{-- Info Alistamiento --}}
<div class="modal fade" id="ModalInfo" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-between rounded-top-4" style="background-color: #6c780d;">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <div class="bg-white btn-light shadow-lg rounded-circle p-2">
                        <i class="fa-solid fa-kaaba fs-3 p-1 shadow-sm rounded" style="color: #ec6704"></i>
                    </div>
                </div>
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN DE CANASTILLAS
                </h5>
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
            </div>

            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">
                <!-- Sección de título -->
                <ul class="nav nav-tabs mb-3" id="prodTabs" role="tablist">

                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-semibold" id="empacadas-tab" data-bs-toggle="tab"
                            data-bs-target="#empacadas" type="button" role="tab">Inv. Empacadas</button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link  active fw-semibold" id="proveedores-tab" data-bs-toggle="tab"
                            data-bs-target="#proveedores" type="button" role="tab">Inv. Proveedores</button>
                    </li>

                </ul>
                <div class="tab-content">
                    <div class="tab-pane fade" id="empacadas" role="tabpanel">
                        <div class="row g-3 mt-2">
                            <div class="col-md-12">
                                <div class="table-responsive">
                                    <table class="table tabla-personalized w-100 p-3" id="tablaInfo">
                                        <thead class="table">
                                            <tr>
                                                <th class="AG text-center">FECHA DE EMPAQUE</th>
                                                <th class="M text-center">LOTE DE EMPAQUE</th>
                                                <th class="M text-center">FECHA DE PRODUCCIÓN</th>
                                                <th class="M text-center">TIPO</th>
                                                <th class="M text-center">CANASTILLAS</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane show active fade" id="proveedores" role="tabpanel">
                        <div class="row g-3 mt-2">
                            <div class="col-md-12">
                                <div class="table-responsive">
                                    <table class="table tabla-personalized w-100 p-3" id="tablaInfoProveedores">
                                        <thead class="table display">
                                            <tr>
                                                <th rowspan="2" class="AG text-center">LOTE DE PRODUCCION</th>
                                                <th rowspan="2" class="AG text-center">LOTE DE PROVEEDOR</th>
                                                <th rowspan="2" class="AG text-center">TIPO</th>
                                                <th colspan="2" class="M text-center">CANASTAS</th>
                                                <th rowspan="2" class="F text-center">SALDO</th>
                                            </tr>
                                            <tr>
                                                <th class="text-center"><i class="fa-solid fa-boxes-packing"></i>
                                                    Producidas</th>
                                                <th class="text-center"><i class="fa-solid fa-box-open"></i>
                                                    Empacadas</th>
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

<div class="modal fade" id="ModalInfoCajas" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4" >
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
                            <table class="table tabla-personalized w-100 p-3" id="tablaInfoCajas">
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