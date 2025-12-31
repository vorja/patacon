<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>PRO-02-R REGISTRO DE RECEPCION DE MATERIA PRIMA</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #070707;
        }

        .encabezado {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .encabezado td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
        }

        .titulo {
            font-size: 16px;
            font-weight: bold;
        }

        .info {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .info td {
            border: 1px solid #000;
            padding: 7px;
            font-size: 12px
        }

        .tabla {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .tabla th,
        .tabla td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
            font-size: 12px;
        }

        .tabla th {
            background-color: #92d0ec;
            font-weight: bold;
        }

        .observaciones {
            padding: 5px;
            margin-top: 40px;
            font-size: 16px;
            border-bottom: 1px solid #000;
        }
    </style>
</head>

<body>
    <!-- Encabezado -->
    <table class="encabezado" width="100%">
        <tr>
            <td rowspan="3">
                <img src="{{ public_path('assets/images/logo-clean.png') }}" alt="Logo" width="70">
            </td>
            <td rowspan="1" colspan="3" class="titulo">
                AGRICOL DEL PACIFICO
            </td>
            <td><strong>Código:</strong> PRO-R-03</td>
        </tr>
        <tr>
            <td rowspan="2" colspan="3" class="titulo"><strong>REGISTRO DE RECEPCION DE MATERIA PRIMA</strong></td>
            <td><strong>Aplica desde:</strong> 01/05/22</td>
        </tr>
        <tr>
            <td><strong>Versión:</strong> 1</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Elaborado y revisado:</strong> German Ortiz</td>
            <td colspan="2"><strong>Aprobado:</strong> Mauricio Quintero</td>
            <td><strong>Pagina 1 de 1</strong></td>
        </tr>
    </table>
    <!-- Tabla doble -->
    <table class="tabla">
        <thead>
            <tr>
                <th rowspan="2">Fecha</th>
                <th rowspan="2">Proveedor</th>
                <th rowspan="2">Procesamiento</th>
                <th rowspan="2">Producto</th>
                <th rowspan="2">Cantidad</th>
                <th rowspan="2">Lote</th>
                <th colspan="3">Variables Visuales</th>
                <th colspan="2">Muestreo</th>
                <th rowspan="1">Cumple</th>
                <th rowspan="2">Responsable</th>
            </tr>
            <tr>
                <th>Color</th>
                <th>Olor</th>
                <th>Estado Fisico</th>
                <th>Defectos Encontrados</th>
                <th>Cantidad Encontrada</th>
                <th>Si / No</th>
            </tr>
        </thead>
        <tbody>
            @foreach($info as $item)
                <tr>
                    <td>{{ $item['Fecha'] }}</td>
                    <td>{{ $item['Proveedor'] }}</td>
                    <td>{{ $item['Procedimiento'] }}</td>
                    <td>{{ $item['Producto'] }}</td>
                    <td>{{ $item['Total'] }} kg</td>
                    <td>{{ $item['Lote'] }}</td>
                    <td>{{ $item['Color'] }}</td>
                    <td>{{ $item['Olor'] }}</td>
                    <td>{{ $item['Estado'] }}</td>
                    <td>{{ $item['Defectos'] ?? 'No Hay Defectos' }}</td>
                    <td>{{ $item['Cantidad'] }} kg</td>
                    <td>{{ $item['Cumple'] }}</td>
                    <td>{{ $item['Responsable'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Observaciones -->
    {{-- <div class="observaciones">
        <strong>Observaciones:</strong><br>
        {{ $corte['observaciones'] }}
    </div> --}}

    <!-- Firmas -->
    <div class="observaciones">
        <strong>Revisado por:</strong> German Ortiz<br>
    </div>

</body>

</html>