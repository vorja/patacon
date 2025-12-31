import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Recepcion from "./resgistroRecepcionOp.mjs";

const DetalleRecepcionOp = sequelize.define(
  "DetalleRecepcionOp",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_recepcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Recepcion,
        key: "id",
      },
    },
    canastilla: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    peso: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_recepcion_pesaje",
    timestamps: false,
  }
);

export default DetalleRecepcionOp;
