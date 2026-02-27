<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reporte de Contenedor</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10.5px;
            color: #222;
            margin: 0;
        }

        @page {
            margin: 1.2cm;
            size: landscape;
        }

        .page-break {
            page-break-before: always;
        }

        /* ---------- ENCABEZADO ---------- */
        .encabezado {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .encabezado td {
            border: 1px solid #444;
            padding: 6px 8px;
            font-size: 10px;
            vertical-align: middle;
            text-align: left;
        }

        /* SOLO TITULOS CENTRADOS */
        .titulo-centro {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            letter-spacing: .4px;
        }


        /* ---------- INFO ---------- */
        .info {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .info td {
            border: 1px solid #444;
            padding: 7px;
            background: #fafafa;
            font-size: 11px;
            text-align: center;
        }

        /* ---------- TABLA ---------- */
        .tabla {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
        }

        .tabla thead {
            display: table-header-group;
        }

        .tabla tr {
            page-break-inside: avoid;
        }

        .tabla th {
            background: #F4B214;
            border: 1px solid #444;
            padding: 7px 5px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            color: #000;
        }

        .tabla td {
            border: 1px solid #555;
            padding: 6px 5px;
            text-align: center;
            vertical-align: middle;
        }

        .tabla tbody tr:nth-child(even) {
            background: #f7f7f7;
        }

        /* ---------- GRUPO ---------- */
        .grupo-titulo td {
            background: #6B7A0E;
            color: #fff;
            font-weight: bold;
            text-align: center;
            padding: 8px;
            font-size: 11.5px;
            page-break-after: avoid;
        }

        /* ---------- TOTALES ---------- */
        .tabla-totales {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }

        .tabla-totales td {
            border: 1px solid #444;
            padding: 9px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
        }

        .resumen {
            margin-top: 20px;
        }

        .tabla-totales tr:first-child td {
            background: #6B7A0E;
            color: #fff;
        }

        /* ---------- FIRMAS ---------- */
        .firmas {
            width: 100%;
            margin-top: 35px;
            font-size: 11px;
        }

        .firmas td {
            text-align: center;
            padding-top: 25px;
        }
    </style>

</head>

<body>

    @php
        $produccion = $produccion ?? [];
        $detalleEmpaque = $detalleEmpaque ?? [];

        $productoBase = "TOSTON HAWAIIANO STYLE";
        $presentacion = 3;
        $unidad = "Lb";
        $dimensiones = "386*286*178";
        $pesoCaja = 18;

        $itemsPorTipo = [];
        foreach ($detalleEmpaque as $detalle) {
            $tipo = $detalle['tipo'] ?? 'A';
            $pesoLb = round(($detalle['peso_kg'] ?? 0) * 2.20462, 2);

            $itemsPorTipo[$tipo][] = [
                'batch' => $detalle['lote_produccion'] ?? 'N/A',
                'manufactured' => isset($detalle['fecha_produccion']) ? \Carbon\Carbon::parse($detalle['fecha_produccion'])->format('d/m/Y') : 'N/A',
                'boxes' => $detalle['total_cajas'] ?? 0,
                'reference' => $tipo,
                'exp' => isset($detalle['fecha_produccion']) ? \Carbon\Carbon::parse($detalle['fecha_produccion'])->addYears(2)->format('d/m/Y') : 'N/A',
                'weight' => $pesoLb,
                'peso_kg' => $detalle['peso_kg'] ?? 0
            ];
        }

        $totalCajas = 0;
        $totalPeso = 0;
        $totalesPorReferencia = [];

        foreach ($itemsPorTipo as $tipo => $items) {
            $sumCajas = collect($items)->sum('boxes');
            $sumPeso = collect($items)->sum('weight');

            $totalesPorReferencia[$tipo] = [
                'boxes' => $sumCajas,
                'weight' => $sumPeso,
                'weight_kg' => collect($items)->sum('peso_kg')
            ];

            $totalCajas += $sumCajas;
            $totalPeso += $sumPeso;
        }
    @endphp

    <!-- ENCABEZADO -->
    <table class="encabezado">
        <tr>
            <td rowspan="4" style="width:90px;">
                <img src="{{ public_path('assets/images/logo-clean.png') }}" width="70">
            </td>
            <td colspan="3" class="titulo">AGRICOL DEL PACIFICO</td>
            <td><strong>Código:</strong><br>REP-CON</td>
        </tr>
        <tr>
            <td colspan="3"><strong>NIT:</strong> 901.295.190</td>
            <td><strong>Fecha:</strong><br>{{ date('d/m/Y') }}</td>
        </tr>
        <tr>
            <td colspan="3">
                <strong>FDA:</strong> 19978280672<br>
                <strong>DUNS:</strong> 95-489-3077
            </td>
            <td><strong>Página:</strong> 1</td>
        </tr>
        <tr>
            <td colspan="4" style="font-size:9px;">
                VIA SN/153 MCP ANACARO ANSERMANUEVO ALQN 230242 - Tel: 3147400855
            </td>
        </tr>
        <tr>
            <td colspan="5" class="titulo">REPORTE DE CONTENEDOR</td>
        </tr>
    </table>

    <table class="info">
        <tr>
            <td><strong>Lote De Producción:</strong> {{ $produccion['lote_produccion'] ?? 'N/A' }}</td>
            <td><strong>Cliente:</strong> {{ $produccion['cliente_relacionado'] ?? 'N/A' }}</td>
        </tr>
    </table>

    <!-- TABLA PRINCIPAL -->
    <table class="tabla">
        <thead>
            <tr>
                <th>PRODUCT</th>
                <th>PRESENTATION</th>
                <th>UNIT</th>
                <th>DIMENSIONS</th>
                <th>BOX WEIGHT</th>
                <th>BATCH</th>
                <th>MANUFACTURED</th>
                <th>BOXES</th>
                <th>REF</th>
                <th>EXPIRATION</th>
                <th>BOX WEIGHT</th>
            </tr>
        </thead>
        <tbody>
            @foreach($itemsPorTipo as $tipo => $items)
                <tr class="grupo-titulo">
                    <td colspan="11">
                        {{ $productoBase }} TYPE {{ $tipo }}
                    </td>
                </tr>

                @foreach($items as $item)
                    <tr>
                        <td>{{ $productoBase }} TYPE {{ $tipo }}</td>
                        <td>{{ $presentacion }}</td>
                        <td>{{ $unidad }}</td>
                        <td>{{ $dimensiones }}</td>
                        <td>{{ $pesoCaja }}</td>
                        <td>{{ $item['batch'] }}</td>
                        <td>{{ $item['manufactured'] }}</td>
                        <td>{{ number_format($item['boxes']) }}</td>
                        <td>{{ $item['reference'] }}</td>
                        <td>{{ $item['exp'] }}</td>
                        <td>{{ number_format($item['weight'], 2) }}</td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>

    <!-- TOTALES -->
    <table class="tabla-totales">
        <tr style="background:#f2f2f2;">
            <td>TOTAL GENERAL</td>
            <td>{{ number_format($totalCajas) }} Boxes</td>
            <td>TOTAL WEIGHT</td>
            <td>{{ number_format($totalPeso, 2) }} Lb </td>
        </tr>

        @foreach($totalesPorReferencia as $ref => $totales)
            <tr>
                <td>TOTAL REF {{ $ref }}</td>
                <td>{{ number_format($totales['boxes']) }} Boxes</td>
                <td>WEIGHT REF {{ $ref }}</td>
                <td>{{ number_format($totales['weight'], 2) }} Lb</td>
            </tr>
        @endforeach
    </table>

    <!-- RESUMEN -->
    <table class="tabla resumen">
        <thead>
            <tr>
                <th>REFERENCE</th>
                <th>TOTAL BOXES</th>
                <th>WEIGHT (Lb)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($itemsPorTipo as $tipo => $items)
                <tr>
                    <td><strong>{{ $tipo }}</strong></td>
                    <td>{{ number_format(collect($items)->sum('boxes')) }}</td>
                    <td>{{ number_format(collect($items)->sum('weight'), 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- FIRMAS -->
    <table class="firmas">
        <tr>
            <td>_________________________<br><strong>Elaborado por</strong></td>
            <td>_________________________<br><strong>Revisado por</strong></td>
            <td>_________________________<br><strong>Aprobado por</strong></td>
        </tr>
    </table>

</body>

</html>