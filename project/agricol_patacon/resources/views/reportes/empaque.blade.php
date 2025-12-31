<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>PRO-07-R REGISTRO DE PRODUCCIÓN DE AREA DE EMPAQUE</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
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
            font-size: 18px;
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
            font-size: 14px;
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
            font-size: 14px;
        }

        .tabla th {
            background-color: #e6e6e6;
            font-weight: bold;
        }

        .tabla th.T {
            background-color: #738011;
            font-weight: bold;
        }

        .tabla th.N {
            background-color: #fab612;
            font-weight: bold;
        }

        .firmas {
            width: 100%;
            margin-top: 77px;
            border: 1px solid #ffffff;
            /*  border-collapse: collapse; */
            border-collapse: separate;
            border-spacing: 15px;
            margin-bottom: 20px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .firmas th,
        .firmas td {
            border: 1px solid #ffffff;
            padding: 5px;
            text-align: center;
            font-size: 12px;
        }

        .firmas th {
            border-bottom: 1px solid #000;
            padding: 5px;
            font-size: 13px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
        }

        .rechazo {
            padding: 7px;
            margin-top: 10px;
            width: 160px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
        }

        .observaciones {
            padding: 5px;
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <!-- Encabezado -->
    <table class="encabezado" width="100%">
        <tr>
            <td rowspan="3"><img src="{{ public_path('assets/images/logo-clean.png') }}" alt="Logo" width="70">
            </td>
            <td rowspan="1" colspan="3" class="titulo">AGRICOL DEL PACIFICO</td>
            <td><strong>Código:</strong> PRO-07-R</td>
        </tr>
        <tr>
            <td rowspan="2" colspan="3" class="titulo">
                <strong>REGISTRO DE PRODUCCIÓN DE AREA DE EMPAQUE</strong>
            </td>
            <td><strong>Aplica desde:</strong> 01/05/22</td>
        </tr>
        <tr>
            <td><strong>Versión:</strong> 1</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Elaborado y revisado:</strong> German Ortiz</td>
            <td colspan="2">
                <strong>Aprobado:</strong> Juan Camilo Quintero Gomez
            </td>
            <td><strong>Pagina 1 de 1</strong></td>
        </tr>
    </table>

    <!-- Tabla doble -->
    <table class="tabla">
        <thead>
            <tr>
                <th colspan="7" class="T">Información de Proveedor</th>
            </tr>
            <tr>
                <th class="N">Fecha Empaque</th>
                <th class="N">Lote Empaque</th>
                <th class="N"># Canastas</th>
                <th class="N">Cajas</th>
                <th class="N">Peso Promedio</th>
                <th class="N">Rechazo</th>
                <th class="N">Migas</th>
            </tr>
        </thead>
        <tbody>

            <tr>
                <td>{{$empaques['fecha_empaque']}}</td>
                <td>{{$empaques['lote_empaque']}}</td>
                <td>{{$empaques['numero_canastas']}}</td>
                <td>{{$empaques['total_cajas']}}</td>
                <td>{{$empaques['promedio_peso']}}</td>

                <td>{{$empaques['rechazo_empaque']}}</td>
                <td>{{$empaques['migas_empaque']}}</td>
            </tr>

        </tbody>
    </table>
    <table class="tabla">
        <thead>
            <tr>
                <th class="N">Fecha Produccion</th>
                <th class="N">Lote Proveedor</th>
                <th class="N">Tipo</th>
                <th class="N">Canastas</th>
                <th class="N">Cajas</th>
                <th class="N">Rechazo</th>
                <th class="N">Migas</th>
            </tr>
        </thead>
        <tbody>

            @foreach ($proveedores as $item)
                <tr>
                    <td>{{ $item['fecha'] }}</td>
                    <td>{{ $item['proveedor'] }}</td>
                    <td>{{ $item['tipo'] }}</td>
                    <td>{{ $item['canastas'] }}</td>
                    <td>{{ $item['cajas'] }}</td>
                    <td>{{ $item['rechazo'] }}</td>
                    <td>{{ $item['migas'] }}</td>
                </tr>
            @endforeach

        </tbody>
    </table>

    <table class="firmas">
        <thead>
            <tr>
                <th colspan="1">German Ortiz</th>
                <th colspan="1">{{ $empaques['responsable']['nombre'] }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="1">Revisado por</td>
                <td colspan="1">Responsable</td>
            </tr>
        </tbody>
    </table>

    <!-- Observaciones -->
    <div class="observaciones">
        <strong>Observaciones:</strong><br />
        {{ $empaques['observaciones'] ?? '' }}
    </div>

    <!-- Firmas -->
</body>

</html>