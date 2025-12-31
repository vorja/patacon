import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Proveedor from "./proveedores.mjs";
import RegistroAreaCorte from "./registroAreaCorte.mjs";

const ProveedorCorte = sequelize.define(
  "ProveedorCorte",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_corte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegistroAreaCorte,
        key: "id",
      },
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proveedor,
        key: "id",
      },
    },
    fecha_produccion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    totalMateria: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rendimiento: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "proveedor_has_corte",
    timestamps: false,
  }
);
ProveedorCorte.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});
export default ProveedorCorte;
