import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import ProveedorInsumo from "./proveedoresInsumos.mjs";

const Inventario = sequelize.define(
  "InventarioInsumos",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    medida: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProveedorInsumo,
        key: "id",
      },
    },
    area: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "inventario_insumo",
    timestamps: false,
  }
);
Inventario.belongsTo(ProveedorInsumo, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});
export default Inventario;
