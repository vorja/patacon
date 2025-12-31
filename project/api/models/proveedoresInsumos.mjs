import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

const ProveedorInsumo = sequelize.define(
  "ProveedorInsumo",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
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
      defaultValue: 1,
    },
  },
  {
    tableName: "proveedores_insumos",
    timestamps: false,
  }
);

export default ProveedorInsumo;
