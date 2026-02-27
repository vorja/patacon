<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de P. Plátano</p>
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
                                            <h6 class="text-uppercase text-muted mb-2">Registros</h6>
                                            <h2 class="mb-1" id="Proveedores">0</h2>
                                            <small class="" style="color: #2a93da">
                                                <i class="fa-solid fa-circle-exclamation"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape bg-white border-0 rounded shadow"
                                            style="color: #80c511">
                                            <i class="fa-solid fa-file-lines fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3" id="prodTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active text-dark" id="general-tab" data-bs-toggle="tab" data-bs-target="#general"
                type="button" role="tab">Vista General</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link " id="proveedores-tab" data-bs-toggle="tab" data-bs-target="#proveedores"
                type="button" role="tab">Historial Proveedores</button>
        </li>
    </ul>

    <div class="tab-content">
        <!-- Vista General -->
        <div class="tab-pane fade show active" id="general" role="tabpanel">
            <div class="row mt-2">
                <div class="col-12">
                    <div class="card border-0 shadow rounded-4">
                        <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                            style="background-color: #ec6704">
                            <div class="d-flex align-items-center gap-2">
                                <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                                <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                            </div>
                            <h3 class="fw-bold text-white m-0">PROVEEDORES DE PLATANO</h3>
                            <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                                data-bs-toggle="modal" data-bs-target="#ModalProveedoresPlatano"><i
                                    class="fa-solid fa-file-circle-plus fs-4" style="color: #6c780d"></i></button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive" id="tabl-dinamica-provedores-plano">
                                <table class="table table-hover tabla-personalized w-100 p-3" id="tablaProveedores">
                                    <thead>
                                        <tr>
                                            <th scope="col" class="A text-center"><i class="fa-solid fa-calendar"></i>
                                                Nombre</th>
                                            <th scope="col" class="A text-center"><i
                                                    class="fa-solid fa-boxes-packing"></i>
                                                Identificación</th>
                                            <th scope="col" class="A text-center"><i
                                                    class="fa-solid fa-cubes-stacked"></i>
                                                Movil</th>
                                            <th scope="col" class="text-center"><i class="fa-solid fa-user-gear"></i>
                                                Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="4"> !No Hay Información Disponible¡</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reportes Proveedor -->
        <div class="tab-pane fade" id="proveedores" role="tabpanel">
            <div class="row justify-content-end align-items-center g-2 mb-2 mt-4">
                <div class="col-4">
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm shadow-sm"
                            placeholder="Buscar Proveedor.." id="inputSearhP" aria-label="Username"
                            aria-describedby="basic-addon1" autocomplete="off">
                        <span class="input-group-text" id="basic-addon1"><i
                                class="fa-solid fa-magnifying-glass"></i></span>
                    </div>
                    <div class="input-group">
                        <div class="list-group suggestions" id="suggestionsP" data-tipo="P">
                        </div>
                    </div>
                </div>
            </div>
            <div class="card p-3 border-0 rounded-4 shadow mb-4 mt-4">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #24243c;">
                    <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                        <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                            style="max-height: 55px;">
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <H3 class="fw-bold text-white m-0">HISTORIAL DE PROVEEDOR</H3>
                    <div class="d-flex align-items-center gap-2" style="align-items: center; gap: 10px;">
                        <img src="/assets/images/logo-clean.png" alt="Logo empresa" class="img-fluid"
                            style="max-height: 55px;">
                    </div>
                </div>
                <div class="card-body">
                    <div class="container-fluid mb-4  g-3 mt-2">
                        <div class="row mt-1">
                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table tabla-personalized table-hover w-100 g-2"
                                        id="tablaRendProveedores">
                                        <thead class="table-dark">
                                            <tr>
                                                <th class="text-center N">PRODUCCION</th>
                                                <th class="text-center N">PROVEEDOR</th>
                                                <th class="text-center N">MATERIA RECEPCIÓN</th>
                                                <th class="text-center N">RENDIMIENTO</th>
                                                <th class="text-center O">ACCION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colspan="5">No Hay Información Disponible..</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Proveedores de Platano -->
<div class="modal fade" id="ModalProveedoresPlatano" tabindex="-1" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="createModalLabel">REGISTRAR PROVEEDOR DE PLATANO</h5>
            </div>
            <div class="modal-body">
                <form id="formProveedor" class="row g-3 mt-1">
                    <input type="hidden" name="id_proveedor" id="id_proveedor">

                    <!-- Sección: Información Personal -->
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de personal</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control  rounded shadow-sm" name="nombre"
                            placeholder="Nombre del Proveedor." id="nombre" required autocomplete="off">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="documento" class="form-label">Identificación / NIT</label>
                        <input type="number" class="form-control  rounded shadow-sm" name="documento"
                            placeholder="Identificación del Proveedor" id="documento" required>
                    </div>


                    <div class="mb-3 col-md-6">
                        <label for="telefono" class="form-label">Telefono.</label>
                        <input type="number" name="telefono" id="telefono" placeholder="Telefono del Proveedor"
                            class="form-control  shadow-sm rounded" required>
                    </div>
                    <div class="col-12 text-end">
                        <button type="submit" class="btn text-white"
                            style="background-color: #5dbb1f">Registrar</button>
                    </div>
                    <div class="col-12 text-center mt-3">
                        <small>Aceptas nuestras Políticas de Privacidad y Términos de Servicio al enviar este
                            formulario.</small>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>

{{-- Info Proveedor : Información General --}}
<div class="modal fade" id="ModalInfoproveedores" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">INFOMACIÓN GENERAL</h5>
            </div>
            <div class="modal-body">
                <div class="row g-2 mt-2">

                    <!-- Sección: Información Personal -->
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de personal</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control rounded shadow-sm" name="nombre_info" id="nombre_info"
                            readonly>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="documento" class="form-label">Identificación</label>
                        <input type="number" class="form-control rounded shadow-sm" name="documento" id="documento_info"
                            readonly>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="telefono" class="form-label">Telefono.</label>
                        <input type="number" name="telefono" id="telefono_info" class="form-control rounded shadow-sm"
                            readonly>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

{{-- Info Proveedor : Rendimiento Indicidual --}}
<div class="modal fade" id="ModaRendProveedor" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem; ">
            <!-- Header -->
            <div class="modal-header rounded-top-4 justify-content-between align-items-center"
                style="background-color: #f5f7ff; color: #070707;">
                <div class="d-flex align-items-center gap-2">
                    <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 55px;'>
                    <h4 class="fw-bold text-dark m-0">INFORMACIÓN PROVEEDOR</h4>
                </div>
            </div>
            <!-- Body -->
            <div class="modal-body px-2 py-4" style="background-color: #f5f7ff; color: #070707;">
                <div class="container-fluid mt-2">
                    <ul class="nav nav-tabs mb-3" id="prodTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active text-dark" id="generaInfo-tab" data-bs-toggle="tab"
                                data-bs-target="#generaInfo" type="button" role="tab">Información General</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link " id="frituraProveedor-tab" data-bs-toggle="tab"
                                data-bs-target="#frituraProveedor" type="button" role="tab">Información Fritura</button>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="generaInfo" role="tabpanel">
                            <div class="container-fluid">
                                <div class="row g-3 text-center">
                                    <div class="col-lg-12">
                                        <div class="row g-3">
                                            <div class="col-lg-8">
                                                <div class="card border-0 shadow-sm h-100">
                                                    <div class="bg-dark text-white text-center py-2 rounded-top">
                                                        <h5 class="mb-0">Rendimiento por Etapa</h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <!-- Etapa -->
                                                        <div class="d-flex align-items-center mb-4">
                                                            <div class="me-3" style="color: #6c780d; ">
                                                                <i class="fa-solid fa-seedling fa-2x"></i>
                                                            </div>
                                                            <div class="flex-grow-1">
                                                                <div class="d-flex justify-content-between">
                                                                    <span class="fw-semibold"
                                                                        style="color: #6c780d">Plátano</span>
                                                                    <span id="labelPlatano" class="fw-bold">0%</span>
                                                                </div>
                                                                <div class="progress mt-1" style="height: 15px;">
                                                                    <div id="progPlatano"
                                                                        class="progress-bar progress-bar-striped"
                                                                        style="width: 52%; background: linear-gradient(90deg, #839406, #8bd48b);">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Fritura -->
                                                        <div class="d-flex align-items-center mb-4">
                                                            <div class="me-3 text-danger">
                                                                <i class="fa-solid fa-fire fa-2x"></i>
                                                            </div>
                                                            <div class="flex-grow-1">
                                                                <div class="d-flex justify-content-between">
                                                                    <span class="fw-semibold text-dark">Fritura</span>
                                                                    <span id="labelFritura" class="fw-bold">0%</span>
                                                                </div>
                                                                <div class="progress mt-1" style="height: 15px;">
                                                                    <div id="progFritura"
                                                                        class="progress-bar progress-bar-striped"
                                                                        style="width: 82.1%; background: linear-gradient(90deg, #ec6704, #f87171);">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- HFritura -->
                                                        <div class="d-flex align-items-center mb-4">
                                                            <div class="me-3 text-warning">
                                                                <i class="fa-solid fa-box fa-2x"></i>
                                                            </div>
                                                            <div class="flex-grow-1">
                                                                <div class="d-flex justify-content-between">
                                                                    <span class="fw-semibold "
                                                                        style="color: #ffc107">HFritura</span>
                                                                    <span id="labelHFritura" class="fw-bold">0%</span>
                                                                </div>
                                                                <div class="progress mt-1" style="height: 15px;">
                                                                    <div id="progHFritura"
                                                                        class="progress-bar progress-bar-striped"
                                                                        style="width: 42.6%; background: linear-gradient(90deg, #ffc107, #ffd861);">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Empaque -->
                                                        <div class="d-flex align-items-center">
                                                            <div class="me-3 text-info">
                                                                <i class="fa-solid fa-box fa-2x"></i>
                                                            </div>
                                                            <div class="flex-grow-1">
                                                                <div class="d-flex justify-content-between">
                                                                    <span class="fw-semibold text-info">Empaque</span>
                                                                    <span id="labelEmpaque" class="fw-bold">0%</span>
                                                                </div>
                                                                <div class="progress mt-1" style="height: 15px;">
                                                                    <div id="progEmpaque"
                                                                        class="progress-bar progress-bar-striped"
                                                                        style="width: 92.1%; background: linear-gradient(90deg, #24243c, #6edff6);">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Rendimiento General -->
                                            <div class="col-lg-4">
                                                <div class="card border-0 shadow-sm h-100">
                                                    <div class="bg-dark text-white text-center py-2 rounded-top">
                                                        <h5 class="mb-0">Rendimiento General</h5>
                                                    </div>
                                                    <div
                                                        class="card-body d-flex align-items-center justify-content-center">
                                                        <div class="circle-wrap">
                                                            <div class="circle">
                                                                <div class="mask half">
                                                                    <div class="fill" style="background-color: #ec6704">
                                                                    </div>
                                                                </div>
                                                                <div class="inside-circle fw-bold fs-3"
                                                                    style="background-color:rgb(241, 225, 210); color:#ec6704;"
                                                                    id="rendimientoPro">
                                                                    0%</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- FILA 2 -->
                                            <div class="col-lg-8 mt-4">
                                                <div class="card border-0 shadow-sm h-100">
                                                    <div class="bg-dark text-white text-center py-2 rounded-top">
                                                        <h5 class="mb-0">Rechazo Áreas - Proveedor: </h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <div class="container-proveedor">
                                                            <div id="graficaRechazoProv"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Cajas Empacadas -->
                                            <div class="col-lg-4 mt-4">
                                                <div class="row">
                                                    <div class="col col-12">
                                                        <div class="card border-0 shadow-sm h-100">
                                                            <div
                                                                class="bg-dark text-white text-center py-2 rounded-top">
                                                                <h5 class="mb-0">Cajas Empacadas</h5>
                                                            </div>
                                                            <div class="card-body p-0">
                                                                <div class="table-responsive h-100">
                                                                    <table
                                                                        class="table tabla-personalized w-100 table-hover text-center mb-0"
                                                                        id="cajasProveedor">
                                                                        <thead>
                                                                            <tr>
                                                                                <th class="text-center">Tipo</th>
                                                                                <th class="text-center">Cantidad</th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            <tr>
                                                                                <td colspan="2">No Hay Información
                                                                                    Disponible
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col mt-5">
                                                        <div class="card border-0 shadow-sm h-100">
                                                            <div
                                                                class="bg-dark text-white text-center py-2 rounded-top">
                                                                <h5 class="mb-0"> Cortes Tipo</h5>
                                                            </div>
                                                            <div class="card-body p-0">
                                                                <div class="table-responsive ">
                                                                    <table
                                                                        class="table tabla-personalized w-100 table-hover text-center mb-0"
                                                                        id="cortesProveedor">
                                                                        <thead>
                                                                            <tr>
                                                                                <th class="text-center">Tipo</th>
                                                                                <th class="text-center">Cantidad</th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            <tr>
                                                                                <td colspan="2">No Hay Información
                                                                                    Disponible
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="frituraProveedor" role="tabpanel">
                            <div class="container-fluid">
                                <div class="row g-3 justify-content-center mb-3">
                                    <div class="col-lg-8">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="bg-dark text-white text-center py-2 rounded-top">
                                                <h5 class="mb-0">Proceso de Fritura - Proveedor: Daniel Rodas</h5>
                                            </div>
                                            <div class="card-body ">
                                                <div class="table-responsive h-100">
                                                    <table
                                                        class="table table-bordered text-center align-middle mb-0 h-100">
                                                        <thead class="table-secondary">
                                                            <tr>
                                                                <th colspan="2">Datos Generales</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td class="fw-bold">Fecha Produccion</td>
                                                                <td id="fritFecha"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Inicio </td>
                                                                <td id="fritIni"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Fin </td>
                                                                <td id="fritFin"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Duración</td>
                                                                <td id="fritDuracion"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Temperatura</td>
                                                                <td id="fritTemperatura"></td>
                                                            </tr>
                                                        </tbody>
                                                        <thead class="table-secondary">
                                                            <tr>
                                                                <th colspan="2">Resultados</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td class="fw-bold">Canastas</td>
                                                                <td id="fritCanastas"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Materia Prima (Kg)</td>
                                                                <td id="fritKgPatacon"></td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Migas (Kg)</td>
                                                                <td id="fritMigas">0</td>
                                                            </tr>
                                                            <tr>
                                                                <td class="fw-bold">Rechazo (Kg)</td>
                                                                <td id="fritRechazo"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>