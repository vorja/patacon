<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Rendimiento por Proveedor</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 15px;
            font-size: 11px;
        }

        h1 {
            color: #333;
            font-size: 16px;
            margin-bottom: 5px;
            font-weight: bold;
        }

        h2 {
            color: #333;
            font-size: 14px;
            margin-top: 25px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        h3 {
            color: #333;
            font-size: 12px;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .fecha {
            color: #666;
            font-size: 9px;
            margin-bottom: 15px;
        }

        /* Estilos para la primera tabla (Rendimiento General) */
        .tabla-rendimiento {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 20px;
        }

        .tabla-rendimiento th {
            background-color: #74820c;
            color: white;
            padding: 4px 6px;
            text-align: left;
            font-weight: bold;
        }

        .tabla-rendimiento td {
            padding: 3px 6px;
            border-bottom: 1px solid #ddd;
        }

        .tabla-rendimiento tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .tabla-rendimiento .rendimiento {
            font-weight: bold;
            color: #74820c;
        }

        .tabla-rendimiento .fila-totales {
            background-color: #e8e8e8 !important;
            font-weight: bold;
            border-top: 2px solid #74820c;
        }

        .tabla-rendimiento .fila-totales td {
            padding: 5px 6px;
            border-bottom: none;
        }

        .tabla-rendimiento .totales-label {
            text-align: right;
            font-weight: bold;
        }

        /* Estilos para la segunda tabla (Detalle por Tipo) */
        .tabla-detalle {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 20px;
        }

        .tabla-detalle th {
            background-color: #2c3e50;
            color: white;
            padding: 4px 6px;
            text-align: left;
            font-weight: bold;
        }

        .tabla-detalle td {
            padding: 3px 6px;
            border-bottom: 1px solid #ddd;
        }

        .tabla-detalle tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .tabla-detalle .rechazo {
            font-weight: bold;
            color: #dc3545;
        }

        .tabla-detalle .proveedor-group {
            background-color: #e8e8e8;
            font-weight: bold;
        }

        .tabla-detalle .proveedor-group td {
            padding: 5px 6px;
            background-color: #d4d4d4;
        }

        .tabla-detalle .totales-detalle {
            background-color: #c0c0c0 !important;
            font-weight: bold;
            border-top: 2px solid #2c3e50;
        }
    </style>
</head>

<body>
    <h1>Reporte de Rendimiento por Proveedor</h1>
    <div class="fecha">Fecha de generación: {{ $fechaGeneracion }}</div>

    @if(isset($data['metadata']))
        <div class="metadata"
            style="margin-bottom:15px; padding:6px; background-color:#f0f0f0; border-radius:3px; font-size:9px;">
            <strong>Año:</strong> {{ $data['metadata']['año'] ?? 'N/A' }} |
            <strong>Total Producciones:</strong> {{ $data['metadata']['totalProducciones'] ?? 'N/A' }}
        </div>
    @endif

    <!-- PRIMERA TABLA: Rendimiento general por proveedor -->
    <h2>1. Rendimiento General por Proveedor</h2>
    <table class="tabla-rendimiento">
        <thead>
            <tr>
                <th>Proveedor</th>
                <th>Corte (kg)</th>
                <th>Recepción (kg)</th>
                <th>Rendimiento %</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalCorte = 0;
                $totalRecepcion = 0;
                $totalRendimiento = 0;
                $contador = 0;
            @endphp

            @forelse($data['rendimientoProveedores'] ?? [] as $proveedor)
                @php
                    $totalCorte += $proveedor['totalMateriaProcesada'];
                    $totalRecepcion += $proveedor['totalMateriaRecibida'];
                    $totalRendimiento += $proveedor['rendimiento'];
                    $contador++;
                @endphp
                <tr>
                    <td>{{ $proveedor['proveedor'] }}</td>
                    <td>{{ number_format($proveedor['totalMateriaProcesada'], 0) }}</td>
                    <td>{{ number_format($proveedor['totalMateriaRecibida'], 0) }}</td>
                    <td class="rendimiento">{{ number_format($proveedor['rendimiento'], 2) }}%</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 10px;">No hay datos de proveedores disponibles</td>
                </tr>
            @endforelse

            <!-- Fila de totales -->
            @if(!empty($data['rendimientoProveedores']))
                <tr class="fila-totales">
                    <td class="totales-label">TOTALES</td>
                    <td>{{ number_format($totalCorte, 0) }} kg</td>
                    <td>{{ number_format($totalRecepcion, 0) }} kg</td>
                    <td>{{ number_format($contador > 0 ? $totalRendimiento / $contador : 0, 2) }}% (promedio)</td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- SEGUNDA TABLA: Detalle por tipo de plátano y rechazo -->
    <h2>2. Detalle por Tipo de Plátano y Rechazo</h2>
    <table class="tabla-detalle">
        <thead>
            <tr>
                <th>Proveedor</th>
                <th>Total Recibido (kg)</th>
                <th>Tipos de Plátano</th>
                <th>Procesado por Tipo (kg)</th>
                <th>% Rendimiento por Tipo</th>
                <th>Rechazo Total (kg)</th>
            </tr>
        </thead>
        <tbody>
            @php
                // Primero, reorganizar los datos para agrupar por proveedor y tipo
                $datosAgrupados = [];
                $totalProcesadoGeneral = 0;
                $totalRechazoGeneral = 0;

                // Agrupar por proveedor y tipo, sumando las cantidades procesadas
                foreach ($data['dataProveedor'] ?? [] as $detalle) {
                    $key = $detalle['proveedor'] . '||' . $detalle['tipo'];
                    if (!isset($datosAgrupados[$key])) {
                        $datosAgrupados[$key] = [
                            'proveedor' => $detalle['proveedor'],
                            'tipo' => $detalle['tipo'],
                            'procesado' => 0
                        ];
                    }
                    $datosAgrupados[$key]['procesado'] += $detalle['materia'];
                    $totalProcesadoGeneral += $detalle['materia'];
                }

                // Luego, agrupar por proveedor para mostrar todos sus tipos juntos
                $proveedoresConTipos = [];
                foreach ($datosAgrupados as $item) {
                    $proveedor = $item['proveedor'];
                    if (!isset($proveedoresConTipos[$proveedor])) {
                        $proveedoresConTipos[$proveedor] = [
                            'tipos' => [],
                            'procesado' => [],
                            'porcentajes' => [],
                            'rechazo' => 0,
                            'totalRecibido' => 0
                        ];

                        // Buscar el total recibido y rechazo UNA SOLA VEZ por proveedor
                        foreach ($data['rendimientoProveedores'] ?? [] as $prov) {
                            if ($prov['proveedor'] == $proveedor) {
                                $proveedoresConTipos[$proveedor]['rechazo'] = $prov['totalRechazo'] ?? 0;
                                $proveedoresConTipos[$proveedor]['totalRecibido'] = $prov['totalMateriaRecibida'] ?? 0;
                                $totalRechazoGeneral += $prov['totalRechazo'] ?? 0;
                                break;
                            }
                        }
                    }

                    $proveedoresConTipos[$proveedor]['tipos'][] = $item['tipo'];
                    $proveedoresConTipos[$proveedor]['procesado'][] = $item['procesado'];
                }

                // Calcular porcentajes de rendimiento para cada tipo (procesado / totalRecibido * 100)
                foreach ($proveedoresConTipos as $proveedor => &$datos) {
                    foreach ($datos['procesado'] as $cantidad) {
                        $porcentaje = $datos['totalRecibido'] > 0 ? ($cantidad / $datos['totalRecibido']) * 100 : 0;
                        $datos['porcentajes'][] = $porcentaje;
                    }
                }
            @endphp

            @forelse($proveedoresConTipos as $proveedor => $datos)
                @php
                    $tiposTexto = implode(' / ', $datos['tipos']);
                    $procesadoTexto = implode(' / ', array_map(function ($cant) {
                        return number_format($cant, 0);
                    }, $datos['procesado']));

                    // Crear texto de porcentajes de rendimiento
                    $porcentajesTexto = implode(' / ', array_map(function ($porc) {
                        return number_format($porc, 1) . '%';
                    }, $datos['porcentajes']));
                @endphp
                <tr>
                    <td><strong>{{ $proveedor }}</strong></td>
                    <td>{{ number_format($datos['totalRecibido'], 0) }} kg</td>
                    <td>{{ $tiposTexto }}</td>
                    <td>{{ $procesadoTexto }} kg</td>
                    <td>{{ $porcentajesTexto }}</td>
                    <td class="rechazo">{{ number_format($datos['rechazo'], 0) }} kg</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 10px;">No hay datos detallados por tipo disponibles</td>
                </tr>
            @endforelse

            <!-- Totales generales -->
            @if(!empty($proveedoresConTipos))
                <tr class="totales-detalle">
                    <td colspan="2" style="text-align: right; font-weight: bold;">TOTALES GENERALES</td>
                    <td></td>
                    <td>{{ number_format($totalProcesadoGeneral, 0) }} kg</td>
                    <td></td>
                    <td class="rechazo">{{ number_format($totalRechazoGeneral, 0) }} kg</td>
                </tr>
            @endif
        </tbody>
    </table>
    <h2>3. Plátanos verdes por contenedor</h2>

    <style>
        .tabla-grafica {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 9px;
        }

        .tabla-grafica td {
            padding: 2px 4px;
            vertical-align: middle;
        }

        .tabla-grafica .lote-cell {
            width: 100px;
            font-weight: bold;
            text-align: right;
            padding-right: 8px;
            white-space: nowrap;
            font-size: 9px;
        }

        .tabla-grafica .barra-cell {
            width: auto;
        }

        .tabla-grafica .barra-container {
            background-color: #f0f0f0;
            height: 18px;
            width: 100%;
            border-radius: 3px;
            position: relative;
        }

        .tabla-grafica .barra {
            background-color: #3b8ec2;
            height: 18px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            /* Centrado horizontal */
            color: white;
            font-weight: bold;
            font-size: 8px;
            box-sizing: border-box;
            min-width: 30px;
            /* Para que se vea el texto en barras pequeñas */
        }

        .tabla-eje {
            width: 100%;
            margin-left: 108px;
            /* 100px + 8px de padding */
            margin-top: 3px;
            border-collapse: collapse;
        }

        .tabla-eje td {
            text-align: center;
            font-size: 8px;
            color: #555;
            width: 25%;
        }

        .linea-eje {
            border-top: 1px solid #333;
            margin-left: 108px;
            margin-bottom: 2px;
            width: calc(100% - 108px);
        }

        .nota {
            text-align: right;
            font-size: 7px;
            color: #777;
            margin-top: 3px;
            padding-right: 5px;
        }
    </style>

    @php
        $detalleProducciones = $data['detalleProducciones'] ?? [];
        $maximoEje = collect($detalleProducciones)->pluck('totales.materiaPrima')->max() ?? 0;
        $maximoEje = $maximoEje > 0 ? ceil($maximoEje / 10000) * 10000 : 10000;
        $divisiones = 4;
    @endphp

    <table class="tabla-grafica">
        @forelse($detalleProducciones as $index => $produccion)
            @php
                $lote = $produccion['lote'] ?? 'Sin lote';
                $materia = $produccion['totales']['materiaPrima'] ?? 0;
                $anchoBarra = ($materia / $maximoEje) * 100;
            @endphp
            <tr>
                <td class="lote-cell">{{ $lote }} / <span style="color: #dc3545">{{ number_format($materia, 0) }}</span>
                </td>
                <td class="barra-cell">
                    <div class="barra-container">
                        <div class="barra" style="width: {{ $anchoBarra }}%;"></div>
                    </div>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="2" style="text-align: center; padding: 10px;">No hay datos disponibles</td>
            </tr>
        @endforelse
    </table>

    <!-- Línea del eje -->
    <div class="linea-eje"></div>

    <!-- Eje numérico -->
    <table class="tabla-eje">
        <tr>
            @for ($i = 0; $i <= $divisiones; $i++)
                <td>{{ number_format(($maximoEje / $divisiones) * $i, 0) }}</td>
            @endfor
        </tr>
    </table>

    <!-- Nota -->
    <div class="nota">* Valores en kilogramos</div>

    <h2>4. Porcentaje de Rechazo por Contenedor</h2>

    <style>
        .tabla-grafica-rechazo {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 9px;
        }

        .tabla-grafica-rechazo td {
            padding: 2px 4px;
            vertical-align: middle;
        }

        .tabla-grafica-rechazo .lote-cell {
            width: 100px;
            font-weight: bold;
            text-align: right;
            padding-right: 8px;
            white-space: nowrap;
            font-size: 9px;
        }

        .tabla-grafica-rechazo .barra-cell {
            width: auto;
        }

        .tabla-grafica-rechazo .barra-container {
            background-color: #f0f0f0;
            height: 18px;
            width: 100%;
            border-radius: 3px;
            position: relative;
        }

        .tabla-grafica-rechazo .barra {
            background-color: #dc3545;
            /* Color rojo para rechazo */
            height: 18px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 8px;
            box-sizing: border-box;
            min-width: 35px;
        }

        .tabla-eje-rechazo {
            width: 100%;
            margin-left: 108px;
            margin-top: 3px;
            border-collapse: collapse;
        }

        .tabla-eje-rechazo td {
            text-align: center;
            font-size: 8px;
            color: #555;
            width: 20%;
            /* 5 divisiones (0, 2, 4, 6, 8, 10%) */
        }

        .linea-eje-rechazo {
            border-top: 1px solid #333;
            margin-left: 108px;
            margin-bottom: 2px;
            width: calc(100% - 108px);
        }

        .nota-rechazo {
            text-align: right;
            font-size: 7px;
            color: #777;
            margin-top: 3px;
            padding-right: 5px;
        }
    </style>

    @php
        $detalleProducciones = $data['detalleProducciones'] ?? [];

        // Calcular el porcentaje máximo para el eje (redondeado hacia arriba)
        $porcentajes = [];
        foreach ($detalleProducciones as $produccion) {
            $materia = $produccion['totales']['materiaPrima'] ?? 0;
            $rechazo = $produccion['rechazo']['total'] ?? 0;

            if ($materia > 0) {
                $porcentaje = ($rechazo / $materia) * 100;
                $porcentajes[] = $porcentaje;
            }
        }

        $maxPorcentaje = !empty($porcentajes) ? max($porcentajes) : 0;
        // Redondear hacia arriba al siguiente 5% o 10%
        $maximoEje = $maxPorcentaje > 0 ? ceil($maxPorcentaje / 5) * 5 : 10;
        $divisiones = 5; // 0, 2, 4, 6, 8, 10% (o según el máximo)
    @endphp

    <table class="tabla-grafica-rechazo">
        @forelse($detalleProducciones as $index => $produccion)
            @php
                $lote = $produccion['lote'] ?? 'Sin lote';
                $materia = $produccion['totales']['materiaPrima'] ?? 0;
                $rechazo = $produccion['rechazo']['total'] ?? 0;

                $porcentaje = $materia > 0 ? ($rechazo / $materia) * 100 : 0;
                $anchoBarra = ($porcentaje / $maximoEje) * 100;
            @endphp
            <tr>
                <td class="lote-cell">{{ $lote }} / <span style="color: blue">
                        {{ number_format($porcentaje, 1) }}%</span></td>
                <td class="barra-cell">
                    <div class="barra-container">
                        <div class="barra" style="width: {{ $anchoBarra }}%;"></div>
                    </div>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="2" style="text-align: center; padding: 10px;">No hay datos disponibles</td>
            </tr>
        @endforelse
    </table>

    <!-- Línea del eje -->
    <div class="linea-eje-rechazo"></div>

    <!-- Eje numérico -->
    <table class="tabla-eje-rechazo">
        <tr>
            @for ($i = 0; $i <= $divisiones; $i++)
                <td>{{ number_format(($maximoEje / $divisiones) * $i, 1) }}%</td>
            @endfor
        </tr>
    </table>

    <!-- Nota -->
    <div class="nota-rechazo">* Porcentaje de rechazo sobre materia prima recibida</div>
</body>

</html>