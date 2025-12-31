import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Produccion from "./produccion.mjs";

const Configuracion = sequelize.define(
  "Configuracion",
  {
    orden_actual: {
      type: DataTypes.INTEGER,
      references: {
        model: Produccion,
        key: 'id',
      },
    },
  },
  {
    tableName: "configuracion_aplicacion",
    timestamps: false,
  }
);
Configuracion.belongsTo(Produccion, {
  as: "produccion",
  foreignKey: "orden_actual",
});
export default Configuracion;