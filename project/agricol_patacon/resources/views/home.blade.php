<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="jwt" content="{{ session('token') }}">

    <title>Agricol del pacífico</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.22.2/dist/sweetalert2.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css" rel="stylesheet" />
    <link href="https://cdn.datatables.net/2.3.2/css/dataTables.dataTables.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <link href="{{ asset('assets/css/dashboard.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/images/favicon.png') }}" rel="shortcut icon" />
</head>

<style>
    body {
        font-family: 'Inter', sans-serif;
        background: #f4f5f7;
        overflow-x: hidden;
    }

    .menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        padding: 0.6rem 0.8rem;
        border-radius: 0.5rem;
        transition: background 0.2s;
        font-weight: 500;
    }

    .menu-header:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    /* NAVBAR */
    nav.navbar {
        height: 64px;
        border-bottom: 1px solid #e5e7eb;
    }

    .submenuProd {
        list-style: none;
        padding-left: 0.8rem;
        margin: 0.4rem 0;
        display: none;
        flex-direction: column;
        gap: 0.3rem;
    }

    .submenuProd.show {
        display: flex;
    }

    .submenuAdmin {
        list-style: none;
        padding-left: 0.8rem;
        margin: 0.4rem 0;
        display: none;
        flex-direction: column;
        gap: 0.3rem;
    }

    .submenuAdmin.show {
        display: flex;
    }

    .submenuProv {
        list-style: none;
        padding-left: 0.8rem;
        margin: 0.4rem 0;
        display: none;
        flex-direction: column;
        gap: 0.3rem;
    }

    .submenuProv.show {
        display: flex;
    }

    .submenuInsumos {
        list-style: none;
        padding-left: 0.8rem;
        margin: 0.4rem 0;
        display: none;
        flex-direction: column;
        gap: 0.3rem;
    }

    .submenuInsumos.show {
        display: flex;
    }

    .sidebar-item {
        padding: 0.4rem 0.6rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        cursor: pointer;
        transition: background 0.2s;
        text-decoration: none;
        color: white;
        font-size: 0.95rem;
    }

    .sidebar-item:hover {
        background-color: #e97a1f;
    }

    .sidebar-item.active {
        background-color: rgba(255, 255, 255, 0.2);
        font-weight: bold;
    }

    .sidebar-item i {
        width: 20px;
        text-align: center;
    }

    /* SIDEBAR */
    #sidebar {
        width: 250px;
        background: #4B5320;
        color: #fff;
        position: fixed;
        top: 64px;
        left: 0;
        height: calc(100vh - 64px);
        padding-top: 15px;
        transition: 0.3s ease;
        overflow-y: auto;
    }

    #sidebar.sidebar-collapsed {
        width: 70px;
    }

    #sidebar a {
        color: white;
        text-decoration: none;
    }

    #sidebar .submenu {
        display: none;
    }

    #sidebar.sidebar-collapsed .menu-text {
        display: none;
    }

    #sidebar.sidebar-collapsed .submenu {
        display: none !important;
    }

    /* CONTENT */
    #content {
        margin-left: 250px;
        padding: 90px 25px 25px 25px;
        transition: margin-left .3s ease;
    }

    #sidebar.sidebar-collapsed~#content {
        margin-left: 70px;
    }

    .card-custom {
        border-radius: 14px;
        border: none;
        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
    }
</style>

<body>
    <!-- NAVBAR -->
    <nav class="navbar bg-white px-3 fixed-top shadow-sm">
        <div class="d-flex align-items-center gap-3">
            <img src="{{ asset('assets/images/logo-clean.png') }}" style="height:44px">

            <strong class="d-none d-md-block">AGRICOL DEL PACIFICO</strong>

            <button class="btn p-2 rounded-circle" onclick="toggleSidebar()" style="background:#f3f4f6;">
                <i class="fas fa-bars p-1"></i>
            </button>
        </div>

        <div class="d-flex align-items-center gap-4">
            <!-- Notifications -->
            <div class="dropdown">
                <button class="btn btn-light position-relative" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-bell"></i>
                    <span
                        class="notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style="display: none;">
                        0
                    </span>
                </button>

                <div class="dropdown-menu dropdown-menu-end shadow"
                    style="min-width: 350px; max-height: 500px; overflow-y: auto;">
                    <h6 class="dropdown-header fw-bold">Notificaciones</h6>
                    <div class="dropdown-item text-muted">Cargando notificaciones...</div>
                </div>
            </div>

            <!-- Profile -->
            <div class="dropdown">
                <a href="#" data-bs-toggle="dropdown">
                    <img src="{{ asset('assets/images/user.png') }}" class="rounded-circle"
                        style="width:42px; height:42px; object-fit:cover;">
                </a>
                <div class="dropdown-menu dropdown-menu-end shadow">
                    <div class="dropdown-item disabled fw-bold">{{ session('usuario.nombre') }}</div>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item d-flex align-items-center gap-2" id="logout">
                        <i class="fas fa-power-off text-danger"></i> Cerrar sesión
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- SIDEBAR -->
    <aside id="sidebar" >

        <ul class="list-unstyled px-2">

            <li class="menu-group mb-2">
                <button class="menu-toggle w-100 d-flex align-items-center px-3 py-2 border-0 rounded shadow text-white"
                    style="background-color: #4d570f">
                    <i class="fas fa-globe me-2"></i>
                    <span class="menu-text">Administrativo</span>
                </button>
                <ul class="submenuAdmin list-unstyled ps-4 mt-1">

                </ul>
            </li>

            <li class="menu-group mb-2">
                <button
                    class="menu-toggle  w-100 d-flex align-items-center px-3 py-2 border-0 rounded shadow text-white"
                    style="background-color: #505819">
                    <i class="fas fa-cogs me-2"></i>
                    <span class="menu-text">Producción</span>
                </button>
                <ul class="submenuProd list-unstyled ps-4 mt-1">

                </ul>
            </li>
            <li class="menu-group mb-2">
                <button
                    class="menu-toggle  w-100 d-flex align-items-center px-3 py-2 border-0 rounded shadow text-white"
                    style="background-color: #505819">
                    <i class="fas fa-box-archive me-2"></i>
                    <span class="menu-text">Insumos</span>
                </button>
                <ul class="submenuInsumos list-unstyled ps-4 mt-1">

                </ul>
            </li>
            <li class="menu-group mb-2">
                <button class="menu-toggle w-100 d-flex align-items-center px-3 py-2 border-0 rounded shadow text-white"
                    style="background-color: #505819">
                    <i class="fas fa-truck me-2"></i>
                    <span class="menu-text">Proveedores</span>
                </button>
                <ul class="submenuProv list-unstyled ps-4 mt-1">

                </ul>
            </li>

        </ul>

    </aside>

    <div id="content">
        @include('components/content/dashboard')
        <x-footer> </x-footer>
    </div>

    <script src="assets/vendors/js/vendor.bundle.base.js"></script>
    <!-- inject:js -->
    <script src="assets/js/off-canvas.js"></script>

    <script type="module" src="{{ asset('assets/js/navigation-dashboard.js') }}"></script>
    <script type="module" src="{{ asset('assets/js/sidebar-dashboard.js') }}"></script>
    <script src="{{ asset('assets/js/logout.js') }}"></script>

    <script type="module" src="{{ asset('assets/js/modules/Dashboard/home.js') }}"></script>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>

    <script>
        function toggleSidebar() {
            document.getElementById("sidebar").classList.toggle("sidebar-collapsed");
        }

        document.querySelectorAll(".menu-toggle").forEach(btn => {
            btn.addEventListener("click", function () {
                const submenu = this.nextElementSibling;
                submenu.style.display = submenu.style.display === "block" ? "none" : "block";
            });
        });
    </script>

    <script>
        window.usuario = @json(session('usuario'));
        window.modulo = @json(session('modulo'));
    </script>

</body>

</html>