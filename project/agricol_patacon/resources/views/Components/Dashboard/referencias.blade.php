<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Referencias</p>
    <a href="/panel" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="me-1">/</span>
        <i class="fas fa-home text-secondary me-1"></i>
        <span>Inicio</span>
    </a>
</div>
<div class="container-fluid">
    <div class="row mb-4">
        <div id="carouselId" class="carousel slide" data-bs-ride="slide" id="carouselCards">
            <div class="carousel-inner" role="listbox">
                <div class="carousel-item active">
                    <div class="content d-flex justify-content gap-3 ">
                        <div class="col-4 mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Referencias</h6>
                                            <h2 class="mb-0" id="Referencia">0</h2>
                                            <small class="" style="color: rgb(74, 226, 28)">
                                                <i class="fas fa-circle"></i>
                                            </small>
                                            <span class="text-muted" id="">Disponibles</span>
                                        </div>
                                        <div class="icon icon-shape  text-white border-0 rounded shadow"
                                            style=" background-color: #2a93da;">
                                            <i class="fa-solid fa-user-tag fa-2x p-1"></i>
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
                    style="background-color:rgb(108, 120, 13);">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">REFERENCIAS</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalRerefencias"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #ec6704"></i></button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-refeencias">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tablaReferencias">
                            <thead>
                                <tr>
                                    <th class="M text-center"><i class="fa-solid fa-boxes-packing"></i>
                                        Abreviatura</th>
                                    <th class="M text-center"><i class="fa-solid fa-noted"></i>
                                        Descripción
                                    </th>
                                    <th class="A text-center"><i class="fa-solid fa-user-gear"></i> Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="3">No Hay Información Disponible</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


{{-- Modal de Creaccion --}}
<div class="modal fade" id="ModalReferencias" tabindex="-1" data-bs-backdrop="static" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff"">
                <h5 class=" modal-title fw-bold" id="createModalLabel">REGISTRAR REFERENCIA</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <form id="formReferencia" class="row g-3 mt-1">
                    <input type="hidden" name="id_referencia" id="id_referencia">
                    <div class="mb-3 col-md-12">
                        <label for="nombre" class="form-label">Nombre de Referencia.
                        </label>
                        <input type="text" class="form-control rounded shadow-sm" name="nombre" id="nombre"
                            placeholder="Ingrese el nombre de la referencia" required autocomplete="off">
                    </div>

                    <div class="mb-3 col-md-12">
                        <label for="nombre" class="form-label">Descripción de Referencia.</label>
                        <textarea class="form-control rounded shadow-sm" name="descripcion" id="descripcion"
                            placeholder="Breve descripcion de la referencia" rows="4"></textarea>
                    </div>

                    <div class="mb-2">
                        <div class="d-flex justify-content-end align-items-center m-3 border-0">
                            <button type="submit" class="btn" style="background-color: #5dbb1f">Registrar</button>
                        </div>
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

{{-- Modal de Información --}}

<div class="modal fade" id="ModalInfoReferencia" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACIÓN</h5>
            </div>
            <div class="modal-body">
                <div class="row g-3 mt-1">

                    <div class="mb-3">
                        <label for="nombre del rol">
                            Referencia
                        </label>
                        <input type="text" class="form-control text-center" name="nombre" id="nombre_info" readonly>
                    </div>

                    <div class="mb-3">
                        <label for="Descripcion del referencia">
                            Descripcion
                        </label>
                        <textarea class="form-control rounded shadow-sm" name="descripcion_info" id="descripcion_info"
                            placeholder="Breve descripcion de la referencia" rows="4" readonly></textarea>
                    </div>


                </div>
            </div>
        </div>
    </div>
</div>