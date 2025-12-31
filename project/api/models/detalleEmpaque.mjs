import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import RegistroAreaEmpaque from "./registroAreaEmpaque.mjs";
import Proveedor from "./proveedores.mjs";

const DetalleEmpaque = sequelize.define(
  "DetalleEmpaque",
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
    fecha_empaque: {
      type: DataTypes.DATEONLY,
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
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    numero_canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_cajas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    migas_empaque: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    peso_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_empaque",
    timestamps: false,
  }
);

DetalleEmpaque.belongsTo(RegistroAreaEmpaque, {
  as: "empaque",
  foreignKey: "id_empaque",
});

export default DetalleEmpaque;
