<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function guardarSesion(Request $request)
    {

        $data = $request->all();

        if (!isset($data['token']) || !isset($data['usuario']) || !isset($data['modulo'])) {
            return response()->json(['error' => 'Datos incompletos'], 400);
        }

        session([
            'token' => $data['token'],
            'usuario' => $data['usuario'],
            'modulo' => $data['modulo']
        ]);


        return response()->json([
            'token' => $data['token'],
            'usuario' => [
                'nombre' => $data['usuario']['nombre'],
                'rol' => $data['usuario']['rol'],
            ],
            'modulo' => $data['modulo']
        ]);
    }

    public function logout()
    {
        session()->flush();

        return redirect('login'); // Asegúrate de que la ruta 'login' exista
    }
}
