import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const RegistroTemperatura = sequelize.define(
  "RegistroTemperatura",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_mes: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_temperatura",
    timestamps: false,
  }
);

export default RegistroTemperatura;
