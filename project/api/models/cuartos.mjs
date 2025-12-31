import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const Cuartos = sequelize.define(
  "Cuartos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
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
    tableName: "cuartos_produccion",
    timestamps: false,
  }
);
export default Cuartos;
