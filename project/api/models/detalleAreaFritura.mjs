import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import DetalleProveedor from "./detalleProveedor.mjs";
import RegistroAreaFritura from "./registroAreaFritura.mjs";

const DetalleAreaFritura = sequelize.define(
  "DetalleFritura",
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
    id_proceso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DetalleProveedor,
        key: "id",
      },
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lote_produccion: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lote_proveedor: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    peso: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    canastas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "detalle_fritura_proveedor",
    timestamps: false,
  }
);

DetalleAreaFritura.belongsTo(DetalleProveedor, {
  as: "proceso",
  foreignKey: "id_proceso",
});

DetalleAreaFritura.belongsTo(RegistroAreaFritura, {
  as: "fritura",
  foreignKey: "id_fritura",
});
export default DetalleAreaFritura;
