import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Proveedor from "./proveedores.mjs";
import Responsable from "./responsable.mjs";
import Produccion from "./produccion.mjs";

const RegistroRecepcionMateriaPrima = sequelize.define(
  "RegistroRecepcionMateriaPrima",
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
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proveedor,
        key: "id",
      },
    },
    fecha_procesamiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    brix:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    producto: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    materia_recep: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lote: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    olor: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    estado_fisico: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    cumple: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    cant_defectos: {
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
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Produccion,
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
    estado_alistamiento: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
    estado_corte: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "registro_recepcion_materia_prima",
    timestamps: false,
  }
);
RegistroRecepcionMateriaPrima.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
  onDelete: "CASCADE",
});
RegistroRecepcionMateriaPrima.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
  onDelete: "CASCADE",
});

export default RegistroRecepcionMateriaPrima;
