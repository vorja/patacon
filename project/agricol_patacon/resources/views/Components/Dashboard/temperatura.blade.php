<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Cuartos</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1"></i>
        <span>Inicio</span>
    </a>
</div>

<div class="container-fluid" id="tabl-dinamica">

    <div class="row mb-4 mt-2">
        <div id="carouselId" class="carousel slide" data-bs-ride="slide" id="carouselCards">
            <div class="carousel-inner" role="listbox">
                <div class="carousel-item active">
                    <div class="content d-flex justify-content gap-3 ">
                        <div class="col-2 mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Cuartos</h6>
                                            <h2 class="mb-0" id="Cuartos">0</h2>
                                            <small class="" style="color: #5dbb1f;">
                                                <i class="fa-solid fa-circle"></i>
                                            </small>
                                            <span class="text-muted" id="">Disponibles</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da;">
                                            <i class="fa-solid fa-warehouse fa-2x p-1"></i>
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
                    style="background-color: #6c780d">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">CUARTOS</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalRoles"><i class="fa-solid fa-file-circle-plus fs-4"
                            style="color: #6c780d"></i></button>
                </div>
                <div class="card-body">

                    <div class="row d-flex justify-content-between align-items-center mb-4 mt-2" id="tabla-dinamica">

                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

<div class="modal fade" id="Modaltemperatura" tabindex="-1"  aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">REGISTRAR CUARTO</h5>
            </div>
            <div class="modal-body">
                <form id="formCuarto" class="row g-3 mt-2">
                    <!-- Sección: Información Personal -->
                    <input type="hidden" name="id_cuarto" id="id_cuarto">


                    <div class="mb-3 col-md-12">
                        <label for="nombre" class="form-label">Nombre </label>
                        <input type="text" class="form-control  rounded-3 shadow-sm" name="nombre"
                            placeholder="nombre del cuarto..." id="nombre" required autocomplete="off">
                    </div>

                    <div class="mb-3 col-md-12">
                        <label for="descripcion" class="form-label">Descripcion</label>
                        <textarea class="form-control rounded shadow-sm" name="descripcion" id="descripcion"
                            placeholder="Breve descripción del cuarto" rows="4"></textarea>
                    </div>


                    <!-- Sección: Información de la Empresa -->

                    <div class="col-12 mb-2 text-end">
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
<div class="modal fade" id="ModalInfotemperatura" tabindex="-1"
    aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #1e1e2f; color: #fff; border-radius: 1rem;">
            <div class="modal-header border-0" style="background-color: #1e1e2f; color: #fff; border-radius: 1rem;">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACION</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 mt-1">

                    <div class="mb-3">
                        <label for="nombre del rol">
                            Nombre Rol
                        </label>
                        <input type="text" class="form-control" name="nombre" id="nombre_info" required>
                    </div>

                    <div class="mb-3">
                        <label for="Descripcion del cuarto">
                            Descripcion
                        </label>
                        <textarea class="form-control rounded shadow-sm" name="descripcion_info" id="descripcion" readonly
                            placeholder="Breve descripcion.." rows="4"></textarea>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
<div class="modal fade" id="ModalInfoCuarto" tabindex="-1" data-bs-backdrop="static" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0 mb-2" style="background-color:#fff; border-radius: 1rem;">
            <div class="title-modal modal-header fw-bold text-white">
                <h5 class="modal-title col-11 text-center" id="title">REGISTRO DE TEMPERATURAS</h5>
                <button type="button" class="btn-close co-1 btn-close-white" id="btn-Close" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 mt-1">
                    <div class="card p-2 shadow-lg">
                        <div class="card-body rounded">
                            <table class="table tabla-personalized" id="tablaTemperaturas" style="width: 100%">
                                <thead>
                                    <tr>
                                        <th rowspan="2" style="text-align: center">Día</th>
                                        <th class="I" colspan="2">Inicio</th>
                                        <th class="M" colspan="2">Medio</th>
                                        <th class="F" colspan="2">Final</th>
                                        <th rowspan="2" style="text-align: center">Responsable</th>
                                    </tr>
                                    <tr>
                                        <th class="I">Hora</th>
                                        <th class="I">Temp</th>
                                        <th class="M">Hora</th>
                                        <th class="M">Temp</th>
                                        <th class="F">Hora</th>
                                        <th class="F">Temp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- El cuerpo se autogenera -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>