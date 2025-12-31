<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <title>Agricol del Pacífico S.A.S</title>
    <!-- plugins:css -->

    <!-- endinject -->
    <link rel="shortcut icon" href="/assets/images/favicon.png" />
</head>


<div class="row full-height">
    <!-- Left side - Form -->
    <div class="p-5">
        <div class="row">
            <div class="logo-container col-2">
                <img src="/assets/images/logo-clean.png" alt="Logo de la empresa" class="company-logo">
            </div>
            <div class="title-main col-10 text-center mt-3 ">
                <span class="mb-4 display-4 fw-bold"> CONTROL DE ALISTAMIENTO MATERIA PRIMA - 03</span>
            </div>

        </div>

        <div class="info-card shadow-sm d-flex mb-4">
            <div class="card-body">
                <h5 class="card-title">Información del Alistamiento</h5>
                <p class="card-text">Detalles sobre el proceso de alistamiento.</p>
            </div>
        </div>

        <form action="" method="POST">
            @csrf
            <div class="row d-flex mb-3 mt-4">
                <div class="mb-3 col">
                    <h4 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704"></i>Responsable</h4>
                    <div class="border-bottom mb-3"></div>
                    <input class="form-control form-control-lg shadow-sm" id="nombreEncargardo" list="encargadolist"
                        placeholder="Operario Encargado" name="nombreEncargardo" required autocomplete="off">
                    <input class="" type="hidden" id="id_responsable" name="id_responsable"
                        placeholder="Operario Encargado" required>
                    <datalist id="encargadolist">
                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col">
                    <div class="border-bottom mb-4 mt-4"></div>
                    <button class="btn btn-lg fs-5 text-start shadow-sm text-white w-100 text-center" type="button"
                        data-bs-toggle="collapse" data-bs-target="#collapseProveedores" aria-expanded="false"
                        style="background-color: #6c780d">
                        <strong>Proveedores </strong><span id="cantidadProv" class="badge text-white fw-bold fs-6"
                            style="background-color:#ec6704">0</span>
                    </button>
                </div>
            </div>

            <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>

            <div class="row mt-3 g-3 mb-3" id="contenedorProveedor">

            </div>

            <div class="row mt-3">
                <div class="mb-3 col-3 mt-3">
                    <h4 class="text-titles"><i class="fa-solid fa-ban me-2" style="color: #ec6704"></i>Maduro</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control  form-control-lg rounded shadow-sm fw-bold numeric text-center" id="maduro"
                        readonly name="maduro" placeholder="Cantidad Kg" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 mt-3">
                    <h4 class="text-titles"><i class="fa-solid fa-ban me-2" style="color: #ec6704"></i>Rechazo</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg rounded shadow-sm fw-bold numeric text-center" readonly
                        id="rechazo" name="rechazo" placeholder="Cantidad Kg" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 mt-3">
                    <h4 class="text-titles"><i class="fa-solid fa- me-2" style="color: #ec6704"></i>Recp. Desinfectados
                    </h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm numeric text-center"
                        id="recipientes_desinf" name="recipientes_desinf" required placeholder="Cantidad Desinfectados">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 mt-3">
                    <h4 class="text-titles"><i class="fa-solid fa-kaaba  me-2" style="color: #ec6704"></i>Total
                        Canastillas</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" readonly
                        class="form-control form-control-lg rounded shadow-sm text-center fw-bold numeric " id="total"
                        name="total" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
            <button type="button" data-tooltip="Observaciones"
                class="btn flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill"
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
        </form>
    </div>
    <div class="p-5">
        <button type="button" class="btn btn-lg fs-4 btn-white text-white shadow-sm" data-bs-toggle="modal"
            data-bs-target="#exampleModal" style="background-color: #24243c"><i
                class="fa-solid fa-clipboard fs-4 me-1  "></i>
            Asignar</button>

        <table class="table table-striped custom-table info-card tabla-personalized table-hover" id="tabla-peladores">
            <thead>
                <tr>
                    <th colspan="6"
                        style="background-color: #6c780d; color: #ffffff; font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif">
                        ASIGNACIÓN DE CANASTILLAS
                    </th>
                </tr>
                <tr>
                    <th class="F" style="text-align: center">#</th>
                    <th class="M" style="text-align: center">Peladores</th>
                    <th class="M" style="text-align: center">Rondas</th>
                    <th class="N" style="text-align: center">Canastas</th>
                    <th class="N" style="text-align: center">Rechazo</th>
                    <th class="N" style="text-align: center">Maduro</th>
                    <th class="hide"></th>
                    <th class="hide"></th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>

        <div class="col text-start">
            <button type="submit" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
                style="background-color: #ec6704; color: #f5f7ff;">
                <i class="fa-solid fa-floppy-disk fs-3"></i> GUARDAR REGISTRO
            </button>
        </div>
    </div>

</div>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content  border-0 shadow-lg rounded-4">
            <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                style="background-color: #ec6704;">
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
                <h3 class="fw-bold text-white m-0">ASIGNACIÓN DE PELADORES</h3>
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                </div>
            </div>
            <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">
                <div class="row align-items-center p-3 mt-1">
                    <div class="col-8">
                        <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Pelador
                        </h4>
                        <input type="text" class="form-control form-control-lg shadow-sm" id="pelador"
                            list="empeladolist" autocomplete="off" placeholder="Seleccione el pelador">
                        <datalist id="empeladolist"></datalist>
                        <input type="hidden" id="idpelador" data-index-table="">
                    </div>

                    <div class="col-2 d-flex">
                        <!-- Límite -->
                        <div class="text-center">
                            <small class="fw-semibold fs-5">Asignadas</small>
                            <input type="number" readonly min="0"
                                class="circular-input form-control mt-1 p-3 text-center text-success rounded-pill shadow-sm fw-semibold fs-5"
                                style="background-color:#ffffff; color:#070707;" id="conteo" name="conteo" required
                                placeholder="0">
                        </div>
                    </div>
                    <div class="col-2 d-flex">
                        <!-- Límite -->
                        <div class="text-center">
                            <small class="fw-semibold fs-5">Límite</small>
                            <input type="number" readonly min="0"
                                class="circular-input form-control mt-1 p-3 text-center text-danger rounded-pill shadow-sm fw-semibold fs-5"
                                style="background-color:#ffffff; color:#070707;" id="limite" name="limite" required
                                placeholder="0">
                        </div>
                    </div>
                </div>
                <div class="row d-flex p-3 mt-2">
                    <div class="row">
                        <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> CANASTILLAS
                        </h4>
                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle1" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle1">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm  p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle2" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle2">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle3" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle3">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle4" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle4">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle5" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle5">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-2">
                            <input type="number" value="0" min="0"
                                class="inputCantidad form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadDetalle6" style="background-color:#ffffff; color:#070707;" disabled
                                name="cantidadDetalle6">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row d-flex p-3 mt-4">
                    <div class="row">
                        <div class="col-3">
                            <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Rechazo
                            </h4>
                            <input type="number" value="0" min="0"
                                class="inputCantidadRechazo form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                placeholder="Canridad Rechazo" id="cantidadRechazo"
                                style="background-color:#ffffff; color:#070707;" disabled name="cantidadRechazo">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-3">
                            <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Maduro
                            </h4>
                            <input type="number" value="0" min="0"
                                class="inputCantidadMaduro form-control rounded shadow-sm p-3 mx-2 fs-5 text-center numeric"
                                id="cantidadMaduro" style="background-color:#ffffff; color:#070707;"
                                placeholder="Cantidad Rechazo." disabled name="cantidadMaduro">
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>

                        <div class="col-3">
                            <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Proveedores
                            </h4>
                            <select
                                class="proveedoreslist form-select shadow-sm rounded text-dark text-center fw-bold p-3"
                                disabled id="listProveedores"></select>
                        </div>
                        <div class="col-3  text-start p-4">
                            <button type="button"
                                class="btn  rounded-3 fs-5 shadow-lg fw-bold text-white mx-2 mt-3 p-3 w-100 btn-Registrar"
                                style="font-family: Arial, Helvetica, sans-serif; background-color: #24243c; "
                                id="btnInfoProve" disabled>
                                <i class="fa-solid fa-circle-check me-2"></i>Asignar </button>
                        </div>
                    </div>
                </div>
                <div class="row d-flex p-3 mt-4">
                    <div class="col">
                        <div class="row">
                            <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                                <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Total Canastillas.
                            </h4>
                            <div class="col-12">
                                <input value=0 type="number" disabled
                                    class="form-control p-3 mx-2 fs-4 text-center numeric shadow-sm rounded-pill"
                                    id="totalcortes" name="totalcortes">
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Rechazo Total.
                        </h4>
                        <div class="row">
                            <div class="col-12">
                                <input value=0 type="number" disabled
                                    class="form-control p-3 mx-2 fs-4 text-center numeric shadow-sm rounded-pill"
                                    step="0.1" placeholder="rechazo pelador" id="totalRechazo" name="totalRecahazo">
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <h4 class="fw-semibold text-uppercase mb-3" style="color:#6c780d;">
                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Maduro Total.
                        </h4>
                        <div class="row">
                            <div class="col-12">
                                <input value=0 type="number" disabled
                                    class="form-control p-3 mx-2 fs-4 text-center numeric shadow-sm rounded-pill"
                                    step="0.1" placeholder="rechazo pelador" id="totalMaduro" name="totalMaduro">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer justify-content-between">
                <button type="button" class="btn btn-lg  btn-danger p-3 px-4" id="btnCloseModal"
                    data-bs-dismiss="modal"><i class="fa-solid fa-xmark fs-3 text-white "></i></button>
                <button type="button" id="btnDetalle" class="btn btn-lg fs-1 p-3 px-4"
                    style="background-color:#6c780d; color:#ffffff;"><i class="fa-solid fa-floppy-disk fs-3"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<script type="module" src="{{ asset('assets/js/modules/Produccion/alistamiento.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>