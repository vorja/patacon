import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Proveedor from "./proveedores.mjs";
import Responsable from "./responsable.mjs";
import Produccion from "./produccion.mjs";

const RegistroRecepcionMateriaPrimaOp = sequelize.define(
  "RegistroRecepcionMateriaPrimaOp",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_procedimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proveedor,
        key: "id",
      },
    },
    id_responsable: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    lote: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    variedad: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    total_canastillas: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    peso_total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Produccion,
        key: "id",
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_recepcion_materia_prima_pesaje",
    timestamps: false,
  }
);

export default RegistroRecepcionMateriaPrimaOp;
