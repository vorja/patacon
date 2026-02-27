import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Responsable from "./responsable.mjs";
import OrdenProduccion from "./ordenProduccion.mjs";
import Produccion from "./produccion.mjs";

const RegistroAreaCorte = sequelize.define(
  "RegistroAreaCorte",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    inicio_corte: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    fin_corte: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_responsable: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    rechazo_corte: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rendimiento_materia: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_materia: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Produccion,
        key: "id",
      },
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_area_corte",
    timestamps: false,
  },
);
RegistroAreaCorte.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
  onDelete: "CASCADE",
});
export default RegistroAreaCorte;
