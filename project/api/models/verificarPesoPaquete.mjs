import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import verificaciones from "./verificaciones.mjs";

const VerificarPesoPaquete = sequelize.define(
  "verificarpesopaquete",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lote_produccion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipo_paquete: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    peso_paquete: {
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
    tableName: "verificacion_peso_paquete",
    timestamps: false,
  }
);

export default VerificarPesoPaquete;
