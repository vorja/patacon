<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Materia Prima</p>
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
            type="button" role="tab">Inv. Plano Recepcionado</button>
    </li>

    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" id="produccion-tab" data-bs-toggle="tab" data-bs-target="#inventario"
            type="button" role="tab">Inv. Platano Maduro</button>
    </li>

</ul>

<div class="tab-content">
    <div class="tab-pane fade show active" id="general" role="tabpanel">

        <div class="row mt-4 justify-content-center">
            <div class="col">
                <div class="card mb-4 shadow-sm rounded-4 border-0 p-3">
                    <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                        style="background-color: rgb(108, 120, 13);
               ">
                        <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                            <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                                style="max-height: 55px;">
                            <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                        </div>
                        <h3 class="fw-bold text-white m-0">MATERIA PRIMA RECEPCIONA</h3>
                        <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                            <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                                style="max-height: 55px;">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table tabla-personalized w-100 p-3" id="tablaMateria">
                                <thead>
                                    <tr>
                                        <th class="AG text-center"><i class="fa-solid fa-calendar me-1"></i>Fecha de
                                            Recepcion
                                        </th>
                                        <th class="AG text-center"><i class="fa-solid fa-seedling me-1"></i>PRODUCTO
                                        </th>
                                        <th class="AG text-center"><i class="fa-solid fa-tags me-1"></i>
                                            LOTE PROVEEDOR</th>
                                        <th class="F text-center">Mat. Recepcionada</th>
                                        <th class="M text-center">Mat. Procesada</th>
                                        <th class="H text-center">Mat. Restante</th>
                                        <th class="text-center"> ACCION</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="7"> No hay Información Disponible</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                            <div class="col-2 mt-2 mb-3">
                                <div class="card border-0 rounded-4 shadow-sm">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="text-uppercase text-muted mb-2">Platano Maduro</h6>
                                                <h2 class="mb-1" id="totalMateria">0</h2>
                                                <small class="text-dark">
                                                    <i class="fa-solid fa-cubes-stacked"></i>
                                                </small>
                                                <span class="text-muted" id="">Total</span>
                                            </div>
                                            <div class="icon icon-shape text-white border-0 rounded shadow"
                                                style="background-color: #6c780d">
                                                <i class="fa-solid fa-seedling fa-2x p-1"></i>
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
        <div class="row mt-4 justify-content-center">
            <div class="col-12">
                <div class="card mb-4 shadow-sm rounded-4 border-0 p-3">
                    <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                        style="background-color:rgb(223,117,30);">
                        <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                            <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                                style="max-height: 55px;">
                            <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                        </div>
                        <H3 class="fw-bold text-white m-0">INVENTARIO DE PLATANO MADURO </H3>
                        <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                            <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                                style="max-height: 55px;">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table tabla-personalized w-100 p-2" id="tablaMaduro">
                                <thead>
                                    <tr>
                                        <th class="M text-center"><i class="fa-solid fa-calendar me-1"></i>FECHA
                                        </th>
                                        <th class="M text-center"><i class="fa-solid fa-seedling me-1"></i>PRODUCTO
                                        </th>
                                        <th class="M text-center"><i class="fas fa-tag me-1"></i>LOTE RECEPCION</th>
                                        <th class="M text-center"> CANTIDAD</th>
                                        <th class="text-center"></th>
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

<div class="modal fade" id="ModalInfo" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <!-- Header -->
            <div class="modal-header justify-content-between rounded-top-4" style="background-color: #6c780d;">
                <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                    <div class="bg-white btn-light shadow-lg rounded-circle p-2">
                        <i class="fa-solid fa-kaaba fs-3 p-1 shadow-sm rounded" style="color: #ec6704"></i>
                    </div>
                </div>
                <h5 class="modal-title fw-bold" id="modalInfoRecepcionLabel" style="color:#ffffff;">
                    INFORMACIÓN DE MATERIA PRIMA
                </h5>
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
            </div>

            <div class="modal-body px-4 py-3" style="background-color: #f5f7ff; color: #070707;">
                <!-- Información principal -->
                <div class="row mb-4" id="infoPrincipal">
                    <!-- Se llenará dinámicamente -->
                </div>

                <!-- Tabs -->
                <ul class="nav nav-tabs mb-3" id="infoTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-semibold active" id="recepcion-tab" data-bs-toggle="tab"
                            data-bs-target="#recepcion" type="button" role="tab">Recepción OP</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-semibold" id="detalle-tab" data-bs-toggle="tab"
                            data-bs-target="#detalle" type="button" role="tab">Detalle Recepción</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-semibold" id="maduro-tab" data-bs-toggle="tab"
                            data-bs-target="#maduro" type="button" role="tab">Plátano Maduro</button>
                    </li>
                </ul>

                <div class="tab-content">
                    <!-- Tab Recepción OP -->
                    <div class="tab-pane fade show active" id="recepcion" role="tabpanel">
                        <div id="infoRecepcionOp" class="p-3">
                            <!-- Contenido dinámico -->
                        </div>
                    </div>

                    <!-- Tab Detalle Recepción -->
                    <div class="tab-pane fade" id="detalle" role="tabpanel">
                        <div class="table-responsive">
                            <table class="table tabla-personalized w-100" id="tablaDetalleRecepcion">
                                <thead>
                                    <tr>
                                        <th class="text-center">N</th>
                                        <th class="text-center">Canastillas / Racimos</th>
                                        <th class="text-center">Peso (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyDetalleRecepcion">
                                    <!-- Llenado dinámico -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab Plátano Maduro -->
                    <div class="tab-pane fade" id="maduro" role="tabpanel">
                        <div class="table-responsive">
                            <table class="table tabla-personalized w-100" id="tablaMaduroRelacionado">
                                <thead>
                                    <tr>
                                        <th class="text-center">Fecha</th>
                                        <th class="text-center">Producto</th>
                                        <th class="text-center">Lote</th>
                                        <th class="text-center">Cantidad (Kg)</th>
                                        <th class="text-center">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyMaduroRelacionado">
                                    <!-- Llenado dinámico -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
