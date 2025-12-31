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
            <span class="mb-4 display-1 fw-bold">REGISTRO DE INVENTARIO DE CAJAS </span>
        </div>

    </div>
    <div class="info-card d-flex mt-2">
        <div class="card-body">
            <h5 class="card-title">Información de Invenario de Cajas</h5>
            <p class="card-text">Detalles sobre el proceso de ajuste de inventario de cajas en bodega.</p>
        </div>
    </div>
    <div class="card mb-3 mt-4">
        <div class="card-header-info text-white "><i class="fa-solid fa-circle-info me-2"></i> Datos Generales</div>
        <div class="card-body">
            <div class="row d-flex justify-content-between ">
                <div class="mb-3 col-6 col-md-4">
                    <h4 class="text-titles">FECHA</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control shadow-sm    text-center" id="fecha" name="fecha" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-6 col-md-4">
                    <h4 class="text-titles"><i class="fa-solid fa-users-line me-2" style="color: #6c780d"></i>RESPONSABLE</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="" class="form-control shadow-sm text-center" id="responsablenombre"
                        placeholder="Operario Encargado" name="responsable[]" list="empeladolist" required
                        autocomplete="off">
                    <datalist id="empeladolist"></datalist>
                    <input type="hidden" id="responsableid" name="">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card mb-3">
        <button class="btn btn-sm btn-light fs-6 text-white text-start w-100 p-3" style="background-color: #81910d"
            type="button" data-bs-toggle="collapse" data-bs-target="#infoCajas" aria-expanded="false"
            aria-controls="infoCajas">
            <i class="fa-solid fa-circle-info me-2"></i> Registro Inventario
        </button>

        <div class="collapse show" id="infoCajas">
            <div class="card-body">
                <div class="card-body table-responsive">
                    <table class="table table-bordered tabla-personalized">
                        <thead>
                            <tr>
                                <th style="text-align: center;">ACTUALIZAR LOTES</th>
                                <th style="text-align: center;"><i class="fa-solid fa-tags m-1"></i> LOTES</th>
                                <th style="text-align: center;"><i class="fa-solid fa-boxes-packing m-1"></i> TOTAL
                                    CAJAS</th>
                            </tr>
                        </thead>
                        <tbody id="tablaCajas">
                            <td class="text-center">
                                <button type="button" class="btn btn-dark btnGenerar" data-bs-toggle="modal"
                                    data-bs-target="#registroInfoCajas">
                                    <i class="fa-solid fa-eye m-1"></i> REVISAR
                                </button>
                            </td>
                            <td>
                                <input type="text"
                                    class="form-control form-control text-center text-success fs-5 fw-bold"
                                    id="conteoLote" readonly>
                            </td>
                            <td>
                                <input type="number" step="0.1" min="0" name=""
                                    class="form-control text-center numeric fw-bold fs-5" id="conteoCajas" required
                                    readonly>
                            </td>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <button type="button" data-tooltip="Observaciones"
        class="btn btn-info flotante-coments position-fixed m-4 border-0 align-content-center"
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
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
                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Observaciones
                    </label>
                    <textarea class="form-control shadow-sm" id="Observaciones"
                        placeholder="Ej | Mal estado de muchos.." rows="8"></textarea>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="registroInfoCajas" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #6c780d;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0" style="font-family: Arial, Helvetica, sans-serif">ACTUALIZAR
                        INVENTARIO</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">
                    <div class="row">
                        <div class="mb-3">
                            <div class="row d-flex justify-content-between  p-3">
                                <div class="col">
                                    <h3 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-calendar me-2" style="color:#ec6704;"></i> Fecha
                                        PRODUCCION
                                    </h3>
                                    <input type="date" class="form-control shadow-sm text-center fs-5"
                                        style="background-color:#ffffff; color:#070707;" id="fechaCaja" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>

                                <div class="col">
                                    <h3 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-tags me-2" style="color:#ec6704;"></i> LOTES
                                    </h3>

                                    <select id="lotes_produccion"
                                        class="form-select p-3 shadow-sm text-dark text-center">

                                    </select>

                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                    <datalist id="lotesList">


                                    </datalist>

                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>

                                <div class="row d-flex justify-content-between mt-2 p-3">

                                    <div class="col-4">
                                        <h3 class="fw-semibold text-uppercase mt-4"
                                            style="color:#6c780d; font-family: Arial, Helvetica, sans-serif; ">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Cantidad
                                        </h3>
                                        <input type="number"
                                            class="form-control rounded shadow-sm fs-6 text-center numeric" min="0"
                                            placeholder="Cantidad de Cajas" id="cantidad" required>
                                        <div class="invalid-feedback">
                                            Este campo es obligatorio.
                                        </div>
                                    </div>
                                    <div class="col text-start">
                                        <button type="button" class="btn btn-fs-5 btn-lg shadow-lg fw-bold text-white mt-5 p-4"
                                            style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c;"
                                            id="btnRegistrarCantidad">
                                            <i class="fa-solid fa-circle-check me-2"></i> REGISTRAR </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="row mt-2">
                                <div class="col-12">
                                    <div class="card-body">
                                        <div class="card-body table-responsive">
                                            <table class="table table-bordered tabla-personalized p-3" id="tablaCaja">
                                                <thead>
                                                    <tr>
                                                        <th class="A text-center;">FECHA</th>
                                                        <th class="A text-center;">LOTE</th>
                                                        <th class="A2 text-center;">TIPO</th>
                                                        <th class="A2 text-center;">CAJAS</th>
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
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-lg btn-danger text-white" data-bs-dismiss="modal"
                        id="btnCloseModal"><i class="fa-solid fa-xmark fs-4"></i></button>

                    <button type="button" class="btn btn-lg text-white" id="btnObtenerCajas" style="background-color: #6c780d"><i class="fa-solid fa-save fs-4"></i></button>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>
    <button id="btnGuardar" type="button" class="btn btn-primary btn-lg w-100 fw-semibold fs-5"> <i
            class="fa-solid fa-floppy-disk fs-3"></i> GUARDAR
        REGISTRO
    </button>
</form>

<script type="module" src="{{ asset('assets/js/modules/Produccion/inventario_ac.js') }}"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>