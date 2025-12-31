import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import RegistroAreaEmpaque from "./registroAreaEmpaque.mjs";

const DetalleCaja = sequelize.define(
  "DetalleCaja",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_empaque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RegistroAreaEmpaque,
        key: "id",
      },
    },
  
    caja: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_caja_empaque",
    timestamps: false,
  }
);
DetalleCaja.belongsTo(RegistroAreaEmpaque, {
  as: "empaque",
  foreignKey: "id_empaque",
});

export default DetalleCaja;
