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
        <div class="title-main col-10 text-center mt-3">
            <span class="mb-4 display-4 fw-bold">REGISTRO DE TEMPERATURA CUARTO FRIO - 06</span>
        </div>

    </div>
    <div class="info-card d-flex mt-2">
        <div class="card-body">
            <h5 class="card-title">Información de Temperaturas</h5>
            <p class="card-text">Detalles sobre el registro de temperatura.</p>
        </div>
    </div>
    <div class="card border-0 mb-3 mt-4">
        <div class="card-header-info  text-white"><i class="fa-solid fa-circle-info me-2"></i>Datos Generales</div>
        <div class="card-body">
            <div class="row">
                <div class="mb-3 col-4 col-md-4">
                    <h4 class="text-titles"><i class="fa-solid fa-calendar-day me-2" style="color: #ec6704"></i>Fecha
                    </h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg  rounded shadow-sm" style="font-size: large"
                        id="fecha" name="fecha" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-4 col-md-4">
                    <h4 class="text-titles">
                        <i class="fa-solid fa-users-line me-2" style="color: #ec6704"></i>Responsable
                    </h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="" class="form-control form-control-lg  rounded shadow-sm" style="font-size: large"
                        id="responsablenombre" name="responsable[]" list="empeladolist" required autocomplete="off"
                        placeholder="Operario Encargado">
                    <datalist style="font-size: large" id="empeladolist"></datalist>
                    <input type="hidden" id="responsableid" name="">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-4 col-md-4 ">
                    <h4 class="text-titles"><i class="fa-solid fa-cube me-2" style="color: #ec6704"></i>Cuarto</h4>
                    <div class="border-bottom mb-3"></div>
                    <input type="" class="form-control form-control  rounded shadow-sm" style="font-size: large"
                        id="nombreCuarto" name="cuarto[]" placeholder="Listado de Cuartos" list="cuartoList" required
                        autocomplete="off">
                    <datalist style="font-size: large" id="cuartoList"></datalist>
                    <input type="hidden" id="cuartoid" name="">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="card border-0 mb-3">
        <div class="card-header-detail text-white"> <i class="fa-solid fa-circle-info me-2"></i>Detalle de Registro.
        </div>
        <div class="card-body mb-1">
            <div class="row">
                <div class="col-12 col-md-12 mt-2">
                    <div class="row">
                        <div class="mb-3 col-6 col-md-4">
                            <h4 class="text-titles"><i class="fa-solid fa-clock me-2" style="color: #ec6704"></i>Horario
                            </h4>
                            <div class="border-bottom mb-3"></div>
                            <input type="text" list="horarioList"
                                class=" form-control form-control-lg  rounded shadow-sm" id="horario"
                                placeholder="Horario Inicio, Medio, Final.." required>
                            <datalist id="horarioList">
                                <option value="I">Inicio</option>
                                <option value="M">Medio</option>
                                <option value="F">Final</option>
                            </datalist>
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>
                        <div class="mb-3 col-6 col-md-4">
                            <h4 class="text-titles"><i class="fa-solid fa-clock me-2" style="color: #ec6704"></i>Hora
                            </h4>
                            <div class="border-bottom mb-3"></div>
                            <input type="time" class="form-control form-control-lg rounded shadow-sm" id="hora"
                                name="hora" required>
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>

                        </div>
                        <div class="mb-3 col-6 col-md-4">
                            <h4 class="text-titles"><i class="fa-solid fa-temperature-arrow-down me-2"
                                    style="color: #ec6704"></i>Temperatura °C </h4>
                            <div class="border-bottom mb-3"></div>
                            <input type="number" min="-50" max="50" step="0.1"
                                class="form-control text-center rounded shadow-sm form-control-lg" id="temperatura"
                                placeholder="Temperatura Cuarto" name="temperatura[]" required>
                            <div class="invalid-feedback">
                                Este campo es obligatorio.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <button type="button" data-tooltip="Observaciones"
        class="btn btn-info flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill" style="background-color: #34a1e9; color: #f5f7ff;
        data-bs-toggle=" offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
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
    <button id="btnGuardar" type="button" class="btn btn-lg fs-3 mt-4 shadow-sm w-100 fw-semibold rounded-4"
        style="background-color: #ec6704; color: #f5f7ff;"> <i class="fa-solid fa-floppy-disk fs-3"></i> GUARDAR
        REGISTRO</button>
</form>
<script type="module" src="{{ asset('assets/js/modules/Produccion/temperaturas.js') }}"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>