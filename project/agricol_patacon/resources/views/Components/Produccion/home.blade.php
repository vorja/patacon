<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="jwt" content="{{ session('token') }}">

    <title>Agricol del Pacífico S.A.S</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" />
</head>

<body class="">
    {{-- Incluiremos el boton de cerrar sesión que quede a la derecha y sea facil de visualizar --}}

    <div class="d-flex justify-content-start align-items-center m-4 border-0">
        <button id="logout" class="btn btn-lg text-white p-3" style="background-color: #f73c3c"> <i class="ft-log-out fs-4"></i></button>
    </div>

    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
        <img src=" ../assets/images/logo-clean.png" alt="logo" class="img-fluid" />
    </div>

</body>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

<script src="/assets/js/logout.js"></script>
<x-tablet-sidebar></x-tablet-sidebar>
