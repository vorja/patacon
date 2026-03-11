import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Responsable from "./responsable.mjs";
const verificaciones = sequelize.define(
  "verificaciones",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_verificacion: {
      type: DataTypes.DATE,
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
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "verificaciones_empaque",
    timestamps: false,
  }
);

verificaciones.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
});

export default verificaciones;
