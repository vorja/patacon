<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>PRO-04-R REGISTRO DE PRODUCCION AREA DE CORTE</title>
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
            <td rowspan="3">
                <img src="{{ public_path('assets/images/logo-clean.png') }}" alt="Logo" width="70">
            </td>
            <td rowspan="1" colspan="3" class="titulo">
                AGRICOL DEL PACIFICO
            </td>
            <td><strong>Código:</strong> PRO-04-R</td>
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

    <!-- Tabla doble -->

    <table class="tabla">
        <thead>
            <tr>
                <th colspan="5" class="T">INFORMACIÓN DE PROVEEDORES</th>
            </tr>
            <tr>
                <th class="text-center N">Proveedor</th>
                <th class="text-center N"> Lote Recepción</th>
                <th class="text-center N">Cortes Kg</th>
                <th class="text-center N">Rechazo</th>
                <th class="text-center N">Rendimiento</th>
            </tr>
        </thead>
        <tbody>
            @foreach($cortes as $item)
                <tr>
                    <td>{{ $item['Proveedor'] }}</td>
                    <td>{{ $item['Lote'] }}</td>
                    <td>{{ $item['Materia'] }} Kg</td>
                    <td>{{ $item['Rechazo'] }} kg</td>
                    <td>{{ $item['Rendimiento'] }} %</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <table class="tabla">
        <thead>
            <tr>
                <th colspan="3" class="T">INFORMACIÓN DE CORTES</th>
            </tr>
            <tr>
                <th class="text-center N">Proveedor</th>
                <th class="text-center N">Tipo (A,B,C,D)</th>
                <th class="text-center N">Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @foreach($proveedores as $item)
                <tr>
                    <td>{{ $item['Proveedor'] }}</td>
                    <td>{{ $item['Tipo'] }}</td>
                    <td>{{ $item['Cantidad'] }} kg</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Rechazo -->
    <div class="rechazo">
        <strong>Rechazo de corte:</strong> {{ $registro['rechazo'] }} kg
    </div>
    <table class="firmas">
        <thead>
            <tr>
                <th colspan="1">German Ortiz</th>
                <th colspan="1">{{ $registro['responsable'] }}</th>
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
        {{ $registro['observaciones'] }}
    </div>

</body>

</html>