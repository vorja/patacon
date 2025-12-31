import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import registroAreaFritura from "./registroAreaFritura.mjs";

const FrituraHasRecepcion = sequelize.define(
  "FrituraHasRecepcion",
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
        model: registroAreaFritura,
        key: "id",
      },
    },
    id_recepcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "fritura_has_recepcion",
    timestamps: false,
  }
);

FrituraHasRecepcion.belongsTo(registroAreaFritura, {
  as: "fritura",
  foreignKey: "id_fritura",
});

export default FrituraHasRecepcion;
