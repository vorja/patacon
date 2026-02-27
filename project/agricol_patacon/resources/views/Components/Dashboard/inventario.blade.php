<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Inventario</p>
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
                                            <h6 class="text-uppercase text-muted mb-2">Items</h6>
                                            <h2 class="mb-0" id="Items">0</h2>
                                            <small class="" style="color: #5dbb1f">
                                                <i class="fas fa-circle-check"></i>
                                            </small>
                                            <span class="text-muted" id="">Disponibles</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow"
                                            style="background-color: #2a93da">
                                            <i class="fa-solid fa-globe fa-2x p-1"></i>
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
                    <h3 class="fw-bold text-white m-0">INVENTARIO DE PLANTA</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalInventario"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #ec6704"></i></button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-inventario">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tableInventario">
                            <thead>
                                <tr>
                                    <th scope="col" class="T text-center"><i class="fa-solid fa-truck-front"></i>
                                        Proveedor</th>
                                    <th scope="col" class="T text-center"><i class="fa-solid fa-ruler-vertical"></i>
                                        Medida</th>
                                    <th scope="col" class="T text-center"><i class="fa-solid fa-warehouse"></i>
                                        Área</th>
                                    <th rowspan="2" scope="col" class="T text-center"><i
                                            class="fa-solid fa-boxes-packing"></i>
                                        Item</th>
                                    <th rowspan="2" scope="col" class="T text-center"><i
                                            class="fa-solid fa-cubes-stacked"></i>
                                        Stock</th>
                                    <th rowspan="2" scope="col" class="text-center"><i
                                            class="fa-solid fa-user-gear"></i>
                                        Acciones</th>
                                </tr>

                                <tr>
                                    <th><select class="form-select form-select-sm"></select></th>
                                    <th><select class="form-select form-select-sm"></select></th>
                                    <th><select class="form-select form-select-sm"></select></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6" rowspan="2">No Hay Información Disponible</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

{{-- Formulario de Creacion --}}
<div class="modal fade" id="ModalInventario" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">REGISTRAR - ITEM</h5>
            </div>
            <div class="modal-body">
                <form id="formInventario" class="row g-3 mt-1">
                    <input type="hidden" name="id_item" id="id_item">

                    <div class="col-7">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146 ;">Información
                                de General</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Item</label>
                        <input type="text" class="form-control rounded-2 shadow-sm" name="nombre" id="nombre" required
                            autocomplete="off" placeholder="Nombre del item..">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="Stock" class="form-label">Stock</label>
                        <input type="number" class="form-control rounded-2 shadow-sm" name="stock" id="stock" required
                            autocomplete="off" placeholder="Cantidad..">
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="medida" class="form-label">Medida</label>
                        <Select class="medida form-control rounded-2 shadow-sm" id="medida" required>
                            <option selected disabled>...</option>
                            <option value="Unidad">Unidad</option>
                            <option value="Caja">Caja (s)</option>
                            <option value="Bolsa">Bolsa (s)</option>
                            <option value="Litro">Litro (s)</option>
                            <option value="Par">Par (es)</option>
                            <option value="Kilo">Kilo (s)</option>
                            <option value="Rollo">Rollo (s)</option>
                        </Select>

                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="nombre" class="form-label">Proveedor</label>
                        <Select class="proveedor form-control rounded-2 shadow-sm" id="proveedores" required>
                            <option selected disabled>...</option>

                        </Select>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="area" class="form-label">Area</label>
                        <Select class="area form-control rounded-2 shadow-sm" id="area" required>
                            <option selected disabled>...</option>
                            <option value="Fritura">Fritura</option>
                            <option value="Alistamiento">Alistamiento</option>
                            <option value="Aseo">Aseo</option>
                        </Select>

                    </div>

                    <div class="col-12 text-end">
                        <button type="submit" class="btn text-white" style="background-color: #5dbb1f">Registrar</button>
                    </div>
                    <div class="col-12 text-center mt-4">
                        <small>Aceptas nuestras Políticas de Privacidad y Términos de Servicio al enviar este
                            formulario.</small>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>

{{-- Formulario de InformaciÓn --}}
<div class="modal fade" id="ModalInfoItem" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">INFORMACIÓN</h5>
            </div>
            <div class="modal-body">
                <div class="row g-3 mt-1 border-1">
                    <div class="row d-flex justify-content-between">
                        <div class="col"></div>
                        <div class="col"></div>
                        <div class="col"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>