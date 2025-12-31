import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Proveedor from "./proveedores.mjs";
import RegistroAreaCorte from "./registroAreaCorte.mjs";

const DetalleAreaCorte = sequelize.define(
  "DetalleAreaCorte",
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
    tipo: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    materia: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_corte",
    timestamps: false,
  }
);
DetalleAreaCorte.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});
export default DetalleAreaCorte;
