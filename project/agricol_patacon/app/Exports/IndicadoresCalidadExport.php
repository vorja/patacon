<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class IndicadoresCalidadExport implements WithMultipleSheets
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        return [
            new class($this->data['recepcionAlistamiento'] ?? []) implements FromArray, WithHeadings, WithTitle {
                protected array $rows;

                public function __construct(array $rows)
                {
                    $this->rows = $rows;
                }

                public function array(): array
                {
                    return array_map(function ($row) {
                        return [
                            $row['lote_proveedor'] ?? null,
                            $row['materia'] ?? null,
                            $row['rechazo'] ?? null,
                            $row['maduro'] ?? null,
                            $row['bruto'] ?? null,
                            $row['rendimiento'] ?? null,
                            $row['perdida'] ?? null,
                        ];
                    }, $this->rows);
                }

                public function headings(): array
                {
                    return [
                        'Lote Proveedor',
                        'Materia Útil (kg)',
                        'Rechazo (kg)',
                        'Maduro (kg)',
                        'Total Bruto (kg)',
                        'Rendimiento (%)',
                        'Pérdida (%)',
                    ];
                }

                public function title(): string
                {
                    return 'Recepcion_Alistamiento';
                }
            },
            new class($this->data['controlFritura'] ?? []) implements FromArray, WithHeadings, WithTitle {
                protected array $rows;

                public function __construct(array $rows)
                {
                    $this->rows = $rows;
                }

                public function array(): array
                {
                    return array_map(function ($row) {
                        return [
                            $row['id_proceso'] ?? null,
                            $row['lote_produccion'] ?? null,
                            $row['lote_proveedor'] ?? null,
                            $row['tipo'] ?? null,
                            $row['temperatura_fritura'] ?? null,
                            $row['tiempo_fritura'] ?? null,
                            $row['rechazo'] ?? null,
                            $row['migas'] ?? null,
                            $row['bajadas'] ?? null,
                            $row['canastas'] ?? null,
                            $row['materia_kg'] ?? null,
                            $row['canastas_variables'] ?? null,
                            $row['cantidad_kg'] ?? null,
                        ];
                    }, $this->rows);
                }

                public function headings(): array
                {
                    return [
                        'ID Proceso',
                        'Lote Producción',
                        'Lote Proveedor',
                        'Tipo',
                        'Temperatura Fritura (°C)',
                        'Tiempo Fritura (min)',
                        'Rechazo (kg)',
                        'Migas (kg)',
                        'Bajadas',
                        'Canastas',
                        'Materia (kg)',
                        'Canastas Variables',
                        'Cantidad Variables (kg)',
                    ];
                }

                public function title(): string
                {
                    return 'Control_Fritura';
                }
            },
            new class($this->data['verificacionEmpaque'] ?? []) implements FromArray, WithHeadings, WithTitle {
                protected array $rows;

                public function __construct(array $rows)
                {
                    $this->rows = $rows;
                }

                public function array(): array
                {
                    return array_map(function ($row) {
                        return [
                            $row['id_verificacion'] ?? null,
                            $row['fecha_verificacion'] ?? null,
                            $row['responsable'] ?? null,
                            $row['lote_empaque'] ?? null,
                            $row['tipo_caja'] ?? null,
                            $row['peso_caja'] ?? null,
                            $row['lote_produccion'] ?? null,
                            $row['tipo_paquete'] ?? null,
                            $row['peso_paquete'] ?? null,
                        ];
                    }, $this->rows);
                }

                public function headings(): array
                {
                    return [
                        'ID Verificación',
                        'Fecha Verificación',
                        'Responsable',
                        'Lote Empaque',
                        'Tipo Caja',
                        'Peso Caja (kg)',
                        'Lote Producción',
                        'Tipo Paquete',
                        'Peso Paquete (kg)',
                    ];
                }

                public function title(): string
                {
                    return 'Verificacion_Empaque_Peso';
                }
            },
        ];
    }
}

