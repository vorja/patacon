import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Responsable from "./responsable.mjs";

const Produccion = sequelize.define(
  "Produccion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lote_produccion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    fecha_creacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_cierre: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    numero_cajas: {
      type: DataTypes.INTEGER,
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
    // 1: pendiente, 2: en proceso, 3: finalizado
    estado_sincronizado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "producciones",
    timestamps: false,
  }
);
Produccion.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
});
export default Produccion;
