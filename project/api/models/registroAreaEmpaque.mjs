import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Responsable from "./responsable.mjs";
import Produccion from "./produccion.mjs";
import Referencias from "./referencias.mjs";

const RegistroAreaEmpaque = sequelize.define(
  "Registroareaempaque",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_empaque: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lote_empaque: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numero_canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rechazo_empaque: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    migas_empaque: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_cajas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promedio_peso: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    peso_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    id_responsable: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Produccion,
        key: "id",
      },
    },
  },
  {
    tableName: "registro_area_empaque",
    timestamps: false,
  }
);
RegistroAreaEmpaque.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
  onDelete: "CASCADE",
});

export default RegistroAreaEmpaque;
