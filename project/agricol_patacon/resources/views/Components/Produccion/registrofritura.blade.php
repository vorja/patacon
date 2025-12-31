<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

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
            <span class="mb-4 display-4 fw-bold">REGISTRO DE PRODUCCIÓN ÁREA FRITURA - 05</span>
        </div>
    </div>

    <div class="info-card d-flex mt-2">
        <div class="card-body">
            <h4 class="card-title">Información de Fritura</h4>
            <p class="card-text">Detalles sobre el proceso de fritura.</p>
        </div>
    </div>
    <div class="card border-0 mb-3 mt-4">
        <div class="card-header-info text-white"><i class="fa-solid fa-circle-info me-2"></i>Datos Generales</div>
        <div class="card-body">
            <div class="row">
                <div class="mb-3 col-6">
                    <h4 class="text-titles"><i class="fa-solid fa-clock me-2" style="color: #ec6704"></i>Hora inicio
                        Área de Fritura</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="time" class="form-control form-control-lg rounded shadow-sm fs-6" id="inicio_fritura"
                        name="inicio_fritura" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6">
                    <h4 class="text-titles"><i class="fa-solid fa-clock me-2" style="color: #ec6704"></i>Hora final Área
                        de Fritura</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="time" class="form-control form-control-lg rounded shadow-sm fs-6" id="fin_fritura"
                        name="fin_fritura" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="mb-3 col-6">
                    <h4 class="text-titles"><i class="fa-solid fa-gauge me-2" style="color: #ec6704"></i>Indicador Gas
                        Inicio</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm text-center fs-6 numeric" id="gas_inicio"
                        name="gas_inicio" placeholder="Indicador Inicio" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6">
                    <h4 class="text-titles"><i class="fa-solid fa-gauge me-2" style="color: #ec6704"></i>Indicador Gas
                        Final</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm text-center fs-6 numeric" id="gas_final"
                        name="gas_final" placeholder="Indicador Final" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card border-0 mb-3">
        <div class="card-header bg-dark text-white"> <i class="fa-solid fa-circle-info me-2"></i> Proveedores </div>
        <div class="card-body">
            <div class="row " id="contenedorProveedor">

            </div>
        </div>
    </div>
    <div class="card border-0  mb-3 mt-4">
        <div class="card-header-detail text-white"><i class="fa-solid fa-circle-info me-2"></i>Otros Datos</div>
        <div class="card-body">
            <div class="row mt-2">
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-tags me-2" style="color: #ec6704"></i>Lote de Aceite
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="text"
                        class="form-control form-control-lg rounded shadow-sm text-center fw-semibold text-center"
                        id="lote_aceite" placeholder="Lote de Aceite" name="lote_aceite" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-ruler-vertical me-2" style="color: #ec6704"></i>Aforo
                        de Aceite</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm numeric text-center fw-semibold "
                        placeholder="Litros de aceite" id="aforo_aceite" name="aforo_aceite" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-bottle-droplet me-2"
                            style="color: #ec6704"></i>Bidones</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm numeric text-center fw-semibold"
                        placeholder="Cantidad Utilizados" id="inventario_aceite" name="inventario_aceite" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704"></i>Responsable</h5>
                    <div class="border-bottom mb-3"></div>
                    <input class="form-control form-control-lg rounded shadow-sm" id="nombreResponsable"
                        list="empleadolist" name="nombreResponsable" required autocomplete="off"
                        placeholder="Operario Encargado">
                    <input class="" type="hidden" id="id_responsable" name="id_responsable" required>
                    <datalist id="empleadolist">

                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-kaaba  me-2" style="color: #ec6704"></i>Total Canastas
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm text-center fw-semibold"
                        id="totalCanastillas" 
                         required readonly>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-clock me-2" style="color: #ec6704"></i>Total (Kg)
                        Patacón.</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm numeric text-center fw-semibold "
                        id="totalPatacon" required readonly>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-ban me-2" style="color: #ec6704"></i>Total Rechazo
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0"
                        class="form-control form-control-lg rounded shadow-sm numeric text-center fw-semibold"
                       id="totalRechazo" required readonly>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-6 col-md-3">
                    <h5 class="text-titles"><i class="fa-solid fa-cubes-stacked me-2" style="color: #ec6704"></i>Total
                        Migas</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" class="form-control form-control-lg rounded shadow-sm text-center fw-semibold"
                        id="totalMigas" required readonly>

                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row" id="contenedorModals">

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
            <h4 class="offcanvas-title text-white fw-bold" id="offcanvasRightLabel">INFORMACIÓN
                ADICIONAL</h4>
        </div>
        <div class="offcanvas-body">
            <div class="row">
                <div class="mb-3 col-12">
                    <label for="Observaciones" class="form-label">
                        <i class="fa-solid fa-circle-info me-2" style="color:#ec6704;"></i>
                        Observaciones
                    </label>
                    <textarea class="form-control shadow-sm" id="Observaciones"
                        placeholder="Ej | Mal estados de muchos.. " rows="8"></textarea>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" value="" disabled class="form-control" id="idEncargo" name="idEncargo" required>
    <input type="hidden" value="" disabled class="form-control" id="corte" name="corte" required>
    <button id="btnGuardar" type="button" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
        style="background-color: #ec6704; color: #f5f7ff;"><i class="fa-solid fa-floppy-disk fs-3"></i> GUARDAR
        REGISTRO
    </button>
</form>
<script type="module" src="{{ asset('assets/js/modules/Produccion/fritura.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
<x-tablet-sidebar></x-tablet-sidebar>