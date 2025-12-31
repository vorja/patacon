import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const Proveedor = sequelize.define(
  "Proveedor",
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
    identificacion: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    movil: {
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
    tableName: "proveedores_materia_prima",
    timestamps: false,
  }
);

export default Proveedor;
