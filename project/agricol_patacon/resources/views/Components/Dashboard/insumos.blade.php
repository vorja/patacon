<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Gestión de Insumos</p>
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
                                            <h6 class="text-uppercase text-muted mb-2">Insumos</h6>
                                            <h2 class="mb-0" id="Registros">0</h2>
                                            <small class="" style="color: #2a93da">
                                                <i class="fa-solid fa-circle-exclamation"></i>
                                            </small>
                                            <span class="text-muted" id="">Total</span>
                                        </div>
                                        <div class="icon icon-shape bg-white border-0 rounded shadow"
                                            style="color: #669e0c">
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
            <div class="card shadow border-0 rounded-4 p-3">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: rgb(108, 120, 13);">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">REGISTROS DE INSUMOS</h3>
                    <button type="button" id="btnAgregar" class="btn btn-light shadow-lg rounded-circle p-2"
                        data-bs-toggle="modal" data-bs-target="#ModalInsumos"><i
                            class="fa-solid fa-file-circle-plus fs-4" style="color: #ec6704"></i></button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-insumos">
                        <table class="table table-hover tabla-personalized w-100 p-3" id="tableInsumos">
                            <thead>
                                <tr>
                                    <th scope="col" class="I text-center"><i class="fa-solid fa-calendar"></i>
                                        Registro</th>
                                    <th scope="col" class="I text-center"><i class="fa-solid fa-truck-front"></i>
                                        Proveedor</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i
                                            class="fa-solid fa-boxes-packing"></i>
                                        Producto</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i
                                            class="fa-solid fa-cubes-stacked"></i>
                                        Cantidad</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i class="fa-solid fa-tags"></i>
                                        Lote</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i
                                            class="fa-regular fa-calendar-days"></i>
                                        Vencimiento</th>

                                    <th rowspan="2" scope="col" class="F text-center"><i
                                            class="fa-solid fa-user-gear"></i>
                                        Acciones</th>
                                </tr>
                                <tr>
                                    <th> <input type="date" class="form-control form-control-sm"></th>
                                    <th><select class="form-select "></select></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="7" rowspan="4">No hay Información Disponible</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="ModalInsumos" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0"
            style="background-color: #fff; color: #1e1e2f; border-radius: 1rem;">
            <div class="modal-header justify-content-center"
                style="background-color: #1e1e2f; border-radius: 1rem 1rem 0 0; color:#fff">
                <h5 class="modal-title fw-bold" id="modalFrituraLabel">REGISTRAR INSUMO</h5>
            </div>
            <div class="modal-body">
                <form id="formInsumos" class="row g-3 mt-1 p-2">
                    <input type="hidden" name="id_insumo" id="id_insumo">
                    <div class="mb-3 col-md-12">
                        <div class="col-2 justify-content-end">
                            <label for="fecha" class="form-label">Fecha Registro.</label>
                            <input type="date" class="form-control 
                            rounded shadow-sm text-center" name="fecha" id="fecha" required>
                        </div>

                    </div>
                    <div class="col-12">
                        <h5> <span class="badge fw-bold rounded p-2 mt-1"
                                style="font-size: medium; background-color: #313146 ;">Información
                                de General</span>
                        </h5>
                    </div>

                    <div class="mb-3 col-md-4">
                        <label for="Proveedor" class="form-label">Proveedor</label>
                        <Select class="proveedores form-control 
                        rounded shadow-sm" id="proveedores" required>
                            <option selected disabled>...</option>

                        </Select>
                    </div>

                    <div class="mb-3 col-md-4">
                        <label for="listItems" class="form-label">Producto</label>
                        <Select class="listItems form-control 
                        rounded shadow-sm" id="listItems" required>
                            <option selected disabled>...</option>

                        </Select>
                    </div>

                    <div class="mb-3 col-md-4">
                        <label for="cantidad" class="form-label">Cantidad</label>
                        <input type="number" class="form-control 
                        rounded shadow-sm" name="cantidad" id="cantidad" required autocomplete="off"
                            placeholder="Cantidad..">
                    </div>

                    <div class="mb-3 col-md-4">
                        <label for="Lote" class="form-label">Lote</label>
                        <input type="text" class="form-control 
                        rounded shadow-sm" name="lote" id="lote" required autocomplete="off"
                            placeholder="Lote del producto..">
                    </div>
                    <div class="mb-3 col-md-4">
                        <label for="vencimiento" class="form-label">Vencimiento</label>
                        <input type="date" class="form-control 
                        rounded shadow-sm" name="fechaVencimiento" id="fechaVencimiento" required
                            autocomplete="off">
                    </div>
                    <div class="mb-3 col-md-4">
                        <label for="area" class="form-label">Area
                        </label>
                        <Select class="area form-control 
                        rounded shadow-sm" id="area" required>
                            <option selected disabled>...</option>
                            <option value="Fritura">Fritura</option>
                            <option value="Alistamiento">Alistamiento</option>
                            <option value="Aseo">Aseo</option>
                        </Select>
                    </div>
                    <div class="col-12">
                        <h5> <span class="badge fw-bold rounded p-2 mt-3"
                                style="font-size: medium; background-color: #313146;">Otros</span>
                        </h5>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="ListaDefectos" class="form-label"> Defectos (Opcional)</label>
                        <input type="text" class="form-control 
                        rounded shadow-sm" name="defectos" id="defectos" autocomplete="off"
                            placeholder="Defectos encontrados..">

                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="Defectos" class="form-label">Defectos</label>
                        <input type="number" class="form-control 
                        rounded shadow-sm" name="cantidadDef" min="0" id="cantidadDef" autocomplete="off"
                            placeholder="Cantidad..">
                    </div>

                    <div class="mb-3 col-md-6">
                        <label for="Calidad" class="form-label">Calidad</label>
                        <!-- Dropdown personalizado -->
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle w-100 border-1" type="button"
                                id="dropdownCalidadbtn" data-bs-toggle="dropdown" aria-expanded="false">
                                Seleccionar Variables Visuales
                            </button>
                            <ul class="dropdown-menu w-100 p-3" aria-labelledby="dropdownCalidadbtn"
                                style="max-height: 300px; overflow-y: auto;">

                                <!-- Color -->
                                <li class="mb-2">
                                    <table class="table table-bordered text-center">
                                        <thead class="table-primary">
                                            <tr>
                                                <th>Variables Visuales</th>
                                                <th colspan="2">Cumple</th>
                                            </tr>
                                            <tr>
                                                <th></th>
                                                <th>Si</th>
                                                <th>No</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            <tr>
                                                <td>Color</td>
                                                <td>
                                                    <input type="radio" id="color" value="Si">
                                                </td>
                                                <td>
                                                    <input type="radio" id="color" value="No">
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>Olor</td>
                                                <td>
                                                    <input type="radio" id="olor" value="Si">
                                                </td>
                                                <td>
                                                    <input type="radio" id="olor" value="No">
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>Estado Físico</td>
                                                <td>
                                                    <input type="radio" id="estado" value="Si">
                                                </td>
                                                <td>
                                                    <input type="radio" id="estado" value="No">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </li>

                            </ul>
                        </div>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="inputElaboracion" class="form-label">Responsable.</label>
                        <input list="listElaboracion" id="inputElaboracion" class="form-control 
                            rounded shadow-sm" autocomplete="off" placeholder="Responsable del registro">
                        <datalist id="listElaboracion"></datalist>
                        <input type="hidden" name="id_elaboracion" id="id_elaboracion"  required>
                    </div>

                    <div class="col-12 text-end">
                        <button type="submit" class="btn text-white" style="background-color: #5dbb1f">Registrar</button>
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