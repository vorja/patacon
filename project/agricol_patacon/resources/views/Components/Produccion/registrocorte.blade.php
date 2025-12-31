<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">
    <title>Agricol del Pacífico S.A.S</title>
    <!-- plugins:css -->

    <!-- endinject -->
    <link rel="shortcut icon" href="/assets/images/favicon.png" />
</head>
<div class="row full-height">
    <!-- Left side - Form -->
    <div class="p-4">
        <div class="row">
            <div class="logo-container col-2">
                <img src="/assets/images/logo-clean.png" alt="Logo de la empresa" class="company-logo">
            </div>
            <div class="title-main col-10 text-center mt-3 ">
                <span class="mb-4 display-4 fw-bold">REGISTRO DE PRODUCCIÓN ÁREA DE CORTE - 04</span>
            </div>

        </div>
        <div class="info-card d-flex mb-4">
            <div class="card-body">
                <h5 class="card-title">Información del Corte</h5>
                <p class="card-text">Detalles sobre el proceso de corte.</p>
            </div>
        </div>

        <form action="" method="POST">
            @csrf
            <div class="card border-0 card-body">
                <div class="row mt-4">
                    <div class="mb-3 col-3">
                        <h4 class="text-titles"><i class="fa-solid  fa-users-line me-2"
                                style="color: #ec6704"></i>Responsable
                        </h4>
                        <div class="border-bottom mb-3"></div>
                        <input type="" class="form-control form-control-lg rounded shadow-sm" id="responsablenombre" name="responsable"
                            list="empeladolist" placeholder="Operario Encargado" required autocomplete="off">
                        <input type="hidden" id="responsableid" name="">
                        <datalist id="empeladolist"></datalist>
                        <div class="invalid-feedback">
                            Este campo es obligatorio.
                        </div>

                    </div>
                    <div class="mb-3 col-3">
                        <h4 class="text-titles"><i class="fa-solid fa-ban me-2" style="color: #ec6704"></i>Total Rechazo
                        </h4>
                        <div class="border-bottom mb-3"></div>
                        <input type="number" min="0" step="0.1" class="form-control form-control-lg rounded shadow-sm numeric"
                            id="rechazo" name="rechazo" placeholder="Cantidad Kg" required readonly>
                        <div class="invalid-feedback">
                            Este campo es obligatorio.
                        </div>
                    </div>
                    <div class="mb-3 col-3 p-3">
                        <div class="border-bottom mb-3  mt-4"></div>
                        <button class="btn btn-md fs-5 text-start shadow-sm text-white w-100 text-center" type="button"
                            data-bs-toggle="collapse" data-bs-target="#collapseProveedores" aria-expanded="false"
                            style="background-color: #6c780d">
                            <strong>Proveedores </strong><span id="cantidadProv" class="badge text-white fw-bold fs-6"
                                style="background-color:#ec6704">0</span>
                        </button>
                    </div>
                </div>

                <div class="row mt-2" id="contenedorProveedores">

                </div>
            </div>

            <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>
            <button type="button" data-tooltip="Observaciones"
                class="btn  flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill"
                style="background-color: #34a1e9; color: #f5f7ff;" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                <i class="ft-message-square text-white fs-2"></i>
            </button>

            <div class="offcanvas offcanvas-end border-0 shadow-lg rounded-4" tabindex="-1" id="offcanvasRight"
                aria-labelledby="offcanvasRightLabel">
                <div class="offcanvas-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
                    <h4 class="offcanvas-title text-white fw-bold" id="offcanvasRightLabel">INFORMACIÓN ADICIONAL</h4>
                </div>
                <div class="offcanvas-body">
                    <div class="row">
                        <div class="mb-3 col-12">
                            <label for="Observaciones" class="form-label">
                                <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>Observaciones
                            </label>
                            <textarea class="form-control shadow-sm" id="Observaciones"
                                placeholder="Ej | Mal estados de muchos.. " rows="8"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-3 p-3 mt-3">
                <button type="button" class="btn btn-lg fs-5 text-white" data-bs-toggle="modal"
                    data-bs-target="#exampleModal" style="background-color: #24243c">
                    <i class="fa-solid fa-clipboard fs-4 me-2"></i>
                    Cortes
                </button>
            </div>

            <table class="table table-hover table-striped custom-table info-card tabla-personalized" id="InfoCorte">
                <thead>
                    <tr>
                        <th rowspan="1" colspan="3" class=""
                            style="background-color: #6c780d; color: #ffffff; font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif">
                            Información de Cortes.</th>
                    </tr>
                    <tr>
                        <th class="F" style="text-align: center">Proveedor</th>
                        <th class="M" style="text-align: center">Tipo</th>
                        <th class="M" style="text-align: center">Cortes (Kg)</th>
                        <th class="hide"></th>
                        <!--hide  -->
                        <th class="hide"></th>
                        <!--hide  -->
                    </tr>
                </thead>
                <tbody>
                    <tr>

                    </tr>
                </tbody>
            </table>

            <div class="col text-start mt-4">
                <button type="submit" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
                    style="background-color: #ec6704; color: #f5f7ff;" id="enviarRegistroCorteButton"><i
                        class="fa-solid fa-save fs-3 me-2"></i>GUARDAR REGISTRO
                </button>
            </div>
        </form>
    </div>

    <div class="modal fade" id="exampleModal" tabindex="-1" data-bs-backdrop="static"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg ">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #ec6704;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0">REGISTRAR CORTES DE PROVEEDORES</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body p-4" style="background-color: #f5f7ff; color: #070707;">
                    <div class="row mt-3">
                        <div class="mb-3 mt-2">
                            <div class="row">
                                <div class="col-6">
                                    <h5 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Proveedor
                                    </h5>
                                    <input class="form-control form-control rounded shadow-sm"
                                        style="background-color:#ffffff; color:#070707;" id="nombreProveedor"
                                        list="proveedoreslist" name="nombre_proveedor" autocomplete="off"
                                        placeholder="Lista de Proveedores..">
                                    <input class="form-control" hidden id="id_proveedor" required>
                                    <datalist id="proveedoreslist"></datalist>
                                </div>

                                <div class="col-6">
                                    <h5 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-tags me-2" style="color:#ec6704;"></i> Referencia de Corte
                                    </h5>
                                    <div class="dropdown">
                                        <button class="btn dropdown-toggle w-100 p-2 text-white fw-bold"
                                            style="background-color: #24243c" type="button" disabled id="dropdownTipos"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            SELECCIONAR REFERENCIAS
                                        </button>
                                        <ul class="dropdown-menu w-100" aria-labelledby="dropdownTipos"
                                            style="max-height: 250px; overflow-y: auto;" id="tipo">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3 mt-4">
                            <h5 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-layer-group me-2" style="color:#ec6704;"></i>Tipos de Corte
                            </h5>
                            <p class="text-body-secondary text-center font-monospace" id="alertInfo"> No Hay Información
                                Disponible...</p>
                            <div class="row mt-2" id="contenedorTipos">

                            </div>
                        </div>

                        <div class="mb-3 mt-4">
                            <h5 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-ban me-2" style="color:#ec6704;"></i>Rechazo
                            </h5>
                            <div class="row justify-content-between ">
                                <div class="col-3">
                                    <input class="form-control form-control-lg  rounded shadow-sm fs-5 text-center fw-semibold text-center"
                                        type="number" min="0" style="background-color:#ffffff; color:#070707;" disabled
                                        placeholder="Rechazo Kg" id="rechazoProveedor" autocomplete="off">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-lg fs-3 btn-danger text-white" data-bs-dismiss="modal"><i
                            class="fa-solid fa-xmark fs-3 text-white "></i></button>
                    <button type="button" id="btnDetalleCorte" class="btn btn-lg fs-3 text-white"
                        style="background-color: #6c780d"><i class="fa-solid fa-save fs-3"></i> </button>
                </div>
            </div>
        </div>
    </div>
</div>  
<script type="module" src="{{ asset('assets/js/modules/Produccion/corte.js') }}"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>