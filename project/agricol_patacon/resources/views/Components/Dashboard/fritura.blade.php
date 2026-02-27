<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Fritura</p>
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
                    <div class="content d-flex justify-content gap-3">
                        <div class="col-4 mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Lotes</h6>
                                            <h2 class="mb-1" id="Lotes">0</h2>
                                            <small class="" style="color: #1757e0">
                                                <i class="fa-solid fa-tags"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape  text-white border-0 rounded shadow" style="background-color: #2a93da">
                                            <i class="fa-solid fa-tags fa-2x p-1"></i>
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
                    <div class="list-group suggestions" id="suggestions" data-tipo="C">

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col-12">
            <div class="card border-0 rounded-4 shadow-sm ">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #df751eff">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">REGISTROS ÁREA DE FRITURA</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                </div>
                <div class="card-body" id="informe">
                    <div class="table-responsive">
                        <table class="table tabla-personalized w-100 p-3" id="tablaInfoLotes">
                            <thead>
                                <tr>
                                    <th scope="col" class="AG text-center"><i class="fa-solid fa-calendar-day me-2"></i>Fecha</th>
                                    <th scope="col" class="AG text-center"><i class="fa-solid fa-seedling me-2"></i>Producto</th>
                                    <th scope="col" class="AG text-center"><i class="fa-solid fa-kaaba me-2"></i>Canastas</th>
                                    <th scope="col" class="AG text-center"><i class="fa-solid fa-ban me-2"></i>Rechazo</th>
                                    <th scope="col" class="AG text-center"><i class="fa-solid fa-cubes-stacked me-2"></i>Migas</th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-screwdriver-wrench me-2"></i>Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6">
                                        No hay Información Disponible
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

<div class="modal fade" id="ModalInfofritura" tabindex="-1" aria-labelledby="modalFrituraLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0" style="border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #fff; border-radius: 1rem 1rem 0 0; color:#1e1e2f">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">INFORMACIÓN DE FRITURA</h5>
            </div>
            <div class="modal-body" style="background-color: #fff; color: #1e1e2f;">
                <div class="container-fluid">
                    <!-- Tabs -->
                    <ul class="nav nav-tabs" id="prodTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active text-dark" id="general-tab" data-bs-toggle="tab"
                                data-bs-target="#general" type="button" role="tab">Vista General</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="detalle-tab" data-bs-toggle="tab" data-bs-target="#detalle"
                                type="button" role="tab">Reporte Fritura</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="proveedores-tab" data-bs-toggle="tab"
                                data-bs-target="#proveedores" type="button" role="tab">Reporte Proveedores</button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="general" role="tabpanel">
                            <div class="container-fluid mt-4">
                                <div class="row g-3 mb-3">
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Fecha</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="fecha" class="mt-1">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Plátano</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="variedad" class="mt-1">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Aforo aceite</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="aforo" class="mt-1">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Gas</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="indicadorGas"
                                                class="mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Bidones</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="inventario"
                                                class="mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Inicio</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="horaInicio"
                                                class="mt-1"></div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <span class="fw-bold">Fin</span>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="horaFin" class="mt-1">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3 col-6">
                                        <div class="alert"
                                            style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                            <strong>Bajadas: </strong>
                                            <div style="font-size: 0.95rem; color:#2c3f53;" id="bajadas" class="mt-1">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row g-3 mb-3">
                                    <div class="col-12">
                                        <div class="row g-3 mb-3">
                                            <div class="col-md-3 col-6">
                                                <div class="alert"
                                                    style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                                    <strong>Canastillas: </strong>
                                                    <div style="font-size: 0.95rem; color:#2c3f53;" id="total"
                                                        class="mt-1">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-6">
                                                <div class="alert"
                                                    style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                                    <strong>(KG) Patacones: </strong>
                                                    <div style="font-size: 0.95rem; color:#2c3f53;" id="totalMateria"
                                                        class="mt-1">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-6">
                                                <div class="alert"
                                                    style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                                    <strong>Migas: </strong>
                                                    <div style="font-size: 0.95rem; color:#2c3f53;" id="migas"
                                                        class="mt-1">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 col-6">
                                                <div class="alert"
                                                    style="background-color:#f1f3f6; color:#355270; border-left:5px solid #355270;">
                                                    <strong>Rechazo: </strong>
                                                    <div style="font-size: 0.95rem; color:#2c3f53;" id="rechazo"
                                                        class="mt-1">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="col-12">
                                        <div class="card shadow-sm mb-3">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-center mb-2" style="color:#506a85f5;">
                                                    CANASTILLAS POR TIPO
                                                </h6>
                                                <table class="table table-hover tabla-personalized text-center"
                                                    id="tableLotes" style="width: 100%;">
                                                    <thead>
                                                        <tr>
                                                            <th class="X text-center">Lote Produccion</th>
                                                            <th class="X text-center">Tipo</th>
                                                            <th class="X text-center">Canastas</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 p-2">
                                        <strong>Observación:</strong> <span id="observaciones"></span>
                                        <div style="font-size: 0.95rem; color:#2c3f53;" id="observaciones">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade mb-5" id="detalle" role="tabpanel">
                            <div class="container-fluid">
                                <div class="row justify-content-between g-3 mb-3">

                                    <div class="col">
                                        <div class="card border-0 rounded-4 shadow-sm mb-3">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-center mb-2" style="color:#506a85f5;">
                                                    INFORMACIÓN DE PROVEEDOR
                                                </h6>
                                                <table
                                                    class="table table-hover tabla-personalized text-center align-middle"
                                                    id="tableVariablesProveedor" style="width: 100%;">
                                                    <thead>
                                                        <tr>{{--
                                                            <th class="X text-center">Proveedor</th> --}}
                                                            <th class="X text-center">Lote Produccion</th>
                                                            <th class="X text-center">Lote Recepción</th>
                                                            <th class="X text-center">Tipo</th>
                                                            <th class="X text-center"># Canastillas</th>
                                                            <th class="X text-center">(K) Patacón</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="card border-0 rounded-4 shadow-sm mb-3">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-center mb-2" style="color:#506a85f5;">BAJADAS
                                                    FRITURA
                                                </h6>
                                                <table
                                                    class="table table-hover tabla-personalized text-center align-middle"
                                                    id="tablaInfoFritura" style="width: 100%;">
                                                    <thead>
                                                        <tr>
                                                            <th class="X text-center">Lote Recepción</th>
                                                            <th class="X text-center">Tipo</th>
                                                            <th class="X text-center">Peso Patacón (Kg)</th>
                                                            <th class="X text-center"># Canastillas</th>
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
                        <div class="tab-pane fade mb-5" id="proveedores" role="tabpanel">
                            <div class="container-fluid mt-4">
                                <div class="row justify-content-between g-3 mb-3" id="contenedorProveedores">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>