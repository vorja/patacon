import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import RegistroRecepcionMateriaPrima from "./registroRecepcionMateriaPrima.mjs";

const DetalleRecepcion = sequelize.define(
  "DetalleRecepcion",
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
        model: RegistroRecepcionMateriaPrima,
        key: "id",
      },
    },
    defecto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "defectos_recepcion",
    timestamps: false,
  }
);
DetalleRecepcion.belongsTo(RegistroRecepcionMateriaPrima, {
  as: "recepcion",
  foreignKey: "id_recepcion",
});

export default DetalleRecepcion;
