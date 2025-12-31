import { DataTypes } from "sequelize";
import Proveedor from "./proveedores.mjs";
import sequelize from "../config/database.mjs";
const InventarioPlatanoMaduro = sequelize.define(
  "PlatanoMaduro",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    producto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proveedor,
        key: "id",
      },
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "inventario_platano_maduro",
    timestamps: false,
  }
);

InventarioPlatanoMaduro.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
  onDelete: "CASCADE",
});
export default InventarioPlatanoMaduro;
