import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import DetalleProveedor from "./detalleProveedor.mjs";

const VariablesProveedor = sequelize.define(
  "VariablesProveedor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_proceso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DetalleProveedor,
        key: "id",
      },
    },
    lote_produccion: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(50),
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
  },
  {
    tableName: "variables_proveedor_fritura",
    timestamps: false,
  }
);

VariablesProveedor.belongsTo(DetalleProveedor, {
  as: "proceso",
  foreignKey: "id_proceso",
});

export default VariablesProveedor;
