<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #000;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 3px;
            text-align: center;
            vertical-align: middle;
        }

        th {
            background-color: #e6e6e6;
            font-weight: bold;
        }



        th.T {
            background-color: #849217;
            font-weight: bold;
        }

        th.N {
            background-color: #fab612;
            font-weight: bold;
        }

        .titulo {
            font-size: 14px;
            font-weight: bold;
        }

        .subtitulo {
            font-size: 11px;
            font-weight: bold;
        }

        .sin-borde td {
            border: none;
        }

        .firma {
            height: 45px;
            vertical-align: bottom;
        }
    </style>
</head>

<body>

    <!-- ================= ENCABEZADO ================= -->
    <table>
        <tr>
            <td rowspan="3" style="width:80px">
                <img src="{{ public_path('assets/images/logo-clean.png') }}" width="70">
            </td>
            <td colspan="7" class="titulo">AGRICOL DEL PACIFICO</td>
            <td colspan="2"><strong>Código:</strong> PRO-05-R</td>
        </tr>
        <tr>
            <td colspan="7" class="subtitulo">REGISTRO DE PRODUCCIÓN ÁREA DE FRITURA</td>
            <td colspan="2"><strong>Versión:</strong> 04</td>
        </tr>
        <tr>
            <td colspan="7"></td>
            <td colspan="2"><strong>Fecha:</strong> {{ $produccion['fecha'] }}</td>
        </tr>
        <tr>
            <td colspan="5"><strong>Elaborado y revisado:</strong> Germán Ortiz</td>
            <td colspan="5"><strong>Aprobado:</strong> Mauricio Quintero</td>
        </tr>
    </table>

    <!-- ================= DATOS GENERALES ================= -->
    <table>
        <tr>
            <td colspan="2"><strong>Hora inicio</strong></td>
            <td colspan="2">{{ $produccion['horaInicio'] }}</td>
            <td colspan="2"><strong>Hora final</strong></td>
            <td colspan="2">{{ $produccion['horaFin'] }}</td>

        </tr>

        <tr>
            <td><strong>Aforo aceite</strong></td>
            <td>{{ $produccion['aforo'] }}</td>
            <td><strong>Lote aceite</strong></td>
            <td>{{ $produccion['aceite'] }}</td>
            <td><strong>Inventario aceite</strong></td>
            <td>{{ $produccion['inventario'] }}</td>
            <td><strong>Consumo Gas</strong></td>
            <td>{{ $produccion['gas'] }}</td>
        </tr>
    </table>

<!-- ================= TABLA PRINCIPAL ================= -->
<table>
    <thead>
        <tr>
            <th rowspan="2" class="T">Proveedor</th>
            <th rowspan="2" class="T">Producto</th>
            <th rowspan="2" class="T">Hora Inicio</th>
            <th rowspan="2" class="T">Hora Final</th>
            <th rowspan="2" class="T">Temp °C</th>
            <th rowspan="2" class="T">Tiempo</th>
            <th colspan="8" class="T">Canastillas</th>
            <th rowspan="2" class="T">Rechazo</th>
            <th rowspan="2" class="T">Migas</th>
        </tr>
        <tr>
            <th>A</th>
            <th>AF</th>
            <th>B</th>
            <th>BH</th>
            <th>C</th>
            <th>CIL</th>
            <th>XL</th>
            <th>P</th>
        </tr>
    </thead>
    <tbody>
        @php
// Crear un mapa de proveedores únicos con sus IDs
$proveedoresUnicos = [];
foreach ($canastillas as $c) {
    $idProveedor = $c['id_proveedor'];
    if (!isset($proveedoresUnicos[$idProveedor])) {
        // Extraer el nombre del proveedor del lote_proveedor (ej: "ASO" de "ASO14226CA")
        preg_match('/^([A-Z]+)/', $c['lote_proveedor'], $matches);
        $nombreProveedor = $matches[1] ?? 'DESCONOCIDO';

        $proveedoresUnicos[$idProveedor] = [
            'nombre' => $nombreProveedor,
            'canastillas' => [
                'A' => 0,
                'AF' => 0,
                'B' => 0,
                'BH' => 0,
                'C' => 0,
                'CIL' => 0,
                'XL' => 0,
                'P' => 0
            ]
        ];
    }

    $tipo = $c['tipo'] ?? '';
    $canastas = $c['canastas'] ?? 0;

    if ($tipo && isset($proveedoresUnicos[$idProveedor]['canastillas'][$tipo])) {
        $proveedoresUnicos[$idProveedor]['canastillas'][$tipo] += $canastas;
    }
}
        @endphp

        @foreach($proveedoresUnicos as $idProveedor => $datos)
                    @php
            $procesoItem = $proceso[$loop->index] ?? null;
                    @endphp
                    @if($procesoItem)
                        <tr>
                            <td>{{ $procesoItem['proveedor'] }}</td>
                            <td>{{ $produccion['producto'] }}</td>
                            <td>{{ $procesoItem['inicio'] }}</td>
                            <td>{{ $procesoItem['fin'] }}</td>
                            <td>{{ $procesoItem['temperatura'] }}</td>
                            <td>{{ $procesoItem['tiempo'] }}</td>

                            <!-- Mostrar las canastillas de este proveedor -->
                            <td>{{ $datos['canastillas']['A'] > 0 ? $datos['canastillas']['A'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['AF'] > 0 ? $datos['canastillas']['AF'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['B'] > 0 ? $datos['canastillas']['B'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['BH'] > 0 ? $datos['canastillas']['BH'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['C'] > 0 ? $datos['canastillas']['C'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['CIL'] > 0 ? $datos['canastillas']['CIL'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['XL'] > 0 ? $datos['canastillas']['XL'] : '-' }}</td>
                            <td>{{ $datos['canastillas']['P'] > 0 ? $datos['canastillas']['P'] : '-' }}</td>

                            <td>{{ $procesoItem['rechazo'] }}</td>
                            <td>{{ $procesoItem['migas'] }}</td>
                        </tr>
                    @endif
        @endforeach
    </tbody>
</table>

    <!-- ================= TOTALES POR LOTE ================= -->
    <table>
        <thead>
            <tr>
                <th colspan="4" class="N">
                    TOTAL CANASTILLAS
                </th>
            </tr>
            <tr>
                <th class="T">Lote Producción</th>
                <th class="T">Tipo</th>
                <th class="T">Cantidad (Kg)</th>
                <th class="T">Canastillas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $d)
                <tr>
                    <td>{{ $d['lote_produccion'] }}</td>
                    <td>{{ $d['tipo'] }}</td>
                    <td>{{ $d['cantidad_kg'] }}</td>
                    <td>{{ $d['canastas'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <!-- ================= TOTALES POR LOTE ================= -->

    <table>
        <thead>
            <tr>
                <th colspan="5" class="N">
                    INFORMACIÓN DE FRITURA
                </th>
            </tr>
            <tr>
                <th class="T">Lote Producción</th>
                <th class="T">Lote Proveedor</th>
                <th class="T">Tipo</th>
                <th class="T">Patacón (Kg)</th>
                <th class="T">Canastillas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($canastillas as $item)
                <tr>
                    <td>{{ $item['lote_produccion'] }}</td>
                    <td>{{ $item['lote_proveedor'] }}</td>
                    <td>{{ $item['tipo'] }}</td>
                    <td>{{ $item['peso'] }}</td>
                    <td>{{ $item['canastas'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- ================= OBSERVACIONES ================= -->
    <table>
        <tr>
            <td style="height:40px; text-align:left; border: #e6e6e6;">
                <strong>Observaciones:</strong><br>
                {{ $produccion['observaciones'] }}
            </td>
        </tr>
    </table>

    <!-- ================= FIRMAS ================= -->
    <table class="sin-borde">
        <tr>
            <td class="firma">
                 Germán Ortiz<br>
                _______________________________<br>

                Revisado por
            </td>
            <td class="firma">
                {{ $produccion['responsable'] ?? '' }}<br>
                _______________________________<br>

                Responsable
            </td>
        </tr>
    </table>

</body>

</html>