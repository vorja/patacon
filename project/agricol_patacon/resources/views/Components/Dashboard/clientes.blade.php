<!-- Header -->
<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Clientes</p>
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
                            <div class="card border-0 shadow-sm rounded-4">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center p-1">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Clientes</h6>
                                            <h2 class="mb-0" id="Clientes">0</h2>
                                            <small class="text-success" style="color: #5dbb1f">
                                                <i class="fas fa-book"></i>
                                            </small>
                                            <span class="text-muted mt-1" id="">Registrados</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da">
                                            <i class="fa-solid fa-briefcase fa-2x p-1"></i>
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
            <div class="card shadow border-0 rounded-4 p-3">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: rgb(108, 120, 13);">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">CLIENTES</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalClientes"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #ec6704"></i></button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-clientes">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tablaClientes">
                            <thead>
                                <tr>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-circle-user"></i>
                                        Nombre</th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-location-dot"></i>
                                        Destino</th>

                                    <th scope="col" class="text-center"><i class="fa-solid fa-user-gear"></i>
                                        Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="4">No hay Información Disponible</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="ModalClientes" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">REGISTRAR CLIENTE</h5>
            </div>
            <div class="modal-body">
                <form id="formCliente" class="row g-3 mt-2">
                    <!-- Sección: Información Personal -->
                    <input type="hidden" name="id_cliente" id="id_cliente">
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de la Empresa</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Nombre de la Empresa</label>
                        <input type="text" class="form-control rounded shadow-sm" name="nombre"
                            placeholder="Nombre del Cliente" placeholder="Ingrese el nombre" id="nombre" required
                            autocomplete="off">
                    </div>

                    <!-- Sección: Información de la Empresa -->
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información Especifica</span>
                        </h5>

                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="puerto_embarque" class="form-label">Puerto de Embarque</label>
                        <input type="text" class="form-control rounded shadow-sm"
                            placeholder="Ingrese el puerto de embarque.." name="puerto_embarque" id="puerto_embarque">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="puerto_llegada" class="form-label">Puerto de Llegada</label>
                        <input type="text" class="form-control rounded shadow-sm"
                            placeholder="Ingrese el puerto de llegada.." name="puerto_llegada" id="puerto_llegada">
                    </div>
                    <div class="mb-2 col-md-6">
                        <label for="destino" class="form-label">Destino </label>
                        <input type="text" class="form-control rounded shadow-sm" name="destino"
                            placeholder="Ingrese el destino..." id="destino">
                    </div>
                    <div class="col-12 text-end">
                        <button type="submit" class="btn text-white"
                            style="background-color: #5dbb1f">Registrar</button>
                    </div>
                    <div class="col-12 text-center mt-2">
                        <small>Aceptas nuestras Políticas de Privacidad y Términos de Servicio al enviar este
                            formulario.</small>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
{{-- INFO CLIENTES --}}
<div class="modal fade" id="ModalInfoClientes" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">INFORMACIÓN DEL CLIENTE</h5>
            </div>
            <div class="modal-body">
                <div class="row g-2 mt-2">
                    <!-- Sección: Información Personal -->

                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de la Empresa</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre_info" class="form-label">Nombre de la Empresa</label>
                        <input type="text" class="form-control  rounded shadow-sm" name="nombre" id="nombre_info"
                            readonly>
                    </div>
                    <!-- Sección: Información de la Empresa -->
                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información Especifica</span>
                        </h5>

                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="puerto_embarque_info" class="form-label">Puerto de Embarque</label>
                        <input type="text" class="form-control  rounded shadow-sm" name="puerto_embarque"
                            id="puerto_embarque_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="puerto_llegada_info" class="form-label">Puerto de Llegada</label>
                        <input type="text" class="form-control  rounded shadow-sm" name="puerto_llegada"
                            id="puerto_llegada_info" readonly>
                    </div>
                    <div class="mb-2 col-md-6">
                        <label for="destino_info" class="form-label">Destino </label>
                        <input type="text" class="form-control  rounded shadow-sm" name="destino" id="destino_info"
                            readonly>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>