<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">
    <title>Agricol del Pacífico S.A.S</title>
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
                <span class="mb-4 display-1 fw-bold">REGISTRO DE RECEPCION DE MATERIA PRIMA - 02 </span>
            </div>

        </div>
        <div class="info-card shadow border-0 d-flex mb-4">
            <div class="card-body">
                <h5 class="card-title">Información del Recepcion</h5>
                <p class="card-text">Detalles sobre el proceso de recepcion.</p>
            </div>
        </div>

        <form action="" method="POST">
            <br />
            <div class="row border-bottom"></div>
            <br />
            @csrf
            <div class="row">
                <div class="mb-3 col-5 mt-2">
                    <h5 class="text-titles"><i class="fa-solid fa-calendar-days me-2" style="color: #ec6704"></i>Fecha
                        Recepción</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg shadow-sm rounded-3" id="fecha_procesamiento"
                        name="fecha_procesamiento" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <input type="hidden" value="" disabled class="form-control shadow-sm" id="idEncargo" name="idEncargo"
                    required>

                <div class="mb-3 col-5 mt-2">
                    <h5 class="text-titles"><i class="fa-solid fa-calendar-day me-2" style="color: #ec6704"></i>Fecha
                        Producción</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="date" class="form-control form-control-lg  shadow-sm" id="fecha" name="fecha" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-2 mt-2">
                    <h5 class="text-titles"><i class="fa-solid fa-clipboard-list me-2" style="color: #ec6704"></i>Brix</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" class="form-control form-control-lg  shadow-sm" placeholder="°Maduracion" id="brix" name="brix" required>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-3 mt-3">
                    <h5 class="text-titles"><i class="fa-solid fa-seedling me-2" style="color: #ec6704"></i>Producto
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="text" class="form-control form-control-lg shadow-sm" id="producto" list="productoList"
                        name="producto" required autocomplete="off" placeholder="Tipo de producto..">
                    <input type="hidden" id="id_producto" name="id_producto" required>
                    <datalist id="productoList">
                        <!-- Aquí se llenarán los productos -->
                        <option value="Comino"></option>
                        <option value="Hawaiano"></option>
                        <option value="Harton"></option>
                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 col-md-3 mt-3 position-relative">
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
                <div class="mb-3 col-3 mt-3">
                    <h5 class="text-titles"><i class="fa-solid fa-truck-ramp-box me-2"
                            style="color: #ec6704"></i>Materia Recepcionada</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.01" class="form-control form-control-lg numeric shadow-sm"
                        id="cantidadRecepccion" name="cantidad" required placeholder="Cantidad Kg">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="mb-3 col-3 mt-3">
                    <h5 class="text-titles"><i class="fa-solid fa-tags me-2" style="color: #ec6704"></i>Lote Recepción
                    </h5>
                    <div class="border-bottom mb-3"></div>
                    <input class="form-control form-control-lg shadow-sm  text-center fw-semibold" type="text"
                        id="lote_produccion" name="lote_produccion" required autocomplete="off" readonly>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 mt-4">
                    <h5 class="text-titles"> <i class="fa-solid fa-grip me-2" style="color: #ec6704"></i>Defectos</h5>
                    <div class="border-bottom mb-3"></div>
                    <!-- Dropdown personalizado -->
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary dropdown-toggle w-100 p-2" disabled type="button"
                            id="dropdownDefectosBtn" data-bs-toggle="dropdown" aria-expanded="false">
                            Seleccionar defectos
                        </button>
                        <ul class="dropdown-menu w-100" aria-labelledby="dropdownDefectosBtn"
                            style="max-height: 250px; overflow-y: auto;" id="tipo">
                            <li>
                                <label class="dropdown-item">
                                    <input type="checkbox" class="form-check-input me-2" value="Platano Maduro">
                                    Plátano
                                    Maduro
                                </label>
                            </li>
                            <li>
                                <label class="dropdown-item">
                                    <input type="checkbox" class="form-check-input me-2"
                                        value="Platano de Baja dimension"> Plátano de
                                    Baja dimensión
                                </label>
                            </li>
                            <li>
                                <label class="dropdown-item">
                                    <input type="checkbox" class="form-check-input me-2"
                                        value="Platano con contaminacion biologica">
                                    Plátano con contaminación
                                    biológica
                                </label>
                            </li>
                            <li>
                                <label class="dropdown-item">
                                    <input type="checkbox" class="form-check-input me-2"
                                        value="Platano con daño mecanico"> Plátano con
                                    daño mecánico
                                </label>
                            </li>

                            <!-- Agrega más defectos aquí -->
                        </ul>
                    </div>
                </div>
                <div class="mb-3 col-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-circle me-2" style="color: #ec6704"></i>Cantidad de
                        Defectos</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.1"
                        class="form-control form-control-lg numeric shadow-sm text-center" id="cant_defectos"
                        name="cant_defectos" required placeholder="Cantidad Kg">
                </div>

                <div class="mb-3 col-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-clipboard-list me-2"
                            style="color: #ec6704"></i>Materia a Procesar</h5>
                    <div class="border-bottom mb-3"></div>
                    <input type="number" min="0" step="0.01"
                        class="form-control form-control-lg fw-bold numeric shadow-sm text-center" readonly
                        id="cantidad" name="cantidad" required placeholder="Cantidad Kg">
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>
                <div class="mb-3 col-3 mt-4">
                    <h5 class="text-titles"><i class="fa-solid fa-users-line me-2"
                            style="color: #ec6704"></i>Responsable</h5>
                    <div class="border-bottom mb-3"></div>
                    <input class="form-control form-control-lg shadow-sm" id="nombreResponsable" list="empleadolist"
                        name="nombreResponsable" required autocomplete="off">
                    <input class="" type="hidden" id="id_responsable" name="id_responsable"
                        placeholder="Operario Encargado" required>
                    <datalist id="empleadolist">
                    </datalist>
                    <div class="invalid-feedback">
                        Este campo es obligatorio.
                    </div>
                </div>

                <div class="row" id="contenedorCantidadDefectos">
                </div>

                <div class="form-group mb-3 col-12 mt-4">
                    <table class="table table-bordered p-1 text-center table-variables" id="table-variables">
                        <thead>
                            <tr>
                                <td colspan="4" class="fw-bold text-white"
                                    style="background-color:rgba(102, 112, 25, 0.808)">VARIABLES VISUALES</td>
                            </tr>
                            <tr>
                                <th class="pb-0">Color</th>
                                <th class="pb-0">Olor</th>
                                <th class="pb-0">Estado Físico</th>
                                <th class="pb-0">Cumple</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <input type="checkbox" class="form-check-input checkbox-lg shadow-sm" id="color"
                                        name="color" value="1">
                                </td>
                                <td>
                                    <input type="checkbox" class="form-check-input checkbox-lg shadow-sm" id="olor"
                                        name="olor" value="1">
                                </td>
                                <td>
                                    <input type="checkbox" class="form-check-input checkbox-lg shadow-sm"
                                        id="estado_fisico" name="estado_fisico" value="1">
                                </td>
                                <td>
                                    <input type="checkbox" class="form-check-input checkbox-lg shadow-sm" id="cumple"
                                        name="cumple" value="1">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <button type="submit" class="btn btn-lg col-12  btn-block fw-semibold fs-4 mt-4 rounded-4 "
                style="background-color:#ec6704 ; color: #f5f7ff;"> <i class="fa-solid fa-floppy-disk fs-3 me-2"></i>
                GUARDAR
                REGISTRO</button>
            <button type="button" data-tooltip="Observaciones"
                class="btn flotante-coments position-fixed m-4 border-0 align-content-center rounded-pill"
                style="background-color: #34a1e9; " data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight"
                aria-controls="offcanvasRight">
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
        </form>
    </div>
</div>

<script type="module" src="{{ asset('assets/js/modules/Produccion/recepcion.js')}}"></script>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<x-tablet-sidebar></x-tablet-sidebar>