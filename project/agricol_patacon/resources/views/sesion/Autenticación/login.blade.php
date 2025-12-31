<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('assets/images/favicon.png') }}">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.22.2/dist/sweetalert2.min.css" rel="stylesheet">
    {{--
    <link href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-wordpress-admin/wordpress-admin.css" rel="stylesheet">
    --}}
    @foreach (File::files(public_path('assets/css')) as $file)
        <link rel="stylesheet" href="{{ asset('assets/css/login.css') }}">
        <link rel="stylesheet" href="{{ asset('assets/css/bootstrap.min.css') }}">

        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.6.0/css/all.css">
    @endforeach

    <title>Agricol del Pacífico S.A.S / Iniciar sesión</title>
</head>

<body data-api-url="{{ config('app.api_url') }}">
    <div class="container h-100">
        <div class="d-flex justify-content-center h-100">
            <div class="user_card">
                <div class="d-flex justify-content-center">
                    <div class="brand_logo_container">
                        <img src="{{ asset('assets/images/logo-clean.png') }}" class="brand_logo img-fluid" alt="Logo">
                    </div>
                </div>

                <div class="d-flex justify-content-center form_container">

                    <form id="loginForm">
                        <div class="text-center text-white title">AGRICOL DEL PACIFICO S.A.S</div>
                        <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                            <input type="text" name="correo" class="form-control input_user"
                                placeholder="Correo electrónico" id="usuario">
                            <div id="correoFeedBack" class="invalid-feedback">
                                Usuario incorrecto
                            </div>
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><i class="fas fa-key"></i></span>
                            <input type="password" name="password" class="form-control input_pass"
                                placeholder="Contraseña" id="password">
                            <div id="passwordFeedBack" class="invalid-feedback">
                                Contraseña incorrecta
                            </div>
                        </div>

                        <div class="d-flex justify-content-center mt-4 login_container">
                            <button type="submit" class="btn login_btn" id="login">Iniciar sesión</button>
                        </div>
                    </form>
                </div>

                {{-- <div class="mt-4">
                    <div class="d-flex justify-content-center links">
                        <p class="text-light">¡Bienvenidos!</p>
                    </div>

                </div> --}}
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>

    <script type="module" src="/assets/js/login.js"></script>
    {{--
    <script type="module" src="{{ asset('/js/login.js') }}"></script> --}}
</body>

</html>