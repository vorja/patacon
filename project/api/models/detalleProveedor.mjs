import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Proveedor from "./proveedores.mjs";
import RegistroAreaFritura from "./registroAreaFritura.mjs";

const DetalleProveedor = sequelize.define(
  "DetalleProveedor",
  {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_fritura: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegistroAreaFritura,
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
    inicio_fritura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fin_fritura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    tiempo_fritura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    temperatura_fritura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    migas: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    materia_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_proveedor_fritura",
    timestamps: false,
  }
);

DetalleProveedor.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});

DetalleProveedor.belongsTo(RegistroAreaFritura, {
  as: "fritura",
  foreignKey: "id_fritura",
});

export default DetalleProveedor;
