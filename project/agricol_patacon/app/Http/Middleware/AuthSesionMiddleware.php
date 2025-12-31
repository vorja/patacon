<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthSesionMiddleware
{
    public function handle(Request $request, Closure $next)
    {

        if (!session()->has('token') || !session()->has('usuario')|| !session()->has('modulo')) {
            return redirect('login'); // Redirige a la ruta de login si no hay sesión activa
        }

        return $next($request);
    }
}
