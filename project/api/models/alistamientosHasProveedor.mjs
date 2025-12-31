import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Proveedor from "./proveedores.mjs";
import ControlAlistamiento from "./controlAlistamiento.mjs";

const AlistamientoHasProveedor = sequelize.define(
  "AlistamientoHasProveedor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_alistamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ControlAlistamiento,
        key: "id",
      },
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proveedor,
        key: "id",
      },
    },
    id_recepcion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    producto: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    cantidad: {
      // canastilla
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    materia: {
      // Materia Prima
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rechazo: {
      // Rechazo
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maduro: {
      // Maduro
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "alistamiento_has_proveedor",
    timestamps: false,
  }
);

AlistamientoHasProveedor.belongsTo(ControlAlistamiento, {
  as: "alistamiento",
  foreignKey: "id_alistamiento",
});

AlistamientoHasProveedor.belongsTo(Proveedor, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});

export default AlistamientoHasProveedor;
