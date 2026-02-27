import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const HistorialEnvios = sequelize.define(
  "HistorialEnvios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    orden: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipo_a: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_b: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_c: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_af: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_bh: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_xl: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_cil: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tipo_p: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "historial_envios",
    timestamps: false,
  },
);

export default HistorialEnvios;
