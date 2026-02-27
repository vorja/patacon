<div class="d-flex justify-content-end align-items-center mb-2 mt-1">
    <p class="text-dark mb-0 me-2">Sesiones de Usuarios</p>
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
                            <div class="card shadow-sm border-0 rounded-4">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="text-uppercase text-muted mb-2">Usuarios</h6>
                                            <h2 class="mb-0" id="Usuarios">0</h2>
                                            <small class="" style="color: rgb(74, 226, 28)">
                                                <i class="fas fa-circle"></i>
                                            </small>
                                            <span class="text-muted" id="">Online</span>
                                        </div>
                                        <div class="icon icon-shape text-white border-0 rounded shadow" style="background-color: #1f7fce">
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
            <div class="card shadow rounded-4 border-0 p-3">
                <div class="card-header text-white card-header d-flex justify-content-between align-items-center"
                    style="background-color: #1f7fce">
                    <div class="d-flex align-items-center gap-2">
                        <img src="/assets/images/logo-clean.png" alt="Logo Empresa" style='max-height: 45px;'>
                        <span class="fw-bold text-white">AGRICOL DEL PACIFICO</span>
                    </div>
                    <h3 class="fw-bold text-white m-0">HISTORIAL DE SESIONES DE USUARIO </h3>
                </div>
                <div class="card-body">
                    <div class="table-responsive" id="tabl-dinamica-sesiones">
                        <table class="table table-hover tabla-personalized w-100 p-1" id="tablaSesiones">
                            <thead>
                                <tr>
                                    <th scope="col" class="S text-center"><i class="fa-solid fa-clock-rotate-left"></i>
                                        Actividad</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i class="fa-solid fa-user"></i>
                                        Usuario</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i
                                            class="fa-solid fa-window-restore"></i>
                                        Browser</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i class="fa-solid fa-globe"></i>
                                        Ip</th>
                                    <th rowspan="2" scope="col" class="I text-center"><i
                                            class="fa-solid fa-desktop"></i>
                                        SO</th>

                                    <th rowspan="2" scope="col" class="S text-center"><i
                                            class="fa-solid fa-door-open"></i>
                                        Conexion</th>
                                    <th rowspan="2" scope="col" class="S text-center"><i
                                            class="fa-solid fa-door-closed"></i>
                                        Desconexion</th>

                                    <th colspan="2" scope="col" class="F text-center"><i class="fa-solid fa-key"></i>
                                        Token</th>
                                    <th rowspan="2" scope="col" class="text-center"><i
                                            class="fa-solid fa-screwdriver-wrench"></i>
                                        Accion</th>
                                </tr>
                                <tr>
                                    <th><select class="form-select form-select-sm"></select></th>
                                    <th scope="col" class="T text-center"><i class="fa-solid fa-lightbulb"></i>
                                        Creacion</th>
                                    <th scope="col" class="T text-center"><i class="fa-solid fa-clock me-1"></i>
                                        Expiracion</th>
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