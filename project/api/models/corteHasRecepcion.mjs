import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import registroAreaCorte from "./registroAreaCorte.mjs";

const CorteHasProveedor = sequelize.define(
  "corteHasRecepcion",
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
        model: registroAreaCorte,
        key: "id",
      },
    },
    id_recepcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "corte_has_recepcion",
    timestamps: false,
  }
);

CorteHasProveedor.belongsTo(CorteHasProveedor, {
  as: "corte",
  foreignKey: "id_corte",
});

export default CorteHasProveedor;
