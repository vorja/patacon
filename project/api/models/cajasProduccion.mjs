import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Produccion from "./produccion.mjs";

const CajasProduccion = sequelize.define(
  "CajasProduccion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    caja: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    numero_cajas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    peso_promedio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    id_produccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Produccion,
        key: "id",
      },
    },
    // 1: pendiente, 2: en proceso, 3: finalizado

    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "caja_produccion",
    timestamps: false,
  }
);

CajasProduccion.belongsTo(Produccion, {
  as: "produccion",
  foreignKey: "id_produccion",
});
export default CajasProduccion;
