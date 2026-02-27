// models/lotesFritura.mjs
import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import RegistroAreaFritura from "./registroAreaFritura.mjs";

const LotesFritura = sequelize.define(
  "lotes_fritura",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_fritura: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_produccion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lote_produccion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    tipo: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "lotes_fritura",
    timestamps: false,
  },
);

// Definir la relación
LotesFritura.belongsTo(RegistroAreaFritura, {
  foreignKey: "id_fritura",
  as: "registroFritura",
});

export default LotesFritura;
