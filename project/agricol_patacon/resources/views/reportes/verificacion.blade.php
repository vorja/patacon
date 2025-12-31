<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Registro de Producción Área de Corte</title>
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
            font-size: 14px
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
            <td rowspan="3">
                <img src="{{ public_path('assets/images/logo-clean.png') }}" alt="Logo" width="70">
            </td>
            <td rowspan="1" colspan="3" class="titulo">
                AGRICOL DEL PACIFICO
            </td>
            <td><strong>Código:</strong> PRO-R-03</td>
        </tr>
        <tr>
            <td rowspan="2" colspan="3" class="titulo"><strong>REGISTRO DE PRODUCCIÓN ÁREA DE CORTE</strong></td>
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

    <!-- Datos generales -->
    <table class="info">
        <tr>
            <td><strong>Fecha:</strong> {{ $corte['fecha'] }}</td>
            <td><strong>Hora de inicio:</strong> {{ $corte['hora_inicio'] }}</td>
            <td><strong>Hora final:</strong> {{ $corte['hora_fin'] }}</td>
        </tr>
        <tr>
            <td colspan="3">
                {{ $proveedor1 ?? '' }} &nbsp;&nbsp;
                @foreach($proveedores as $key => $item)
                    <strong>Proveedor #{{$key + 1}}:</strong> {{ $item['proveedor']['nombre'] ?? '' }} &nbsp;&nbsp;
                @endforeach
            </td>
        </tr>
    </table>

    <!-- Tabla doble -->
    <table class="tabla">
        <thead>
            <tr>
                <th colspan="3">Identificación de proveedor</th>
                <th colspan="3">Identificación de proveedor</th>
            </tr>
            <tr>
                <th>Proveedor</th>
                <th>Tipo (A,B,C,D)</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
                <th>Tipo (A,B,C,D)</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @foreach($proveedores as $item)
                <tr>
                    <td>{{ $item['proveedor']['nombre'] }}</td>
                    <td>{{ $item['proveedor']['info']['TipoA'] }}</td>
                    <td>{{ $item['proveedor']['info']['CantidadA'] }} kg</td>
                    <td>{{ $item['proveedor']['nombre'] }}</td>
                    <td>{{ $item['proveedor']['info']['TipoB'] }}</td>
                    <td>{{ $item['proveedor']['info']['CantidadB'] }} kg</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Rechazo -->
    <div class="rechazo">
        <strong>Rechazo de corte:</strong> {{ $corte['rechazo_corte'] }} kg
    </div>
    <table class="firmas">
        <thead>
            <tr>
                <th colspan="1">German Ortiz</th>
                <th colspan="1">{{ $corte['responsable']['nombre'] }}</th>
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
        <strong>Observaciones:</strong><br>
        {{ $corte['observaciones'] }}
    </div>

    <!-- Firmas -->


</body>

</html>