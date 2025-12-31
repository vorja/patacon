import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import RegistroTemperatura from "./registroTemperatura.mjs";
import Responsable from "./responsable.mjs";
import Cuartos from "./cuartos.mjs";

const DetalleTemperatura = sequelize.define(
  "DetalleTemperatura",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha_registro: {
      type: DataTypes.DATEONLY,
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
    id_cuarto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cuartos,
        key: "id",
      },
    },
    id_registro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegistroTemperatura,
        key: "id",
      },
    },
    horario: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    temperatura: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    tableName: "detalle_temperatura",
    timestamps: false,
  }
);
DetalleTemperatura.belongsTo(RegistroTemperatura, {
  foreignKey: "id_registro",
});
DetalleTemperatura.belongsTo(Responsable, { foreignKey: "id_responsable" });
DetalleTemperatura.belongsTo(Cuartos, { foreignKey: "id_cuarto" });

export default DetalleTemperatura;
