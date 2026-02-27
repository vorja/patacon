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


<form method="POST" class="p-3">
    @csrf

    <div class="row">
        <div class="logo-container col-2">
            <img src="/assets/images/logo-clean.png" alt="Logo de la empresa" class="company-logo">
        </div>
        <div class="title-main col-10 text-center mt-3 ">
            <span class="mb-4 display-3 fw-bold">REGISTRO DE RECEPCION DE MATERIA PRIMA - 01</span>
        </div>

    </div>
    <div class="info-card shadow d-flex mt-2">
        <div class="card-body">
            <h5 class="card-title">Información de Recepción de Materia prima</h5>
            <p class="card-text">Detalles sobre el proceso de recepción.</p>
        </div>
    </div>
    <div class="card border-0 rounded-4  mb-3 mt-4">
        <div class="card-header-info text-white  fw-semibold"><i class="fa-solid fa-circle-info me-2"></i>Datos
            Generales</div>
        <div class="card-body">
            <div class="row">
                <div class="mb-3 col-6 mt-2">
                    <h5 class="text-titles"> <i class="fa-solid fa-calendar-days me-2" style="color: #ec6704"></i> Fecha
                        Recepcion</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg shadow-sm rounded" id="fecha_procesamiento"
                        placeholder="Fecha recepción" name="fecha_procesamiento" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3 mt-2">
                    <h5 class="text-titles"><i class="fa-solid fa-calendar-day me-2" style="color: #ec6704"></i>Fecha
                        Produccion</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg shadow-sm text-center rounded" id="fecha"
                        name="fecha" placeholder="Fecha Produccion" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <input type="hidden" value="" class="form-control shadow-sm" id="idEncargo" name="idEncargo" required>

                <div class="mb-3 col-6 col-md-3 mt-2 position-relative">
                    <h5 class="text-titles"><i class="fa-solid fa-truck-front me-2" style="color: #ec6704"></i>
                        Proveedor</h5>
                    <div class="border-bottom mb-3"></div>

                    <input class="form-control form-control-lg shadow-sm rounded" id="nombreProveedor" placeholder="Buscar proveedor..."
                        required autocomplete="off">

                    <!-- Lista de sugerencias -->
                    <div class="list-group position-absolute w-100" id="suggestions"
                        style="z-index: 1000; max-height: 200px; overflow-y: auto; display: none;">
                    </div>

                    <input class="form-control" id="id_proveedor" name="id_proveedor" hidden required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-6 col-md-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-seedling me-2" style="color: #ec6704"></i>Producto
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="text" list="variedadlist" class="form-control form-control-lg shadow-sm rounded"
                        placeholder="Variedad de Plátano" id="variedad" name="variedad[]" required autocomplete="off">
                    <input type="hidden" name="variedadid[]" id="variedadid" required>
                    <datalist id="variedadlist">
                        <option value="Comino"></option>
                        <option value="Hawaiano"></option>
                        <option value="Harton"></option>
                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-tags me-2" style="color: #ec6704"></i>Lote Recepción
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="text" readonly
                        class="form-control form-control-lg shadow-sm rounded text-center fw-semibold"
                        id="lote_produccion" name="lote_produccion" required>
                    <div class="invalid-feedback">
                        Este debe estar completo.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704"></i>Responsable</h5>
                    <div class="border-bottom mb-3"></div>
                    <input class="form-control form-control-lg shadow-sm rounded" id="nombreResponsable"
                        list="empleadolist" name="nombreResponsable" required autocomplete="off">
                    <input class="" type="hidden" id="responsableid" name="responsableid" required>
                    <datalist id="empleadolist">
                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>

                    <input type="hidden" name="ordenactual" id="ordenactual">
                </div>
                <div class="mb-3 col-6 col-md-3 p-3 mt-3">
                    <div class="border-bottom mb-3 mt-4"></div>
                    <button type="button" class="btn btn-md fs-5 w-100 btn-white text-white shadow-sm rounded"
                        data-bs-toggle="modal" data-bs-target="#registroInfo" style="background-color: #24243c">
                        <i class="fa-solid fa-clipboard fs-4 me-2"></i>
                        Canastas
                    </button>
                </div>
            </div>
        </div>

        <div class="card border-0  mb-3">
            <div class="card-header bg-dark text-white"><i class="fa-solid fa-circle-info me-2"
                    style="color:#ec6704;"></i>Resumen de Proceso</div>
            <div class="card-body">
                <div class="row d-flex justify-content-center align-items-center mt-2">
                    <div class="mb-3 mb-3 col-6 col-md-4">
                        <label for="migas_proceso" class="form-label"><i class="fa-solid fa-kaaba  me-2"
                                style="color: #ec6704"></i>Total Canastillas</label>

                        <input type="number" min="0" disabled value="0"
                            class="form-control form-control-lg text-center numeric fw-semibold" id="totalCanastilla"
                            name="totalCanastilla" required>
                    </div>
                    <div class="mb-3 mb-3 col-6 col-md-4">
                        <label for="subTotal" class="form-label">Sub Total</label>

                        <input type="number" min="0" disabled value="0"
                            class="form-control form-control-lg text-center numeric fw-semibold" id="subTotal"
                            name="subTotal" required>
                    </div>
                    <div class="mb-3 mb-3 col-6 col-md-4">
                        <label for="pesoTotal" class="form-label"> <i class="fa-solid fa-scale-balanced me-2"
                                style="color: #ec6704"></i>Peso Total</label>

                        <input type="number" min="0" disabled value="0"
                            class="form-control form-control-lg text-center numeric fw-semibold" id="pesoTotal"
                            name="pesoTotal">
                    </div>

                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="registroInfo" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 modal-dialog-scrollable shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #6c780d;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h4 class="fw-bold text-white m-0" style="font-family: Arial, Helvetica, sans-serif">REGISTRO DE
                        INFORMACIÓN RECEPCION <span class="badge text-white fs-5 p-2 fw-bold"
                            style="background-color: #ec6704 ;"></span> </h4>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">
                    <div class="row mt-1 d-flex justify-content-center p-2">
                        <div class="row text-center mt-1 p-2">
                            <div class="col">
                                <h4 class="fw-semibold text-uppercase" style="color:#24243c;">
                                    <i class="fa-solid fa-fire me-2" style="color:#ec6704;"></i> INFORMACIÓN DE ( PESO /
                                    CANASTILLAS )

                                </h4>
                                <div class="border-bottom mb-3"></div>
                            </div>
                        </div>
                        <div class="row d-flex justify-content-between p-3 mt-4">
                            <div class="col-6">
                                <h4 class="fw-semibold text-uppercase mt-3"
                                    style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                    <i class="fa-solid fa-kaaba  me-2" style="color:#ec6704;"></i>
                                    Canastillas / Racimos
                                </h4>
                                <input type="number"
                                    class="form-control form-control-lg rounded shadow-sm fs-4 text-center numeric"
                                    min="0" placeholder="# Canastillas / Racimos" id="canastillas" required>

                                <div class="invalid-feedback">
                                    Este campo es obligatorio.
                                </div>
                            </div>

                            <div class="col">
                                <h4 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                    <i class="fa-solid fa-scale-unbalanced-flip me-2" style="color:#ec6704;"></i>
                                    Peso
                                </h4>
                                <input type="number"
                                    class="form-control form-control-lg rounded shadow-sm fs-4 text-center numeric"
                                    min="0" placeholder="Peso Kg" id="pesoKg" required>
                                <div class="invalid-feedback">
                                    Este campo es obligatorio.
                                </div>
                            </div>
                            <div class="col text-start">
                                <button type="button"
                                    class="btn  shadow-lg fw-bold text-white p-2 mt-5 fs-4 btn-Canastillas"
                                    style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c;"
                                    id="btnRegistrarFritura">
                                    <i class="fa-solid fa-circle-check me-2"></i> REGISTRAR </button>
                            </div>
                        </div>
                        <div class="row mt-1 p-2">
                            <div class="col-12">
                                <div class="card-body">
                                    <div class="card-body table-responsive">
                                        <table class="table tabla-personalized p-3" id="tablaRecepcion">
                                            <thead>
                                                <tr>
                                                    <th class="F text-center">#</th>
                                                    <th class="AG text-center">CANASTILLAS Ó RACIMOS</th>
                                                    <th class="M text-center">PESO (KG)</th>
                                                    <th style="text-align: center;">ACCION</th>
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
                <div class="modal-footer justify-content-between">

                    <button type="button" class="btn btn-lg fs-2 p-3 px-4 btn-danger text-white" data-bs-dismiss="modal"
                        id="btnCloseModal">
                        <i class="fa-solid fa-xmark fs-4"></i>
                    </button>

                    <button type="button" class="btn btn-lg fs-2 p-3 px-4 btn-warning text-white" id="clearButton">
                        <i class="fa-solid fa-trash-can fs-4"></i> 
                    </button>

                    <button type="button" class="btn btn-lg fs-2 p-3 px-4 text-white btn-Obtener"
                        id="btnObtenerCanastillas" style="background-color: #6c780d">
                        <i class="fa-solid fa-save fs-4"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <button type="button" data-tooltip="Observaciones"
        class="btn  flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill"
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"
        style="background-color: #34a1e9; color: #f5f7ff;">
        <i class="ft-message-square text-white fs-2"></i>
    </button>

    <div class="offcanvas offcanvas-end border-0 shadow-lg rounded-4" tabindex="-1" id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel">
        <div class="offcanvas-header justify-content-center rounded-top-4" style="background-color: #ec6704;">
            <h5 class="offcanvas-title text-white fw-bold" id="offcanvasRightLabel">INFORMACIÓN ADICIONAL</h5>
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
    <button id="btnGuardar" type="submit" class="btn  btn-lg w-100 fw-bold fs-4 rounded-4"
        style="background-color: #ec6704; color: #f5f7ff;">
        <i class="fa-solid fa-floppy-disk fs-3 me-2"></i>GUARDAR REGISTRO</button>
</form>

<script type="module" src="{{ asset('assets/js/modules/Produccion/recepcionOp.js') }}"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>