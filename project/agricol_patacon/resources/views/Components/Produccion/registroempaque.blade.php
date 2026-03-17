<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">
    <title>Agricol del Pacífico S.A.S</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" />
</head>


<form method="POST" class="p-3">
    @csrf

    <div class="row">
        <div class="logo-container col-2">
            <img src="/assets/images/logo-clean.png" alt="Logo de la empresa" class="company-logo">
        </div>
        <div class="title-main col-10 text-center mt-3">
            <span class="mb-4 display-4 fw-bold">REGISTRO DE PRODUCCIÓN ÁREA DE EMPAQUE - 07</span>
        </div>

    </div>
    <div class="info-card d-flex mt-2">
        <div class="card-body">
            <h5 class="card-title">Información de Empaque</h5>
            <p class="card-text">Detalles sobre el proceso de empaque.</p>
        </div>
    </div>
    <div class="card border-0 rounded-4 mb-3 mt-4">
        <div class="card-header-info text-white"> <i class="fa-solid fa-circle-info me-2 text-white"></i>Datos Generales
        </div>
        <div class="card-body">
            <div class="row mt-3">
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-calendar-days me-2" style="color: #ec6704"></i>Fecha
                        Empaque</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg shadow-sm text-center rounded" id="fecha"
                        name="fecha" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>


                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-tags me-2" style="color: #ec6704"></i>Lote de
                        Empaque
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="text" class="form-control form-control-lg shadow-sm text-center rounded"
                        id="lote_empaque" name="lote_empaque" autocomplete="off" placeholder="Lote de Empaque."
                        required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704"></i>Responsable
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="" class="form-control form-control-lg shadow-sm rounded"
                        placeholder="Operario Encargado" id="responsablenombre" name="responsable[]" list="empeladolist"
                        required autocomplete="off">
                    <datalist id="empeladolist"></datalist>
                    <input type="hidden" id="responsableid" name="">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles">Registro Empaque</h5>
                    <div class="border-bottom mb-3"></div>
                    <button type="button" class="btn text-white w-100 fs-5" style="background-color:#24243c"
                        data-bs-toggle="modal" data-bs-target="#ModalEmpaque"><i class="fa-solid fa-clipboard fs-4"></i>
                        Registrar
                    </button>
                </div>

            </div>
        </div>
    </div>
    <div class="card border-0 rounded-4 mb-3">
        <div class="card-header-detail bg-dark text-white"><i class="fa-solid fa-circle-info me-2"
                style="color:#ec6704;"></i>Resumen de Empaque</div>
        <div class="card-body mb-2 table-responsive">
            <div class="row mt-3">
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-kaaba  me-2" style="color: #ec6704"></i>Total
                        Canastas</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg shadow-sm numeric text-center fw-semibold rounded"
                        id="totalCanastas" required readonly autocomplete="off">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-box  me-2" style="color: #ec6704"></i>Total
                        Cajas
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" readonly min="0" step="0.1"
                        class="form-control form-control-lg shadow-sm text-center fw-semibold rounded" id="totalCajas"
                        required autocomplete="off">
                    <div class="invalid-feedback">
                        Este campo es obligatorio, debe seleccionar el tipo de caja.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-ban me-2" style="color: #ec6704"></i>Total
                        Rechazo
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg shadow-sm numeric text-center rounded " id="totalRechazo"
                        required readonly autocomplete="off">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-cubes-stacked me-2" style="color: #ec6704"></i>Total
                        Migas</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg shadow-sm numeric text-center rounded" id="totalMigas"
                        required readonly autocomplete="off">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card border-0 rounded-4 mb-5">
        <div class="card-header-detail"><i class="fa-solid fa-circle-info me-2 text-white"></i>Informacion Cajas
        </div>
        <div class="card-body mb-2">
            <div class="row" id="contenedorCantidadCajas">
            </div>
            <div class="row">
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles">Peso Promedio</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg text-center shadow-sm fw-semibold rounded-4"
                        id="promedioCajas" placeholder="Peso Promedio de Caja." required autocomplete="off">
                    <div class="invalid-feedback">
                        Este campo es obligatorio, debe seleccionar el tipo de caja.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <button type="button" data-tooltip="Observaciones"
        class="btn btn-info flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill"
        style="background-color: #34a1e9; color: #f5f7ff;" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight">
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

    <div class="modal fade" id="ModalEmpaque" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 modal-dialog-scrollable shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #6c780d;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0" style="font-family: Arial, Helvetica, sans-serif">
                        REGISTRO DE
                        INFORMACIÓN -
                        EMPAQUE <span class="badge text-white fs-5 p-2 fw-bold"
                            style="background-color: #ec6704 ;"></span> </h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">

                    <nav>
                        <div class="nav nav-tabs justify-content-end" id="myTab" role="tablist">

                            <button class="nav-link show active" id="empaque-tab" data-bs-toggle="tab"
                                data-bs-target="#empaque-tab-pane" type="button" role="tab"
                                aria-controls="empaque-tab-pane" aria-selected="false">EMPAQUE
                            </button>


                            <button class="nav-link" id="variable-tab" data-bs-toggle="tab"
                                data-bs-target="#variable-tab-pane" type="button" role="tab"
                                aria-controls="variable-tab-pane" aria-selected="false">INFORMACIÓN
                            </button>
                        </div>

                    </nav>

                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade active show" id="empaque-tab-pane" role="tabpanel"
                            aria-labelledby="empaque-tab" tabindex="0">
                            <div class="row mt-1 d-flex justify-content-center p-2">
                                <div class="row d-flex justify-content-between p-3">
                                    <div class="col-3">
                                        <h6 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-circle-info me-1" style="color:#ec6704;"></i>
                                            FECHA DE PRODUCCIÓN
                                        </h6>
                                        <input type="date"
                                            class="form-control form-control-lg shadow-sm rounded text-center"
                                            id="fechaProduccion" name="fechaProduccion" required>

                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>

                                    </div>
                                </div>
                                <div class="row d-flex justify-content-between p-3 mt-2">
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-circle-info me-1" style="color:#ec6704;"></i>
                                            LOTES PRODUCCIÓN
                                        </h5>
                                        <select
                                            class="lotesProduccion form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                            id="lotes">
                                            <option value="">-- Seleccionar --</option>

                                        </select>

                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>

                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif;">
                                            <i class="fa-solid fa-circle-info me-1" style="color:#ec6704;"></i>
                                            Proveedores
                                        </h5>
                                        <select
                                            class="proveedores form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                            id="proveedores">
                                            <option value="">-- Seleccionar --</option>
                                        </select>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>

                                    </div>


                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                            <i class="fa-solid fa-table-cells me-1" style="color:#ec6704;"></i>
                                            Canastillas
                                        </h5>
                                        <input type="number"
                                            class="form-control form-control-lg rounded shadow-sm fs-4  text-center numeric fw-semibold"
                                            min="0" id="canastas" readonly required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>

                                </div>
                                <div class="row d-flex justify-content-between p-3 mt-3">
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-table-cells me-1" style="color:#ec6704;"></i>
                                            Cajas
                                        </h5>
                                        <input type="number"
                                            class="form-control form-control-lg rounded shadow-sm fs-4 text-center numeric"
                                            min="0" placeholder="Cantidad de Cajas" id="cajas" data-tipo=""
                                            data-proveedor="" required readonly>

                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                            <i class="fa-solid fa-table-cells me-1" style="color:#ec6704;"></i>
                                            Rechazo
                                        </h5>
                                        <input type="number"
                                            class="form-control rounded shadow-sm fs-4 text-center numeric" min="0"
                                            placeholder="Cantidad Kg" readonly id="rechazo" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>
                                    <div class="col">
                                        <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                            <i class="fa-solid fa-table-cells me-1" style="color:#ec6704;"></i>
                                            Migas
                                        </h5>
                                        <input type="number"
                                            class="form-control rounded shadow-sm fs-4 text-center numeric" min="0"
                                            placeholder="Cantidad Kg" id="migas" required readonly>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>

                                    <div class="d-grid gap-2 col-3 mx-auto">
                                        <button type="button"
                                            class="btn  fs-5 shadow-lg fw-bold text-white mt-5 p-2 btn-Registrar"
                                            style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c;"
                                            id="btnRegistrarEmpaque">
                                            <i class="fa-solid fa-circle-check me-2"></i> REGISTRAR </button>
                                    </div>

                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-tag me-1" style="color:#ec6704;"></i>
                                        Referencia Diferente
                                    </h5>
                                    <select class="form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                        id="referencia_diferente">
                                        <option value="">-- Sin referencia diferente --</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="AF">AF</option>
                                        <option value="BH">BH</option>
                                        <option value="XL">XL</option>
                                        <option value="CIL">CIL</option>
                                        <option value="P">P</option>
                                    </select>
                                </div>

                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-boxes-stacked me-1" style="color:#ec6704;"></i>
                                        Cajas Diferentes
                                    </h5>
                                    <input type="number" class="form-control rounded shadow-sm fs-4 text-center numeric"
                                        min="0" placeholder="Cantidad de cajas diferentes" id="cajas_diferente"
                                        readonly>
                                    <div class="invalid-feedback">
                                        Ingrese un valor válido.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade mb-3" id="variable-tab-pane" role="tabpanel"
                            aria-labelledby="variable-tab" tabindex="0">
                            <div class="row mt-1 d-flex justify-content-center p-1">
                                <div class="row text-center mt-1 p-2">
                                    <div class="col">
                                        <h3 class="fw-semibold text-uppercase" style="color:#24243c;">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>
                                            INFORMACIÓN
                                            DETALLES DE PROCESO
                                        </h3>
                                        <div class="border-bottom mb-3"></div>
                                    </div>
                                </div>

                                <div class="row mt-1">
                                    <div class="col-12">
                                        <div class="tabla table-responsive">
                                            <table class="table tabla-personalized" id="tablaInfo">
                                                <!-- En el thead de la tabla, modificar para incluir las nuevas columnas -->
                                                <thead>
                                                    <tr>
                                                        <th rowspan="1" class="AG text-center;">Produccion</th>
                                                        <th class="M text-center;">Lote</th>
                                                        <th rowspan="1" class="M text-center;">Tipo</th>
                                                        <th rowspan="1" class="M text-center;">Canastas</th>
                                                        <th rowspan="1" class="M text-center;">Cajas</th>
                                                        <th rowspan="1" class="M text-center;">Ref. Dif</th>
                                                        <!-- Nueva columna -->
                                                        <th rowspan="1" class="M text-center;">Cajas Dif</th>
                                                        <!-- Nueva columna -->
                                                        <th rowspan="1" class="M text-center;">Rechazo</th>
                                                        <th rowspan="1" class="M text-center;">Migas</th>
                                                        <th rowspan="1" class="F text-center;">Acción</th>
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
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-lg fs-3 p-3 px-4 btn-danger text-white" data-bs-dismiss="modal"
                        id="btnCloseModal">
                        <i class="fa-solid fa-xmark fs-4"></i>
                    </button>

                    <button type="button" class="btn btn-lg fs-3 p-3 px-4 text-white btn-Obtener"
                        style="background-color: #6c780d" id="btnObtener">
                        <i class="fa-solid fa-floppy-disk fs-4"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>
    <button id="btnGuardar" type="button" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
        style="background-color: #ec6704; color: #f5f7ff;"> <i class="fa-solid fa-floppy-disk fs-3 me-2"></i>
        GUARDAR
        REGISTRO
    </button>

</form>
<script type="module" src="{{ asset('assets/js/modules/Produccion/empaque.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
<x-tablet-sidebar></x-tablet-sidebar>