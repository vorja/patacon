import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Produccion from "./produccion.mjs";
import Responsable from "./responsable.mjs";

const ControlAlistamiento = sequelize.define(
  "ControlAlistamiento",
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
    maduro: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    recipientes_desinf: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
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
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_alistamiento",
    timestamps: false,
  }
);

ControlAlistamiento.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
  onDelete: "CASCADE",
});
export default ControlAlistamiento;
