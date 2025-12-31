import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Proveedor from "./proveedores.mjs";
const InventarioMateriaPrima = sequelize.define(
  "InventarioMateriaPrima",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_recepcion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    producto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    materia_recp: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    materia_proceso: {
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
    tableName: "inventario_materia_prima",
    timestamps: false,
  }
);
InventarioMateriaPrima.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
  onDelete: "CASCADE",
});

export default InventarioMateriaPrima;
