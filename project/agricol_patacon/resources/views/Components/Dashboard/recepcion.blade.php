<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Recepcion</p>
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
                    <div class="content d-flex justify-content-between gap-3">
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Registros</h6>
                                            <h3 class="mb-1" id="Lotes">0</h3>
                                            <small class="" style="color: #1757e0">
                                                <i class="fa-solid fa-tags"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da">
                                            <i class="fa-solid fa-tags fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Materia</h6>
                                            <h3 class="mb-1" id="Materia">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-scale-balanced"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape bg-dark text-white border-0 rounded shadow">
                                            <i class="fa-solid fa-scale-balanced fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Defectos</h6>
                                            <h3 class="mb-0" id="Defectos">0</h3>
                                            <small class="text-dark">
                                                <i class="fa-solid fa-recycle"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape  text-white border-0 rounded shadow"
                                            style="background-color: #80c511">
                                            <i class="fa-solid fa-recycle fa-2x p-1"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselCards" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselCards" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    </div>

    <div class="row mt-4 mb-2 justify-content-end">
        <div class="col-12 mb-2 mt-4">
            <div class="row justify-content-between">
                <div class="col-4">
                    <div class="input-group">
                        <input type="text" class="form-control  shadow-sm" id="inputSearch"
                            placeholder="Buscar produccion.." autocomplete="off">
                        <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                    </div>
                    <div class="input-group">
                        <div class="list-group suggestions" id="suggestions">

                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="row g-3 justify-content-end">
                        <div class="col-5"><input type="date" class="form-control  shadow-sm text-center" disabled
                                id="inputFiltro"></div>
                        <div class="col-3">
                            <button type="button" id="limpiarFiltro" class="btn btn-md shadow text-white"
                                style="background-color: #2a93da" disabled>
                                <i class="fa-solid fa-broom fa-lg"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col-12">
            <div class="card border-0 shadow rounded-4">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #df751eff">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">REGISTROS ÁREA DE RECEPCION</h3>
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" class="btn  text-white fw-bold rounded-circle p-2 shadow"
                            style="background-color:rgb(228, 8, 8)" id="btnPDF" disabled hidden><i
                                class="fa-solid fa-file-pdf fs-4 p-1" style="color:#fff"></i>
                        </button>
                    </div>
                </div>
                <div class="card-container card-body d-flex flex-wrap justify-content-center gap-3" id="informes">

                </div>
            </div>
        </div>
    </div>
</div>
{{-- <div class="modal fade" id="ModalInfoRecepcion" tabindex="-1" data-bs-backdrop="static"
    aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header border-0">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACIÓN</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div id="formRol" class="row g-3 mt-1">
                    <input type="hidden" name="id_rol" id="id_rol">
                    <div class="mb-3">
                        <label for="nombre del rol">
                            Nombre Rol
                        </label>
                        <input type="text" class="form-control" name="nombre" id="nombre_info" readonly>
                    </div>

                    <div class="mb-3">
                        <label for="Descripcion del rol">
                            Descripcion
                        </label>
                        <input type="text" class="form-control" name="descripcion" id="descripcion_info" readonly>
                    </div>

                </div>
            </div>

        </div>
    </div>
</div> --}}