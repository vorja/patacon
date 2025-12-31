<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Barryvdh\DomPDF\Facade\Pdf;

class PdfController extends Controller
{
    public function cortePDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['cortesProveedor']) || !isset($data['detalles']) || !isset($data['registro'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {

            $pdf = Pdf::loadView('reportes.corte', [
                'proveedores' => $data['cortesProveedor'],
                'cortes' => $data['detalles'],
                'registro' => $data['registro'],

            ])->setPaper('A4', 'landscape');;

            return $pdf->download('reporte-corte.pdf');
        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function recepcionPDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['recepciones'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {

            $pdf = Pdf::loadView('reportes.recepcion', [
                'info' => $data['recepciones'],
            ])->setPaper('A4', 'landscape');;

            return $pdf->download('reporte-recepcion.pdf');
        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
    public function alistamientoPDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['registro']) || !isset($data['detalle']) || !isset($data['proveedores'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {
            $pdf = Pdf::loadView('reportes.alistamiento', [
                'registro' => $data['registro'],
                'detalles' => $data['detalle'],
                'proveedores' => $data['proveedores'],
            ])->setPaper('A4', 'landscape');

            return $pdf->download('reporte-alistamiento.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
    public function frituraPDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['canastillas']) || !isset($data['detalles']) || !isset($data['produccion']) || !isset($data['proceso'])  || !isset($data['proveedores'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {

            $pdf = Pdf::loadView('reportes.fritura', [
                'canastillas' => $data['canastillas'],
                'detalles' => $data['detalles'],
                'produccion' => $data['produccion'],
                'proceso' => $data['proceso'],
                'proveedores' => $data['proveedores'],
            ])->setPaper('A4', 'portrait');;

            return $pdf->download('reporte-fritura.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function empaquePDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['empaques']) || !isset($data['proveedores'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {

            $pdf = Pdf::loadView('reportes.empaque', [
                'empaques' => $data['empaques'],
                'proveedores' => $data['proveedores'],
            ])->setPaper('A4', 'landscape');;

            return $pdf->download('reporte-empaque.pdf');
        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}
