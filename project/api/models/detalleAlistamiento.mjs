import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import ControlAlistamiento from "./controlAlistamiento.mjs";
import Responsable from "./responsable.mjs";

const DetalleAlistamiento = sequelize.define(
  "DetalleAlistamiento",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_pelador: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    cantidades: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totales: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    maduro: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    id_alistamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ControlAlistamiento,
        key: "id",
      },
    },
  },
  {
    tableName: "detalle_alistamiento",
    timestamps: false,
  }
);
DetalleAlistamiento.belongsTo(Responsable, {
  as: "pelador",
  foreignKey: "id_pelador",
});

export default DetalleAlistamiento;
