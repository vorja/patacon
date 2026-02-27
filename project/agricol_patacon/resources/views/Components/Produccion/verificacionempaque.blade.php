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
            <span class="mb-4 display-4 fw-bold">VERIFICACIÓN DE PESO DE EMPAQUE - 08 </span>
        </div>

    </div>
    <div class="info-card d-flex mt-2">
        <div class="card-body">
            <h5 class="card-title">Información de Verificación</h5>
            <p class="card-text">Detalles sobre el proceso de verificación de empaque.</p>
        </div>
    </div>
    <div class="card border-0 rounded-3 mb-3 mt-4">
        <div class="card-header-info text-white"><i class="fa-solid fa-circle-info me-2 text-white"></i>Datos Generales
        </div>
        <div class="card-body">
            <div class="row d-flex justify-content-between mt-2">
                <div class="mb-3 col-6 col-md-4">
                    <h5 class="text-titles"><i class="fa-solid fa-calendar-days me-2" style="color: #ec6704"></i>Fecha
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg shadow-sm " id="fecha" name="fecha" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-6 col-md-4">
                    <h5 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704    "></i>Responsable</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="" class="form-control form-control-lg shadow-sm" id="responsablenombre" name="responsable[]"
                        placeholder="Operario Encargado" list="empeladolist" required autocomplete="off">
                    <datalist id="empeladolist"></datalist>
                    <input type="hidden" id="responsableid" name="">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card border-0 rounded-3 mb-3">
        <button class="btn btn-sm btn-light text-white fs-6 text-start w-100 p-3" style="background-color: #81910d"
            type="button" data-bs-toggle="collapse" data-bs-target="#infoPaquete" aria-expanded="false"
            aria-controls="infoPaquete">
            <i class="fa-solid fa-circle-info me-2 text-white"></i>Verificación Paquete.
        </button>

        <div class="collapse show" id="infoPaquete">
            <div class="card-body">
                <div class="card-body table-responsive">
                    <table class="table table-bordered tabla-personalized">
                        <thead>
                            <tr>
                                <th style="text-align: center;"> <span class="badge text-white fs-5 p-2 fw-semibold rounded-pill"
                                        style="background-color: #87961b ;">Verificar Lote Producción</span></th>
                                <th style="text-align: center;"><i class="fa-solid fa-tags"></i> Lotes Verificados</th>
                                <th style="text-align: center;"><i class="fa-solid fa-boxes-packing"></i> Paquetes
                                    Verificados</th>
                            </tr>
                        </thead>
                        <tbody id="tablaPaquetes">
                            <td class="text-center">
                                <button type="button"
                                    class="btn btn- text-white btnGenerar fw-bold justify-content-between rounded-3"
                                    style="background-color: #ec6704 ;" data-bs-toggle="modal"
                                    data-bs-target="#registroInfoPaquetes">
                                    <i class="fa-solid fa-eye m-1"></i> REALIZAR
                                </button>
                            </td>
                            <td>
                                <input type="text"
                                    class="form-control form-control text-center text-success fs-5 fw-bold"
                                    id="conteoLotePaquete" readonly>
                            </td>
                            <td>
                                <input type="number" step="0.1" min="0" name=""
                                    class="form-control text-center numeric fw-bold fs-5" id="conteoPaquetes" required
                                    readonly>
                            </td>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <div class="card border-0 rounded-3 mb-3">
        <button class="btn btn-sm btn-light text-white fs-6  text-start w-100 p-3" style="background-color: #1d1e29"
            type="button" data-bs-toggle="collapse" data-bs-target="#infoEmpaque" aria-expanded="false"
            aria-controls="infoEmpaque">
            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>Verificación Empaque.
        </button>
        {{-- <div class="card-header bg-dark text-white fs-4">Verificación Empaque.</div> --}}
        <div class="collapse show" id="infoEmpaque">
            <div class="card-body">
                <div class="card-body table-responsive">
                    <div class="table-responsive">

                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th style="text-align: center;"> <span class="badge text-white fs-5 p-2 fw-semibold rounded-pill"
                                        style="background-color: #ec6704 ;">Verificar Lote Empaque</span> 
                                </th>
                                <th style="text-align: center;">
                                    <i class="fa-solid fa-tags"></i> Lotes Verificados
                                </th>
                                <th style="text-align: center;"><i class="fa-solid fa-boxes"></i> Cajas Verificadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            <td class="text-center">
                                <button type="button" class="btn btn-light btnGenerar fw-bold justify-content-between rounded-3"
                                    style="background-color: #87961b; color: #f5f7ff;" data-bs-toggle="modal"
                                    data-bs-target="#registroInfoEmpaque">
                                    <i class="fa-solid fa-eye m-1"></i>
                                    REALIZAR
                                </button>
                            </td>
                            <td>
                                <input type="text"
                                    class="form-control form-control text-center text-success fw-bold fs-5"
                                    id="conteoLotes" readonly>
                            </td>
                            <td>
                                <input type="number" step="0.1" min="0" name=""
                                    class="form-control text-center numeric fs-5 fw-bold" id="conteoCajas" required
                                    readonly>
                            </td>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <button type="button" data-tooltip="Observaciones"
        class="btn flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill" style="background-color: #34a1e9; color: #f5f7ff;"
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
                        placeholder="Ej | Mal estados de muchos.. " rows="8"></textarea>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="registroInfoPaquetes" tabindex="-1" data-bs-keyboard="false"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #ec6704;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0">VERIFICACIÓN DE PAQUETES</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">
                    <div class="row">
                        <div class="mb-3">
                            <div class="row d-flex justify-content-between  p-3">
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Fecha
                                    </h5>
                                    <input type="date" class="form-control shadow-sm text-center fs-5"
                                        style="background-color:#ffffff; color:#070707;" id="fechaPaquete" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                            <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Lote
                                    </h5>
                                        <select class="form-control form-control-lg rounded shadow-sm fs-5 text-center" id="selectLotePaquete"
                                             name="loteProduccion[]" autocomplete="off" required>
                                                <option value="" selected disabled>Seleccione una fecha primero</option>
                                        </select>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                     </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Variedad
                                    </h5>
                                    <input type="text" list="variedadlist"
                                        class="variedad form-control rounded form-control-lg shadow-sm fs-5 text-center"
                                        name="variedad[]" placeholder="Variedad de producto.." id="variedadPaquete"
                                        autocomplete="off" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                    <datalist id="variedadlist">
                                        <option value="C">Comino</option>
                                        <option value="HW">Hawaiano</option>
                                        <option value="H">Harton</option>
                                    </datalist>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Referencia
                                    </h5>
                                    <input type="text" list="referenciaList"
                                        class="referencia form-control form-control-lgrounded shadow-sm fs-5 text-center"
                                        name="referencia[]" placeholder="Referencia (A,B,C..)" required
                                        id="referenciaPaquete" autocomplete="off">
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                    <datalist id="referenciaList">
                                        <option value="A">A</option>
                                        <option value="AF">AF</option>
                                        <option value="B">B</option>
                                        <option value="BH">B Horizontal</option>
                                        <option value="C">C</option>
                                        <option value="XL">XL</option>
                                        <option value="CIL">Cilindro</option>
                                        <option value="P">Pinton</option>
                                    </datalist>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-between mt-2 p-3">
                                <div class="col-4">
                                    <h5 class="fw-semibold text-uppercase mt-4" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Peso (Kg)
                                    </h5>
                                    <input type="number"
                                        class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric fw-bold" min="0"
                                        placeholder="Cantidad Kg.." id="pesoPaquete" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 data-tooltip="Cambiar " class="fw-semibold text-uppercase mt-4"
                                        style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>
                                    </h5>
                                    <button type="button" class="btn  btn-lg shadow-lg fw-bold text-white"
                                        style="background-color: #24243c;" id="btnRegistrarPaquetes"> <i
                                            class="fa-solid fa-circle-check me-2"></i>REGISTRAR
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="card-body">
                                        <div class="card-body table-responsive">
                                            <table class="table table-bordered tabla-personalized p-3"
                                                id="tablaPaquetes">
                                                <thead>
                                                    <tr>
                                                        <th class="A text-center;">Lote de Producción</th>
                                                        <th class="A2 text-center;">Peso Paquete ( Kg )</th>
                                                        <th style="text-align: center;">Accion</th>
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
                    <button type="button" class="btn btn-lg fs-3 p-3 px-4 btn-danger text-white" data-bs-dismiss="modal"><i
                            class="fa-solid fa-xmark fs-4"></i>
                        </button>

                    <button type="button" class="btn btn-lg fs-3 p-3 px-4 text-white" id="btnObtenerDataPaquetes"
                        style="background-color: #6c780d"><i class="fa-solid fa-circle-check fs-4"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="registroInfoEmpaque" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                    style="background-color: #ec6704;">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                    <h3 class="fw-bold text-white m-0">VERIFICACIÓN DE CAJAS</h3>
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    </div>
                </div>
                <div class="modal-body" style="background-color: #f5f7ff; color: #070707;">
                    <div class="row">
                        <div class="mb-3">
                            <div class="row d-flex justify-content-between p-3">
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Fecha
                                    </h5>
                                    <input type="date" class="form-control form-control-lg shadow-sm text-center fs-5"
                                        style="background-color:#ffffff; color:#070707;" id="fechaEmpaque" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        Variedad
                                    </h5>
                                    <input type="text" list="variedadlist"
                                        class="variedad form-control form-control-lg rounded shadow-sm fs-5 text-center"
                                        name="variedad[]" placeholder="Variedad de producto.." id="variedad"
                                        autocomplete="off" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                    <datalist id="variedadlist">
                                        <option value="C">Comino</option>
                                        <option value="HW">Hawaiano</option>
                                        <option value="H">Harton</option>
                                    </datalist>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Referencia
                                    </h5>
                                    <input type="text" list="referenciaList"
                                        class="referencia form-control form-control-lg rounded shadow-sm fs-5 text-center"
                                        name="referencia[]" placeholder="Referencia (A,B,C..)" required id="referencia"
                                        autocomplete="off">
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                    <datalist id="referenciaList">
                                        <option value="A">A</option>
                                        <option value="AF">AF</option>
                                        <option value="B">B</option>
                                        <option value="BH">B Horizontal</option>
                                        <option value="C">C</option>
                                        <option value="XL">XL</option>
                                        <option value="CIL">Cilindro</option>
                                        <option value="P">Pinton</option>
                                    </datalist>
                                </div>
                                <div class="col">
                                    <h5 class="fw-semibold text-uppercase mt-3" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Lote
                                    </h5>
                                    <input type="text"
                                        class="loteEmpaque form-control form-control-lg rounded shadow-sm fs-5 text-center"
                                        placeholder="Lote de Empaque.." id="lote" name="loteEmpaque[]"
                                        autocomplete="off" required readonly>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>

                            </div>
                            <div class="row d-flex justify-content-between mt-2 p-3">
                                <div class="col-4">
                                    <h5 class="fw-semibold text-uppercase mt-4" style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i> Peso (Kg)
                                    </h5>
                                    <input type="number" class="form-control form-control-lg rounded shadow-sm fs-5 text-center numeric"
                                        min="0" placeholder="Cantidad Kg.." id="peso" required>
                                    <div class="invalid-feedback">
                                        Este campo es obligatorio.
                                    </div>
                                </div>
                                <div class="col">
                                    <h5 data-tooltip="Cambiar " class="fw-semibold text-uppercase mt-4"
                                        style="color:#6c780d;">
                                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>
                                    </h5>
                                    <button type="button" class="btn btn-lg shadow-lg fw-bold text-white"
                                        style="background-color: #24243c;" id="btnRegistrarEmpaque"> <i
                                        class="fa-solid fa-circle-check me-2"></i>REGISTRAR
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="card-body">
                                        <div class="card-body table-responsive">
                                            <table class="table table-bordered tabla-personalized p-3"
                                                id="tablaEmpaque">
                                                <thead>
                                                    <tr>
                                                        <th class="A text-center;">Lote de Empaque</th>
                                                        <th class="A2 text-center;">Peso Cajas ( Kg )</th>
                                                        <th style="text-align: center;">Accion</th>
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
                    <button type="button" class="btn  btn-lg fs-3 p-3 px-4 btn-danger text-white" data-bs-dismiss="modal"><i
                            class="fa-solid fa-xmark fs-3"></i>
                    </button>

                    <button type="button" class="btn btn-lg fs-3 p-3 px-4 text-white" id="btnObtenerDataEmpaque"
                        style="background-color: #6c780d"><i class="fa-solid fa-circle-check fs-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>

    <button id="btnGuardar" type="button" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
        style="background-color: #ec6704; color: #f5f7ff;">
        <i class="fa-solid fa-floppy-disk fs-3 me-2"></i>GUARDAR REGISTRO
    </button>
</form>
<script type="module" src="{{ asset('assets/js/modules/Produccion/verificacion.js') }}"></script>


<x-tablet-sidebar></x-tablet-sidebar>