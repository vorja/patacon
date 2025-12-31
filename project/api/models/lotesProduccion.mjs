import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import RegistroAreaFritura from "./registroAreaFritura.mjs";

const LotesFritura = sequelize.define(
  "LotesFritura",
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
        model: RegistroAreaFritura,
        key: "id",
      },
    },
    fecha_produccion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lote_produccion: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad_kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "lotes_fritura",
    timestamps: false,
  }
);

LotesFritura.belongsTo(RegistroAreaFritura, {
  as: "fritura",
  foreignKey: "id_fritura",
});

export default LotesFritura;
