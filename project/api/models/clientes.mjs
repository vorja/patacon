import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numero_solicitud: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    destino: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    puerto_embarque: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    puerto_llegada: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "clientes",
    timestamps: false,
  },
);

export default Cliente;
