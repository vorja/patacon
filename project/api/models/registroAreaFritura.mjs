import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Produccion from "./produccion.mjs";
import Responsable from "./responsable.mjs";

const RegistroAreaFritura = sequelize.define(
  "RegistroAreaFritura",
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
    producto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    aforo_aceite: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lote_aceite: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    inventario_aceite: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gas_inicio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gas_final: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    inicio_fritura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fin_fritura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    migas_fritura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo_fritura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bajadas_fritura: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    materia_fritura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    canastillas: {
      type: DataTypes.INTEGER,
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
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_area_fritura",
    timestamps: false,
  },
);

RegistroAreaFritura.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
  onDelete: "CASCADE",
});

export default RegistroAreaFritura;
