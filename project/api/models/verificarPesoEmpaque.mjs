import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import verificaciones from "./verificaciones.mjs";

const VerificarPesoEmpaque = sequelize.define(
  "verificarpesoempaque",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lote_empaque: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipo_caja: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    peso_caja: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    id_verificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: verificaciones,
        key: "id",
      },
    },
  },
  {
    tableName: "verificacion_peso_empaque",
    timestamps: false,
  }
);

export default VerificarPesoEmpaque;
