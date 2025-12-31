import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

export default sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.TINYINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);
