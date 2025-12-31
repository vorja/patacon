<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de P. Insumos</p>
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
                        <div class="col-2 mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Registros</h6>
                                            <h2 class="mb-0" id="Proveedores">0</h2>
                                            <small class="" style="color: #2a93da">
                                                <i class="fa-solid fa-circle-exclamation"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape bg-white border-0 rounded shadow" style="color: #5dbb1f">
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
    <div class="row mt-2">
        <div class="col-12">
            <div class="card border-0 rounded-4 shadow-sm">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #24243c">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">PROVEEDORES DE INSUMOS</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalProveedorInsumos"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #24243c"></i></button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-provedores-insumos">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tablaProveedoresInsumos">
                            <thead>
                                <tr>
                                    <th class="A text-center"><i class="fa-solid fa-calendar"></i>
                                        Nombre</th>
                                    <th class="A text-center"><i class="fa-solid fa-boxes-packing"></i>
                                        Identificación</th>
                                    <th class="A text-center"><i class="fa-solid fa-cubes-stacked"></i>
                                        Movil</th>
                                    <th class="text-center"><i class="fa-solid fa-user-gear"></i>
                                        Acciones</th>
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
<div class="modal fade" id="ModalProveedorInsumos" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">REGISTRAR PROVEEDOR DE INSUMOS</h5>
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
                        <input type="text" class="form-control rounded shadow-sm" name="nombre" id="nombre" placeholder="Ingrese el nombre..." required
                            autocomplete="off">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="documento" class="form-label">Identificación / NIT.</label>
                        <input type="number" class="form-control rounded shadow-sm" name="documento" id="documento" placeholder="Ingrese la Identificación ..."
                            required>
                    </div>


                    <div class="mb-3 col-md-6">
                        <label for="telefono" class="form-label">Telefono.</label>
                        <input type="number" name="telefono" id="telefono" class="form-control rounded shadow-sm " min="0" placeholder="Ingrese el telefono.."
                            required>
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

<div class="modal fade" id="ModalInfoProveedores" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">INFORMACIÓN PROVEEDOR</h5>
            </div>
            <div class="modal-body">
                <div class="row g-3 mt-1">

                    <!-- Sección: Información Personal -->
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de personal</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control rounded-3 shadow-sm" name="nombre" id="nombre" required
                            autocomplete="off">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="documento" class="form-label">Identificación o NIT.</label>
                        <input type="number" class="form-control  shadow-sm" name="documento" id="documento" required>
                    </div>


                    <div class="mb-3 col-md-6">
                        <label for="telefono" class="form-label">Telefono.</label>
                        <input type="number" name="telefono" id="telefono" class="form-control  shadow-sm " required>
                    </div>

                </div>
            </div>

        </div>
    </div>
</div>