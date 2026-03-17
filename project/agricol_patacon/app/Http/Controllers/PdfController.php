<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalDataBar;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalFormatValueObject;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Chart\Axis;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Chart\Layout;

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
            ])->setPaper('A4', 'landscape');

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
            ])->setPaper('A4', 'landscape');

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

        if (!isset($data['canastillas']) || !isset($data['detalles']) || !isset($data['produccion']) || !isset($data['proceso']) || !isset($data['proveedores'])) {
            return response()->json(['error' => 'Datos incompletos', 'data' => $data], 400);
        }

        try {
            $pdf = Pdf::loadView('reportes.fritura', [
                'canastillas' => $data['canastillas'],
                'detalles' => $data['detalles'],
                'produccion' => $data['produccion'],
                'proceso' => $data['proceso'],
                'proveedores' => $data['proveedores'],
            ])->setPaper('A4', 'portrait');

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
            ])->setPaper('A4', 'landscape');

            return $pdf->download('reporte-empaque.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function contenedorPDF(Request $request)
    {
        $data = $request->all();

        if (!isset($data['data']['produccion']) || !isset($data['data']['detalleEmpaque'])) {
            return response()->json([
                'error' => 'Datos incompletos',
                'data' => $data
            ], 400);
        }

        try {
            $apiData = $data['data'];

            $pdf = Pdf::loadView('reportes.contenedor', [
                'produccion' => $apiData['produccion'][0] ?? [],
                'registroAreaEmpaque' => $apiData['registroAreaEmpaque'][0] ?? [],
                'detalleEmpaque' => $apiData['detalleEmpaque'] ?? [],
            ])->setPaper('A4', 'landscape');

            return $pdf->stream('reporte-contenedor.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function performanceAnualPDF(Request $request)
    {
        $data = $request->all();

        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Reporte Rendimiento');

            $corporateGreen = '74820C';
            $darkBlue = '2C3E50';
            $lightGray = 'F2F2F2';

            // Formatos numéricos con guion para valores cero
            // positivo;negativo;cero
            $kgFormat = '#,##0" kg";-#,##0" kg";"-"';
            $percentFormat = '0.00%;-0.00%;"-"';

            /* ============================================
             * ENCABEZADO PRINCIPAL
             * ============================================ */
            $fechaGeneracion = now()->toDateTimeString();
            $anio = $data['metadata']['año'] ?? date('Y');

            $sheet->mergeCells('A1:F1');
            $sheet->mergeCells('A2:F2');
            $sheet->mergeCells('A3:F3');

            $sheet->setCellValue('A1', 'REPORTE DE RENDIMIENTO POR PROVEEDOR');
            $sheet->setCellValue('A2', 'Fecha de generación: ' . $fechaGeneracion);
            $sheet->setCellValue('A3', 'Año: ' . $anio);

            $sheet->getStyle('A1:A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setARGB($corporateGreen);
            $sheet->getStyle('A2:A3')->getFont()->setItalic(true)->getColor()->setARGB('555555');

            /* ============================================
             * TABLA 1: Resumen de Rendimiento General
             * ============================================ */
            // Primero la descripción (en cursiva), luego el título (en negrita con color)
            $descRow1 = 5;
            $startRowTabla1 = $descRow1 + 1;

            $sheet->mergeCells("A{$descRow1}:D{$descRow1}");
            $sheet->setCellValue(
                "A{$descRow1}",
                'Esta tabla resume las cantidades totales procesadas y recibidas, calculando el rendimiento general por cada proveedor.'
            );
            $sheet->getStyle("A{$descRow1}")->getFont()->setItalic(true)->getColor()->setARGB('666666');
            $sheet->getStyle("A{$descRow1}:D{$descRow1}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->mergeCells("A{$startRowTabla1}:D{$startRowTabla1}");
            $sheet->setCellValue("A{$startRowTabla1}", 'Tabla 1: Resumen de Rendimiento General');
            $sheet->getStyle("A{$startRowTabla1}")->getFont()->setBold(true)->setSize(12);
            $sheet->getStyle("A{$startRowTabla1}:D{$startRowTabla1}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Fila de encabezados inmediatamente debajo del título
            $headerRow1 = $startRowTabla1 + 1;
            $sheet->setCellValue("A{$headerRow1}", 'Proveedor');
            $sheet->setCellValue("B{$headerRow1}", 'Corte');
            $sheet->setCellValue("C{$headerRow1}", 'Recepción');
            $sheet->setCellValue("D{$headerRow1}", 'Rendimiento');

            $currentRow = $headerRow1 + 1;
            $rendimientoProveedores = $data['rendimientoProveedores'] ?? [];
            $totalCorte = 0;
            $totalRecepcion = 0;
            $totalRendimiento = 0;
            $contador = 0;

            foreach ($rendimientoProveedores as $proveedor) {
                $corte = $proveedor['totalMateriaProcesada'] ?? 0;
                $recepcion = $proveedor['totalMateriaRecibida'] ?? 0;
                $rendimiento = $proveedor['rendimiento'] ?? 0;

                $sheet->setCellValue("A{$currentRow}", $proveedor['proveedor'] ?? '');
                $sheet->setCellValue("B{$currentRow}", $corte);
                $sheet->setCellValue("C{$currentRow}", $recepcion);
                // Valor crudo como fracción 0-1 para el formato de porcentaje
                $sheet->setCellValue("D{$currentRow}", $rendimiento / 100);

                // DataBar dinámica por fila, con color en gradiente rojo-amarillo-verde según el porcentaje
                $percentValue = max(0, min(100, $rendimiento)); // 0-100
                $ratio = $percentValue / 100; // 0-1
                $red = (int) round(255 * (1 - $ratio));
                $green = (int) round(255 * $ratio);
                $blue = 0;
                $hexColor = sprintf('%02X%02X%02X', $red, $green, $blue);

                $dynamicConditional = new Conditional();
                $dynamicConditional->setConditionType(Conditional::CONDITION_DATABAR);

                $dynamicDataBar = new ConditionalDataBar();
                $dynamicDataBar->setShowValue(true);
                // Prefijo 'FF' para el canal alfa (ARGB)
                $dynamicDataBar->setColor('FF' . $hexColor);
                // Desactivar el degradado para que la barra sea de un color sólido (si la versión lo soporta)
                if (method_exists($dynamicDataBar, 'setGradient')) {
                    $dynamicDataBar->setGradient(false);
                } elseif (method_exists($dynamicDataBar, 'setSolid')) {
                    $dynamicDataBar->setSolid(true);
                }

                // Límites absolutos para evitar errores del Writer: 0 a 1 (porque el valor es 0-1)
                $minObject = new ConditionalFormatValueObject('num', 0);
                $maxObject = new ConditionalFormatValueObject('num', 1);
                $dynamicDataBar->setMinimumConditionalFormatValueObject($minObject);
                $dynamicDataBar->setMaximumConditionalFormatValueObject($maxObject);

                $dynamicConditional->setDataBar($dynamicDataBar);

                // Regla exclusiva para la celda D{currentRow}
                $sheet->getStyle("D{$currentRow}")->setConditionalStyles([$dynamicConditional]);

                $totalCorte += $corte;
                $totalRecepcion += $recepcion;
                $totalRendimiento += $rendimiento;
                $contador++;
                $currentRow++;
            }

            if ($contador > 0) {
                $sheet->setCellValue("A{$currentRow}", 'TOTALES');
                $sheet->setCellValue("B{$currentRow}", $totalCorte);
                $sheet->setCellValue("C{$currentRow}", $totalRecepcion);
                $sheet->setCellValue("D{$currentRow}", ($totalRendimiento / $contador) / 100);
                $sheet->getStyle("A{$currentRow}:D{$currentRow}")->getFont()->setBold(true);
                $sheet->getStyle("A{$currentRow}:D{$currentRow}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($lightGray);
            }
            $endRowTabla1 = $currentRow;

            /* ============================================
             * TABLA 2: Detalle de Procesamiento por Tipo
             * (vista tipo tabla dinámica / pivote por proveedor y tipo)
             * ============================================ */
            $dataProveedor = $data['dataProveedor'] ?? [];

            // Pre-agrupación por proveedor y tipo, y lista única de tipos
            $proveedoresPivot = [];
            $tiposUnicos = [];

            foreach ($dataProveedor as $detalle) {
                $provNombre = $detalle['proveedor'] ?? '';
                $tipo = $detalle['tipo'] ?? '';
                $materia = $detalle['materia'] ?? 0;

                if ($provNombre === '' || $tipo === '') {
                    continue;
                }

                if (!isset($proveedoresPivot[$provNombre])) {
                    $proveedoresPivot[$provNombre] = [
                        'totalMateriaRecibida' => 0,
                        'totalRechazo' => 0,
                        'tipos' => [], // tipo => ['procesadoKg' => float]
                    ];
                }

                if (!isset($proveedoresPivot[$provNombre]['tipos'][$tipo])) {
                    $proveedoresPivot[$provNombre]['tipos'][$tipo] = [
                        'procesadoKg' => 0,
                    ];
                }

                $proveedoresPivot[$provNombre]['tipos'][$tipo]['procesadoKg'] += $materia;
                $tiposUnicos[$tipo] = true;
            }

            // Enlazar totales de recepción y rechazo desde rendimientoProveedores
            foreach ($rendimientoProveedores as $prov) {
                $nombre = $prov['proveedor'] ?? '';
                if ($nombre === '' || !isset($proveedoresPivot[$nombre])) {
                    continue;
                }
                $proveedoresPivot[$nombre]['totalMateriaRecibida'] = $prov['totalMateriaRecibida'] ?? 0;
                $proveedoresPivot[$nombre]['totalRechazo'] = $prov['totalRechazo'] ?? 0;
            }

            // Lista única de tipos ordenada alfabéticamente
            $tiposUnicos = array_keys($tiposUnicos);
            sort($tiposUnicos);

            // Cálculo del límite dinámico de columnas para la Tabla 2
            $lastColIndexTabla2 = 3 + (count($tiposUnicos) * 2);
            $lastColTabla2 = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColIndexTabla2);

            // Si no hay datos, se deja solo el título y se continúa
            $descRow2 = $endRowTabla1 + 3;
            $startRowTabla2 = $descRow2 + 1;

            $sheet->mergeCells("A{$descRow2}:{$lastColTabla2}{$descRow2}");
            $sheet->setCellValue(
                "A{$descRow2}",
                'Detalle específico por tipo de plátano, porcentajes de rendimiento segmentados y total de rechazo registrado.'
            );
            $sheet->getStyle("A{$descRow2}")->getFont()->setItalic(true)->getColor()->setARGB('666666');
            $sheet->getStyle("A{$descRow2}:{$lastColTabla2}{$descRow2}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->mergeCells("A{$startRowTabla2}:{$lastColTabla2}{$startRowTabla2}");
            $sheet->setCellValue("A{$startRowTabla2}", 'Tabla 2: Detalle de Procesamiento por Tipo de Plátano');
            $sheet->getStyle("A{$startRowTabla2}")->getFont()->setBold(true)->setSize(12);
            $sheet->getStyle("A{$startRowTabla2}:{$lastColTabla2}{$startRowTabla2}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Encabezados tipo pivote
            $headerTopRow2 = $startRowTabla2 + 1; // fila superior de encabezado
            $headerRow2 = $headerTopRow2 + 1;     // fila de sub-encabezados

            // Columnas base estáticas
            $sheet->mergeCells("A{$headerTopRow2}:A{$headerRow2}");
            $sheet->setCellValue("A{$headerTopRow2}", 'Proveedor');

            $sheet->mergeCells("B{$headerTopRow2}:B{$headerRow2}");
            $sheet->setCellValue("B{$headerTopRow2}", 'Total Recibido (kg)');

            $sheet->mergeCells("C{$headerTopRow2}:C{$headerRow2}");
            $sheet->setCellValue("C{$headerTopRow2}", 'Rechazo Total (kg)');

            // Fondo y centrado para encabezados base (mismo color que el título de la tabla 2)
            $sheet->getStyle("A{$headerTopRow2}:C{$headerRow2}")
                ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($darkBlue);
            $sheet->getStyle("A{$headerTopRow2}:C{$headerRow2}")
                ->getFont()->getColor()->setARGB('FFFFFFFF');
            $sheet->getStyle("A{$headerTopRow2}:C{$headerRow2}")
                ->getAlignment()
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Paleta de colores para tipos de plátano (ARGB sin '#')
            $palette = [
                'FF27AE60', // verde
                'FFF1C40F', // amarillo
                'FFE67E22', // naranja
                'FF8E44AD', // púrpura
                'FF2980B9', // azul
            ];
            $paletteCount = count($palette);
            $paletteIndex = 0;

            // Encabezados dinámicos por tipo de plátano
            $baseStaticCols = 3; // A,B,C
            $startTipoColIndex = $baseStaticCols + 1; // 4 => columna D
            $currentColIndex = $startTipoColIndex;

            foreach ($tiposUnicos as $tipo) {
                $colProcIndex = $currentColIndex;
                $colPercIndex = $currentColIndex + 1;

                $colProc = Coordinate::stringFromColumnIndex($colProcIndex);
                $colPerc = Coordinate::stringFromColumnIndex($colPercIndex);

                // Encabezado combinado con el nombre del tipo
                $sheet->mergeCells("{$colProc}{$headerTopRow2}:{$colPerc}{$headerTopRow2}");
                $sheet->setCellValue("{$colProc}{$headerTopRow2}", 'Tipo ' . $tipo);

                // Sub-encabezados
                $sheet->setCellValue("{$colProc}{$headerRow2}", 'Procesado (kg)');
                $sheet->setCellValue("{$colPerc}{$headerRow2}", '% Rendimiento');

                // Color de fondo por tipo + fuente blanca
                $headerColor = $palette[$paletteIndex % $paletteCount];
                $paletteIndex++;
                $sheet->getStyle("{$colProc}{$headerTopRow2}:{$colPerc}{$headerRow2}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($headerColor);
                $sheet->getStyle("{$colProc}{$headerTopRow2}:{$colPerc}{$headerRow2}")
                    ->getFont()->getColor()->setARGB('FFFFFFFF');

                // Centrar encabezado de tipo (fila superior combinada)
                $sheet->getStyle("{$colProc}{$headerTopRow2}:{$colPerc}{$headerTopRow2}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Centrar también los sub-encabezados de cada tipo
                $sheet->getStyle("{$colProc}{$headerRow2}:{$colPerc}{$headerRow2}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $currentColIndex += 2;
            }

            // Bucle de datos pivote por proveedor
            $currentRow = $headerRow2 + 1;
            $totalRecibidoTabla2 = 0;
            $totalRechazoTabla2 = 0;
            $totalesPorTipo = [];
            foreach ($tiposUnicos as $tipo) {
                $totalesPorTipo[$tipo] = 0;
            }

            foreach ($proveedoresPivot as $provNombre => $infoProv) {
                $totalRecibidoProv = $infoProv['totalMateriaRecibida'] ?? 0;
                $rechazoProv = $infoProv['totalRechazo'] ?? 0;

                $sheet->setCellValue("A{$currentRow}", $provNombre);
                $sheet->setCellValue("B{$currentRow}", $totalRecibidoProv);
                $sheet->setCellValue("C{$currentRow}", $rechazoProv);

                $totalRecibidoTabla2 += $totalRecibidoProv;
                $totalRechazoTabla2 += $rechazoProv;

                $currentColIndex = $startTipoColIndex;
                foreach ($tiposUnicos as $tipo) {
                    $colProcIndex = $currentColIndex;
                    $colPercIndex = $currentColIndex + 1;

                    $colProc = Coordinate::stringFromColumnIndex($colProcIndex);
                    $colPerc = Coordinate::stringFromColumnIndex($colPercIndex);

                    $procesadoKg = $infoProv['tipos'][$tipo]['procesadoKg'] ?? 0;
                    // Procesado (kg) siempre se escribe, incluso si es 0
                    $sheet->setCellValue("{$colProc}{$currentRow}", $procesadoKg);

                    // % Rendimiento como fracción 0-1, siempre escribiendo algo (0 si no hay datos)
                    $rendFrac = ($totalRecibidoProv > 0)
                        ? ($procesadoKg / $totalRecibidoProv)
                        : 0;
                    $sheet->setCellValue("{$colPerc}{$currentRow}", $rendFrac);

                    // Acumular totales por tipo (procesado)
                    $totalesPorTipo[$tipo] += $procesadoKg;

                    if ($rendFrac > 0) {
                        // DataBar por celda de rendimiento, usando el color del tipo
                        $tipoIndex = array_search($tipo, $tiposUnicos, true);
                        if ($tipoIndex === false) {
                            $tipoIndex = 0;
                        }
                        $headerColor = $palette[$tipoIndex % $paletteCount] ?? 'FF27AE60';

                        $condPerc = new Conditional();
                        $condPerc->setConditionType(Conditional::CONDITION_DATABAR);

                        $dataBarTabla2 = new ConditionalDataBar();
                        $dataBarTabla2->setShowValue(true);
                        $dataBarTabla2->setColor($headerColor);
                        if (method_exists($dataBarTabla2, 'setGradient')) {
                            $dataBarTabla2->setGradient(false);
                        } elseif (method_exists($dataBarTabla2, 'setSolid')) {
                            $dataBarTabla2->setSolid(true);
                        }

                        $minObj2 = new ConditionalFormatValueObject('num', 0);
                        $maxObj2 = new ConditionalFormatValueObject('num', 1);
                        $dataBarTabla2->setMinimumConditionalFormatValueObject($minObj2);
                        $dataBarTabla2->setMaximumConditionalFormatValueObject($maxObj2);

                        $condPerc->setDataBar($dataBarTabla2);
                        $sheet->getStyle("{$colPerc}{$currentRow}")->setConditionalStyles([$condPerc]);
                    }

                    $currentColIndex += 2;
                }

                $currentRow++;
            }

            // Fila de totales de Tabla 2 (si hay datos)
            if (!empty($proveedoresPivot)) {
                $sheet->setCellValue("A{$currentRow}", 'TOTALES');
                $sheet->setCellValue("B{$currentRow}", $totalRecibidoTabla2);
                $sheet->setCellValue("C{$currentRow}", $totalRechazoTabla2);

                // Totales por tipo: solo suma de procesado (sin % rendimiento)
                $currentColIndex = $startTipoColIndex;
                foreach ($tiposUnicos as $tipo) {
                    $colProcIndex = $currentColIndex;
                    $colPercIndex = $currentColIndex + 1;

                    $colProc = Coordinate::stringFromColumnIndex($colProcIndex);
                    $colPerc = Coordinate::stringFromColumnIndex($colPercIndex);

                    $totalProcesadoTipo = $totalesPorTipo[$tipo] ?? 0;
                    $sheet->setCellValue("{$colProc}{$currentRow}", $totalProcesadoTipo);
                    // Campo de % rendimiento total por tipo se deja vacío
                    $sheet->setCellValue("{$colPerc}{$currentRow}", null);

                    $currentColIndex += 2;
                }

                $sheet->getStyle("A{$currentRow}:{$lastColTabla2}{$currentRow}")->getFont()->setBold(true);
                $sheet->getStyle("A{$currentRow}:{$lastColTabla2}{$currentRow}")
                    ->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($lightGray);
            }
            $endRowTabla2 = $currentRow;

            /* ============================================
             * DATOS AUXILIARES VISIBLES PARA GRÁFICOS (Columnas AA-AL)
             * ============================================ */
            $detalleProducciones = $data['detalleProducciones'] ?? [];

            // Extraer fecha (ddmmyy) y ordenar cronológicamente
            usort($detalleProducciones, function ($a, $b) {
                // Eliminar cualquier letra del lote para quedarnos solo con los números (ej: 'C030326' -> '030326')
                $numA = preg_replace('/[^0-9]/', '', $a['lote'] ?? '');
                $numB = preg_replace('/[^0-9]/', '', $b['lote'] ?? '');
                
                $dateA = \DateTime::createFromFormat('dmy', $numA);
                $dateB = \DateTime::createFromFormat('dmy', $numB);
                
                // Si ambos lotes tienen una fecha válida, se ordenan mediante sus timestamps
                if ($dateA && $dateB) {
                    return $dateA <=> $dateB; // Orden ascendente: el más antiguo primero (izquierda del gráfico)
                    // Si realmente se desea el más antiguo a la derecha, reemplazar la línea anterior por: return $dateB <=> $dateA;
                }
                
                // Fallback por si hay un lote sin formato de fecha válido
                return strcmp($a['lote'] ?? '', $b['lote'] ?? '');
            });

            $startRowAux = 5;

            $sheet->setCellValue("AA{$startRowAux}", 'Contenedor');
            $sheet->setCellValue("AB{$startRowAux}", 'Materia Prima');
            $sheet->setCellValue("AC{$startRowAux}", 'Rechazo Total');
            $sheet->setCellValue("AD{$startRowAux}", '% Pérdida MP');
            $sheet->setCellValue("AE{$startRowAux}", '% Pulpa/Plátano');
            $sheet->setCellValue("AF{$startRowAux}", '% Frito/Pelado');
            $sheet->setCellValue("AG{$startRowAux}", '% Empaque/Frito');
            $sheet->setCellValue("AH{$startRowAux}", '% Total Empacado');
            $sheet->setCellValue("AI{$startRowAux}", '% Merma Empaque');
            $sheet->setCellValue("AJ{$startRowAux}", '% Merma Fritura');
            // Tercera categoría representa la merma de Puntas (resto del total que no es Empaque ni Fritura)
            $sheet->setCellValue("AK{$startRowAux}", '% Puntas');
            $sheet->setCellValue("AL{$startRowAux}", 'Patacón Perdido');
            // Totales globales para promedios de rendimiento por área
            $sumMp = 0;
            $sumPulpa = 0;
            $sumPelado = 0;
            $sumFrito = 0;
            $rowAux = $startRowAux + 1;
            foreach ($detalleProducciones as $produccion) {
                $totales = $produccion['totales'] ?? [];
                $rechazoDetalle = $produccion['rechazo'] ?? [];
                $rendimientosProd = $produccion['rendimiento'] ?? [];
                $mp = $totales['materiaPrima'] ?? 0;
                $rt = $rechazoDetalle['total'] ?? 0;

                $sheet->setCellValue("AA{$rowAux}", $produccion['lote'] ?? 'Sin lote');
                $sheet->setCellValue("AB{$rowAux}", $mp);
                $sheet->setCellValue("AC{$rowAux}", $rt);
                // % pérdida MP calculado a partir de totales
                $sheet->setCellValue("AD{$rowAux}", $mp > 0 ? $rt / $mp : 0);
                // Rendimientos por operación, usando los cálculos oficiales de la API (detalleProducciones.rendimiento)
                $sheet->setCellValue("AE{$rowAux}", ($rendimientosProd['materia'] ?? 0) / 100);
                $sheet->setCellValue("AF{$rowAux}", ($rendimientosProd['fritura'] ?? 0) / 100);
                $sheet->setCellValue("AG{$rowAux}", ($rendimientosProd['empaque'] ?? 0) / 100);
                $sheet->setCellValue("AH{$rowAux}", ($rendimientosProd['total'] ?? 0) / 100);
                // Merma por área: desglose Empaque, Fritura, Puntas (resto del total)
                $mermaEmpaque = $rechazoDetalle['empaque'] ?? 0;
                $mermaFritura = $rechazoDetalle['fritura'] ?? 0;
                $mermaTotal = $rechazoDetalle['total'] ?? 0;
                // Puntas = total - (empaque + fritura), acotado a mínimo 0 para evitar negativos por redondeos
                $mermaPuntas = $mermaTotal - $mermaEmpaque - $mermaFritura;
                if ($mermaPuntas < 0) {
                    $mermaPuntas = 0;
                }

                // Usamos 0 cuando no hay datos; el formato de celda ocultará los ceros en la gráfica
                $sheet->setCellValue(
                    "AI{$rowAux}",
                    ($mermaEmpaque > 0 && $mp > 0)
                        ? $mermaEmpaque / $mp
                        : 0
                );
                $sheet->setCellValue(
                    "AJ{$rowAux}",
                    ($mermaFritura > 0 && $mp > 0)
                        ? $mermaFritura / $mp
                        : 0
                );
                $sheet->setCellValue(
                    "AK{$rowAux}",
                    ($mermaPuntas > 0 && $mp > 0)
                        ? $mermaPuntas / $mp
                        : 0
                );
                $sheet->setCellValue(
                    "AL{$rowAux}",
                    $rechazoDetalle['pataconPerdido'] ?? (
                        ($rechazoDetalle['fritura'] ?? 0) + ($rechazoDetalle['empaque'] ?? 0)
                    )
                );

                $rowAux++;
            }
            $endRowAux = max($startRowAux + 1, $rowAux - 1);

            /* ============================================
             * ESTILOS Y FORMATOS
             * ============================================ */
            $headerStyle1 = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $corporateGreen]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ];
            $headerStyle2 = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $darkBlue]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ];

            // Título + encabezados comparten estilo de cabecera (integración visual)
            $sheet->getStyle("A{$startRowTabla1}:D{$startRowTabla1}")->applyFromArray($headerStyle1);
            $sheet->getStyle("A{$headerRow1}:D{$headerRow1}")->applyFromArray($headerStyle1);

            // Centrar todos los campos visibles de la Tabla 1 (encabezados y datos)
            $sheet->getStyle("A{$headerRow1}:D{$endRowTabla1}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Estilo del título de la Tabla 2
            $sheet->getStyle("A{$startRowTabla2}:{$lastColTabla2}{$startRowTabla2}")->applyFromArray($headerStyle2);
            // Encabezados base (Proveedor / Total Recibido / Rechazo) en azul oscuro;
            // se limita a A-C para no sobrescribir los colores de cada tipo.
            $sheet->getStyle("A{$headerTopRow2}:C{$headerRow2}")->applyFromArray($headerStyle2);

            // Bordes de las tablas
            $sheet->getStyle("A{$headerRow1}:D{$endRowTabla1}")
                ->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $sheet->getStyle("A{$headerTopRow2}:{$lastColTabla2}{$endRowTabla2}")
                ->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            // Ajuste de columnas visibles principales
            foreach (range('A', $lastColTabla2) as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
            foreach ([
                'AA', 'AB', 'AC', 'AD', 'AE', 'AF',
                'AG', 'AH', 'AI', 'AJ', 'AK', 'AL',
            ] as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Aumentar altura de filas de encabezados y datos para mejor legibilidad
            $sheet->getRowDimension($startRowTabla1)->setRowHeight(24);
            $sheet->getRowDimension($headerRow1)->setRowHeight(22);
            $sheet->getRowDimension($startRowTabla2)->setRowHeight(24);
            $sheet->getRowDimension($headerTopRow2)->setRowHeight(22);
            $sheet->getRowDimension($headerRow2)->setRowHeight(22);
            for ($r = $headerRow2 + 1; $r <= $endRowTabla2; $r++) {
                $sheet->getRowDimension($r)->setRowHeight(20);
            }

            // Formatos visibles de tablas
            $sheet->getStyle("B" . ($headerRow1 + 1) . ":C{$endRowTabla1}")
                ->getNumberFormat()->setFormatCode($kgFormat);
            $sheet->getStyle("D" . ($headerRow1 + 1) . ":D{$endRowTabla1}")
                ->getNumberFormat()->setFormatCode($percentFormat);
            $sheet->getStyle("D" . ($headerRow1 + 1) . ":D{$endRowTabla1}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Formato kg / % y centrado para Tabla 2
            $sheet->getStyle("B" . ($headerRow2 + 1) . ":B{$endRowTabla2}")
                ->getNumberFormat()->setFormatCode($kgFormat);
            $sheet->getStyle("C" . ($headerRow2 + 1) . ":C{$endRowTabla2}")
                ->getNumberFormat()->setFormatCode($kgFormat);
            $sheet->getStyle("B" . ($headerRow2 + 1) . ":C{$endRowTabla2}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Columnas dinámicas de "Procesado (kg)" y "% Rendimiento" comienzan en la columna 4 (D) y son cada 2 columnas
            for ($colIndex = 4; $colIndex <= $lastColIndexTabla2; $colIndex += 2) {
                $colProc = Coordinate::stringFromColumnIndex($colIndex);
                $colPerc = Coordinate::stringFromColumnIndex($colIndex + 1);

                // Procesado (kg)
                $sheet->getStyle("{$colProc}" . ($headerRow2 + 1) . ":{$colProc}{$endRowTabla2}")
                    ->getNumberFormat()->setFormatCode($kgFormat);
                // % Rendimiento (0-1 mostrado como 0.00%)
                $sheet->getStyle("{$colPerc}" . ($headerRow2 + 1) . ":{$colPerc}{$endRowTabla2}")
                    ->getNumberFormat()->setFormatCode($percentFormat);

                // Centrar ambos campos en toda la tabla 2
                $sheet->getStyle("{$colProc}" . ($headerRow2 + 1) . ":{$colPerc}{$endRowTabla2}")
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }

            // Formatos de datos auxiliares (columnas AA-AL)
            $sheet->getStyle("AB" . ($startRowAux + 1) . ":AC{$endRowAux}")
                ->getNumberFormat()->setFormatCode($kgFormat);
            $sheet->getStyle("AL" . ($startRowAux + 1) . ":AL{$endRowAux}")
                ->getNumberFormat()->setFormatCode($kgFormat);
            // Porcentajes generales (pérdida MP + rendimientos) y merma por área,
            // usando el mismo formato que muestra "-" cuando el valor es 0
            $sheet->getStyle("AD" . ($startRowAux + 1) . ":AH{$endRowAux}")
                ->getNumberFormat()->setFormatCode($percentFormat);
            $sheet->getStyle("AI" . ($startRowAux + 1) . ":AK{$endRowAux}")
                ->getNumberFormat()->setFormatCode($percentFormat);

            /* ============================================
             * GRÁFICAS
             * ============================================ */
            $pointCount = max(1, $endRowAux - $startRowAux);
            $sheetName = "'Reporte Rendimiento'!";

            // Categorías: contenedores (lotes) en AA
            $categoryRange = $sheetName . '$AA$' . ($startRowAux + 1) . ':$AA$' . $endRowAux;

            $layoutDataLabels = new Layout();
            $layoutDataLabels->setShowVal(true);

            $categories = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    $categoryRange,
                    null,
                    $pointCount
                ),
            ];

            // Dejamos un poco más de espacio antes de las gráficas
            $chartStartRow = $endRowTabla2 + 6;

            // Gráfico 1: Barras horizontales - Plátanos verdes por contenedor
            $sheet->mergeCells("A{$chartStartRow}:F{$chartStartRow}");
            $sheet->setCellValue("A{$chartStartRow}", 'Gráfico 1: Plátanos verdes por contenedor');
            $sheet->getStyle("A{$chartStartRow}")
                ->getFont()->setBold(true)->setSize(14)->getColor()->setARGB($corporateGreen);
            $sheet->getStyle("A{$chartStartRow}:F{$chartStartRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $values1 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AB$' . ($startRowAux + 1) . ':$AB$' . $endRowAux,
                    null,
                    $pointCount
                ),
            ];

            $series1 = new DataSeries(
                DataSeries::TYPE_BARCHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($values1) - 1),
                [],
                $categories,
                $values1
            );
            $series1->setPlotDirection(DataSeries::DIRECTION_BAR);

            $plot1 = new PlotArea($layoutDataLabels, [$series1]);
            $chart1 = new Chart(
                'chart1',
                new Title('Plátanos verdes por contenedor'),
                null,
                $plot1
            );
            $chart1->setTopLeftPosition('A' . ($chartStartRow + 1));
            $chart1->setBottomRightPosition('F' . ($chartStartRow + 15));
            $sheet->addChart($chart1);

            // dejar más espacio antes del siguiente gráfico
            $chartStartRow += 20;

            // Gráfico 2: Columnas verticales - Porcentaje de Rechazo por Contenedor
            $sheet->mergeCells("A{$chartStartRow}:F{$chartStartRow}");
            $sheet->setCellValue("A{$chartStartRow}", 'Gráfico 2: Porcentaje de Rechazo por Contenedor');
            $sheet->getStyle("A{$chartStartRow}")
                ->getFont()->setBold(true)->setSize(14)->getColor()->setARGB($darkBlue);
            $sheet->getStyle("A{$chartStartRow}:F{$chartStartRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $values2 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AD$' . ($startRowAux + 1) . ':$AD$' . $endRowAux,
                    null,
                    $pointCount
                ),
            ];
            // Color rojo para representar rechazo
            $values2[0]->setFillColor('E74C3C');

            $series2 = new DataSeries(
                DataSeries::TYPE_BARCHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($values2) - 1),
                [],
                $categories,
                $values2
            );
            $series2->setPlotDirection(DataSeries::DIRECTION_COL);

            $plot2 = new PlotArea($layoutDataLabels, [$series2]);
            $chart2 = new Chart(
                'chart2',
                new Title('Porcentaje de Rechazo por Contenedor'),
                new Legend(Legend::POSITION_BOTTOM, null, false),
                $plot2
            );
            // Más alta y con más espacio vertical
            $chart2->setTopLeftPosition('A' . ($chartStartRow + 1));
            $chart2->setBottomRightPosition('F' . ($chartStartRow + 20));
            $sheet->addChart($chart2);

            // separar más el gráfico 3 del 2
            $chartStartRow += 23;

            // Gráfico 3: Líneas con marcadores - Rendimiento de cada operación
            $sheet->mergeCells("A{$chartStartRow}:F{$chartStartRow}");
            $sheet->setCellValue("A{$chartStartRow}", 'Gráfico 3: Rendimiento de cada operación');
            $sheet->getStyle("A{$chartStartRow}")
                ->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('D35400');
            $sheet->getStyle("A{$chartStartRow}:F{$chartStartRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Gráfico 3: usa los rendimientos por operación de cada producción (AE-AH)
            $values3 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AE$' . ($startRowAux + 1) . ':$AE$' . $endRowAux,
                    null,
                    $pointCount
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AF$' . ($startRowAux + 1) . ':$AF$' . $endRowAux,
                    null,
                    $pointCount
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AG$' . ($startRowAux + 1) . ':$AG$' . $endRowAux,
                    null,
                    $pointCount
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AH$' . ($startRowAux + 1) . ':$AH$' . $endRowAux,
                    null,
                    $pointCount
                ),
            ];
            foreach ($values3 as $v) {
                $v->setPointMarker('circle');
            }

            $labels3 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    null,
                    null,
                    1,
                    ['Promedio RENDIMIENTO PULPA/PLÁTANO']
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    null,
                    null,
                    1,
                    ['Promedio RENDIMIENTO FRITO/PELADO']
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    null,
                    null,
                    1,
                    ['Promedio RENDIMIENTO DE EMPAQUE/FRITO']
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_STRING,
                    null,
                    null,
                    1,
                    ['Promedio TOTAL EMPACADO/PLÁTANO']
                ),
            ];

            $categoriesFor3 = array_fill(0, count($values3), $categories[0]);

            $series3 = new DataSeries(
                DataSeries::TYPE_LINECHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($values3) - 1),
                $labels3,
                $categoriesFor3,
                $values3
            );

            // Para esta gráfica queremos las etiquetas claramente por encima de cada punto
            $layoutLines = new Layout();
            $layoutLines->setShowVal(true);
            $layoutLines->setDLblPos('t');

            $plot3 = new PlotArea($layoutLines, [$series3]);
            $chart3 = new Chart(
                'chart3',
                new Title('Rendimiento de cada operación'),
                new Legend(Legend::POSITION_RIGHT, null, false),
                $plot3
            );
            // Gráfico 3 un poco más abajo y alto
            $chart3->setTopLeftPosition('A' . ($chartStartRow + 2));
            $chart3->setBottomRightPosition('F' . ($chartStartRow + 18));
            $sheet->addChart($chart3);

            // separar más el gráfico 4 del 3
            $chartStartRow += 23;

            // Gráfico 4: Columnas apiladas - Merma por área
            $sheet->mergeCells("A{$chartStartRow}:F{$chartStartRow}");
            $sheet->setCellValue("A{$chartStartRow}", 'Gráfico 4: Merma por área');
            $sheet->getStyle("A{$chartStartRow}")
                ->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('2980B9');
            $sheet->getStyle("A{$chartStartRow}:F{$chartStartRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $values4 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AI$' . ($startRowAux + 1) . ':$AI$' . $endRowAux,
                    null,
                    $pointCount
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AJ$' . ($startRowAux + 1) . ':$AJ$' . $endRowAux,
                    null,
                    $pointCount
                ),
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AK$' . ($startRowAux + 1) . ':$AK$' . $endRowAux,
                    null,
                    $pointCount
                ),
            ];

            $labels4 = [
                new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, $sheetName . '$AI$' . $startRowAux, null, 1),
                new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, $sheetName . '$AJ$' . $startRowAux, null, 1),
                new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, $sheetName . '$AK$' . $startRowAux, null, 1),
            ];

            $categoriesFor4 = array_fill(0, count($values4), $categories[0]);

            $series4 = new DataSeries(
                DataSeries::TYPE_BARCHART,
                DataSeries::GROUPING_STACKED,
                range(0, count($values4) - 1),
                $labels4,
                $categoriesFor4,
                $values4
            );
            $series4->setPlotDirection(DataSeries::DIRECTION_COL);

            $plot4 = new PlotArea($layoutDataLabels, [$series4]);
            // Barras apiladas más anchas (menor gap entre columnas)
            $plot4->setGapWidth(50);
            $chart4 = new Chart(
                'chart4',
                new Title('Merma por área'),
                new Legend(Legend::POSITION_BOTTOM, null, false),
                $plot4
            );
            // Más alta para mejorar lectura de porcentajes apilados
            // Gráfico 4 un poco más abajo y alto
            $chart4->setTopLeftPosition('A' . ($chartStartRow + 2));
            $chart4->setBottomRightPosition('F' . ($chartStartRow + 22));
            $sheet->addChart($chart4);

            // más espacio entre el gráfico 4 y el 5
            $chartStartRow += 25;

            // Gráfico 5: Líneas Kg patacón perdido
            $sheet->mergeCells("A{$chartStartRow}:F{$chartStartRow}");
            $sheet->setCellValue(
                "A{$chartStartRow}",
                'Gráfico 5: Kg de patacón perdido por contenedor, Fritura - Empaque'
            );
            $sheet->getStyle("A{$chartStartRow}")
                ->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('D35400');
            $sheet->getStyle("A{$chartStartRow}:F{$chartStartRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $values5 = [
                new DataSeriesValues(
                    DataSeriesValues::DATASERIES_TYPE_NUMBER,
                    $sheetName . '$AL$' . ($startRowAux + 1) . ':$AL$' . $endRowAux,
                    null,
                    $pointCount
                ),
            ];
            foreach ($values5 as $v) {
                $v->setPointMarker('circle');
            }

            $series5 = new DataSeries(
                DataSeries::TYPE_LINECHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($values5) - 1),
                [],
                $categories,
                $values5
            );

            // Para esta gráfica queremos las etiquetas claramente por encima del punto
            $layoutAbove = new Layout();
            $layoutAbove->setShowVal(true);
            // 't' (top) fuerza a Excel a colocar el valor por encima del marcador
            $layoutAbove->setDLblPos('t');

            $plot5 = new PlotArea($layoutAbove, [$series5]);
            $chart5 = new Chart(
                'chart5',
                new Title('Kg de patacón perdido por contenedor, Fritura - Empaque'),
                new Legend(Legend::POSITION_BOTTOM),
                $plot5
            );
            // Posicionar más abajo para que no se monte sobre el gráfico 4
            // Gráfico 5 más separado del gráfico 4
            $chart5->setTopLeftPosition('A' . ($chartStartRow + 3));
            $chart5->setBottomRightPosition('F' . ($chartStartRow + 19));
            $sheet->addChart($chart5);

            $writer = new Xlsx($spreadsheet);
            $writer->setIncludeCharts(true);

            return response()->streamDownload(function () use ($writer) {
                $writer->save('php://output');
            }, 'reporte-performance-anual.xlsx', [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ], 500);
        }
    }
}
