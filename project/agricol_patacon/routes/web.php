<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PdfController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::get('/', function () {
    return view('index');
});

Route::get('/login', action: function () {
    return view('sesion.Autenticación.login');
});

Route::post('/sesion', [AuthController::class, 'guardarSesion']);

Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::middleware(['auth.sesion'])->group(function () {
     /*
    /////////////////////
  //AREA ADMINISTRATIVA
   //////////////////////
    */

    Route::get('/panel', function () {
        return view('home');
    })->middleware('role:Dashboard,Gerente,Productor,RRHH');

    Route::post('/reporte-corte', [PdfController::class, 'cortePDF'])->name('reportes.corte');
    Route::post('/reporte-recepcion', [PdfController::class, 'recepcionPDF'])->name('reportes.recepcion');
    Route::post('/reporte-alistamiento', [PdfController::class, 'alistamientoPDF'])->name('reportes.alistamiento');
    Route::post('/reporte-fritura', [PdfController::class, 'frituraPDF'])->name('reportes.fritura');
    Route::post('/reporte-empaque', [PdfController::class, 'empaquePDF'])->name('reportes.empaque');
    Route::post('/reporte-contenedor', [PdfController::class, 'contenedorPDF'])->name('reportes.contenedor');
    Route::post('/reporte-performance-anual', [PdfController::class, 'performanceAnualPDF'])->name('reportes.performance-anual');
    Route::post('/reporte-indicadores-calidad-excel', [PdfController::class, 'indicadoresCalidadExcel'])->name('reportes.indicadores-calidad-excel');

    Route::prefix('/database')->middleware('role:Dashboard,Gerente,Productor,RRHH')->group(function () {

        Route::get('/ordenes', function () {
            return view('database', ['mod' => 'ordenes']);
        });
        Route::get('/produccion', function () {
            return view('database', ['mod' => 'produccion']);
        });
        Route::get('/cliente', function () {
            return view('database', ['mod' => 'clientes']);
        });
        Route::get('/rol', function () {
            return view('database', ['mod' => 'roles']);
        });
        Route::get('/referencias', function () {
            return view('database', ['mod' => 'referencias']);
        });
        Route::get('/sesiones', function () {
            return view('database', ['mod' => 'sesiones']);
        });
        Route::get('/empleados', function () {
            return view('database', ['mod' => 'empleados']);
        });
        Route::get('/usuarios', function () {
            return view('database', ['mod' => 'usuarios']);
        });
        Route::get('/proveedores', function () {
            return view('database', ['mod' => 'platano']);
        });
        Route::get('/temperatura', function () {
            return view('database', ['mod' => 'temperatura']);
        });
        Route::get('/recepcion', function () {
            return view('database', ['mod' => 'recepcion']);
        });
        Route::get('/alistamiento', function () {
            return view('database', ['mod' => 'alistamiento']);
        });
        Route::get('/cortes', function () {
            return view('database', ['mod' => 'cortes']);
        });
        Route::get('/fritura', function () {
            return view('database', ['mod' => 'fritura']);
        });
        Route::get('/bodega', function () {
            return view('database', ['mod' => 'bodega']);
        });
        Route::get('/materia-recepcionada', function () {
            return view('database', ['mod' => 'materia']);
        });
        Route::get('/empaque', function () {
            return view('database', ['mod' => 'empaque']);
        });
        Route::get('/inventario', function () {
            return view('database', ['mod' => 'inventario']);
        });
        Route::get('/insumos', function () {
            return view('database', ['mod' => 'insumos']);
        });
        Route::get('/proveedoresInsumos', function () {
            return view('database', ['mod' => 'proveedores-insumos']);
        });
    });

    /*
  /////////////////////
  //AREA PRODUCCIÓN.
  ////////////////////
    */

    // Tablet Routes
    Route::prefix('/tablet')->middleware('role:Produccion,Recepcion,Alistamiento,Corte,Cuartos,Empaque,Fritura')->group(function () {

        Route::get('/home', function () {
            return view('components.produccion.home');
        });
        Route::get('/recepcion01', function () {
            return view('components.produccion.recepcionopcional');
        });
        Route::get('/recepcion02', function () {
            return view('components.produccion.recepcion');
        });
        Route::get('/alistamiento03', function () {
            return view('components.produccion.alistamiento');
        });
        Route::get('/registrocorte04', function () {
            return view('components.produccion.registrocorte');
        });
        Route::get('/registrofritura05', function () {
            return view('components.produccion.registrofritura');
        });
        Route::get('/registrotemperatura06', function () {
            return view('components.produccion.registrotemperatura');
        });
        Route::get('/registroempaque07', function () {
            return view('components.produccion.registroempaque');
        });
        Route::get('/verificacionempaque08', function () {
            return view('components.produccion.verificacionempaque');
        });
        Route::get('/verificacioninventario', function () {
            return view('components.produccion.verificacioninventario');
        });
    });
});
