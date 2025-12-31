<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Ordenes</p>
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
                        <div class="col-2 mt-2 mb-3">
                            <div class="card border-0 rounded-4 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Ordenes</h6>
                                            <h2 class="mb-0" id="Ordenes">0</h2>
                                            <small class="" style="color: #232b30">
                                                <i class="fas fa-circle"></i>
                                            </small>
                                            <span class="text-muted" id="">Registrados</span>
                                        </div>
                                        <div class="icon icon-shape bg-white border-0 rounded shadow"
                                            style="color: #2a93da">
                                            <i class="fa-solid fa-clipboard-list fa-2x p-1"></i>
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
                    <h3 class="fw-bold text-white m-0">Historial de Ordenes</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalOrdenes"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #ec6704"></i></button>
                </div>
                <div class="card-body">

                    <div class="table-responsive" id="tabl-dinamica-Ordenes">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tablaOrdenes">
                            <thead>
                                <tr>
                                    <th scope="col" class="text-center"> Numero</th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-boxes-packing"></i>
                                        Contenedor</th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-noted"></i> Cliente
                                    </th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-noted"></i> Solicitud
                                    </th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-note-sticky"></i>
                                        Observaciones
                                    </th>
                                    <th scope="col" class="text-center"><i class="fa-solid fa-user-gear"></i>
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

{{-- Modal de Creaccion --}}
<div class="modal fade" id="ModalOrdenes" tabindex="-1" data-bs-backdrop="static" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header  justify-content-between"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="createModalLabel"> REGISTRAR ORDEN DE PRODUCIÓN </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <form id="formOrden" class="row g-3 mt-1 p-1">
                    <input type="hidden" name="id_orden" id="id_orden">

                    <!-- Fecha -->
                    <div class="mb-3 col-6">
                        <label for="fecha" class="form-label">Fecha Solicitud</label>
                        <input type="date" class="form-control  rounded shadow-sm" id="fecha_solicitud"
                            name="fecha_solicitud" required>
                    </div>
                    <div class="mb-3 col-6">
                        <label for="empresa" class="form-label">Orden N°</label>
                        <input type="number" min="0" class="form-control  rounded-3 shadow-sm"
                            placeholder="Numero de la Orden." name="numero_orden" id="numero_orden" required>
                    </div>

                    <!-- Sección: Información Personal -->
                    <div class="col-7">

                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de Orden</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="lote_contenedor" class="form-label">Contenedor.</label>
                        <input type="text" class="form-control  rounded shadow-sm"
                            placeholder="Nombre o Lote del Contenedor" name="lote_contenedor" id="lote_contenedor"
                            required autocomplete="off">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="id_cliente" class="form-label">Nombre del Cliente.</label>
                        <input type="text" class="form-control   shadow-sm" placeholder="Buscar Cliente.."
                            id="search_cliente" required autocomplete="off">
                        <input type="hidden" id="id_cliente" name="id_cliente" required>

                        <div class="input-group">
                            <div class="list-group suggestions" id="suggestions" data-tipo="C">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_inicial" class="form-label">Fecha Inicial.</label>
                        <input type="date" class="form-control  rounded shadow-sm" name="fecha_inicial"
                            id="fecha_inicial" required>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_estimada" class="form-label">Fecha Estimada. </label>
                        <input type="date" class="form-control  rounded shadow-sm" name="fecha_estimada"
                            id="fecha_estimada" required>
                    </div>

                    <!-- Sección: Detalle del Proyecto -->
                    <div class="col-12">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146;">Responsable de la Orden</span>
                        </h5>
                    </div>
                    <div class="mb-3 col-md-4">
                        <label for="inputElaboracion" class="form-label">Elaboración.</label>
                        <input list="listElaboracion" id="inputElaboracion"
                            class="form-control  rounded-pill shadow-sm rounded" autocomplete="off">
                        <datalist id="listElaboracion"></datalist>
                        <input type="hidden" name="id_elaboracion" id="id_elaboracion" required>
                    </div>
                    <div class="mb-3 col-md-4">
                        <label for="inputNotificacion" class="form-label">Notificación.</label>
                        <input list="listNotificacion" id="inputNotificacion"
                            class="form-control  rounded-pill shadow-sm rounded" autocomplete="off">
                        <datalist id="listNotificacion"></datalist>
                        <input type="hidden" name="id_notificacion" id="id_notificacion" required>
                    </div>
                    <div class="mb-3 col-md-4">
                        <label for="inputAutorizacion" class="form-label">Autorización.</label>
                        <input list="listAutorizacion" id="inputAutorizacion"
                            class="form-control  rounded-pill shadow-sm rounded" autocomplete="off" required>
                        <datalist id="listAutorizacion"></datalist>
                        <input type="hidden" name="id_autorizacion" id="id_autorizacion" required>
                    </div>
                    <div class="mb-3 col-12">
                        <label for="observaciones" class="form-label">Observaciones adicionales</label>
                        <textarea class="form-control rounded shadow-sm" name="observaciones" id="observaciones"
                            placeholder="Observaciones.." rows="3"></textarea>
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

{{-- Modal de Información --}}

<div class="modal fade" id="ModalInfoOrdenes" tabindex="-1" data-bs-backdrop="static" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-xl border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header  justify-content-between"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="createModalLabel">INFORMACIÓN</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-4 mt-1">

                    <!-- Fecha -->
                    <div class="mb-3 col-6">
                        <label for="fecha_solicitud" class="form-label">Fecha Solicitud</label>
                        <input type="date" class="form-control form-control-sm rounded-pill shadow-sm"
                            id="fecha_solicitud_info" name="fecha_solicitud" readonly>
                    </div>
                    <div class="mb-3 col-6">
                        <label for="numero_orden_info" class="form-label">Orden N°</label>
                        <input type="number" min="0" class="form-control form-control-sm rounded-pill shadow-sm"
                            name="numero_orden" id="numero_orden_info" readonly>
                    </div>

                    <!-- Sección: Información Personal -->
                    <div class="col-7">

                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información de Orden</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="lote_empaque_info" class="form-label">Lote de Empaque</label>
                        <input type="text" class="form-control form-control-sm rounded-pill shadow-sm"
                            placeholder="Lote Contenedor" name="lote_contenedor" id="lote_empaque_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="id_cliente_info" class="form-label">Nombre del Cliente</label>
                        <input type="text" class="cliente form-control form-control-sm rounded-pill shadow-sm"
                            placeholder="Buscar cliente..." id="search_cliente" readonly>
                        <input type="hidden" id="id_cliente_info" name="id_cliente_info" readonly>

                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_inicial_info" class="form-label">Fecha Inicial</label>
                        <input type="date" class="form-control form-control-sm rounded-pill shadow-sm"
                            name="fecha_inicial" id="fecha_inicial_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="fecha_estimada_info" class="form-label">Fecha Estimada</label>
                        <input type="date" class="form-control form-control-sm rounded-pill shadow-sm"
                            name="fecha_estimada" id="fecha_estimada_info" readonly>
                    </div>

                    <!-- Sección: Detalle del Proyecto -->
                    <div class="col-7">

                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146;">Responsable de la Orden</span>
                        </h5>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="inputElaboracion_info" class="form-label">Elaboración.</label>
                        <input list="listElaboracion" id="inputElaboracion_info"
                            class="form-control form-control-sm rounded-pill shadow-sm rounded-pill" autocomplete="off"
                            readonly>
                        <input type="hidden" name="id_elaboracion_info" id="id_elaboracion_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="inputNotificacion_info" class="form-label">Notificación.</label>
                        <input list="listNotificacion" id="inputNotificacion_info"
                            class="form-control form-control-sm rounded-pill shadow-sm rounded-pill" autocomplete="off"
                            readonly>

                        <input type="hidden" name="id_notificacion" id="id_notificacion_info" readonly>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="inputAutorizacion_info" class="form-label">Autorización.</label>
                        <input list="listAutorizacion" id="inputAutorizacion_info"
                            class="form-control form-control-sm rounded-pill shadow-sm rounded-pill" readonly>

                        <input type="hidden" name="id_autorizacion" id="id_autorizacion_info" readonly>
                    </div>


                    <div class="mb-3 col-12">
                        <label for="observaciones_info" class="form-label">Observaciones adicionales</label>
                        <textarea class="form-control rounded shadow-sm" name="observaciones_info"
                            id="observaciones_info" rows="3" readonly></textarea>
                    </div>


                </div>

            </div>

        </div>
    </div>
</div>