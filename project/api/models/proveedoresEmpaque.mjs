import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Proveedor from "./proveedores.mjs";
import RegistroAreaEmpaque from "./registroAreaEmpaque.mjs";

const ProveedoresEmpaque = sequelize.define(
  "ProveedoresEmpaque",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_empaque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegistroAreaEmpaque,
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
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_produccion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lote_produccion: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cajas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    migas: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "proveedor_has_empaque",
    timestamps: false,
  }
);

ProveedoresEmpaque.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});

ProveedoresEmpaque.belongsTo(RegistroAreaEmpaque, {
  as: "empaque",
  foreignKey: "id_empaque",
});

export default ProveedoresEmpaque;
