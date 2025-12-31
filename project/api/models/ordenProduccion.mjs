import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";

import Cliente from "./clientes.mjs";
import Responsable from "./responsable.mjs";

const OrdenProduccion = sequelize.define(
  "OrdenProduccion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numero_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    lote_contenedor: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_inicial: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_estimada: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cliente,
        key: "id",
      },
    },
    id_elaboracion: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    id_notificacion: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    id_autorizacion: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Responsable,
        key: "id",
      },
    },
    fecha_solicitud: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "ordenes_produccion",
    timestamps: false,
  }
);


OrdenProduccion.belongsTo(Cliente, { as: 'cliente', foreignKey: 'id_cliente', onDelete: 'CASCADE' });
OrdenProduccion.belongsTo(Responsable, { as: 'responsable_elaboracion', foreignKey: 'id_elaboracion', onDelete: 'CASCADE' });
OrdenProduccion.belongsTo(Responsable, { as: 'responsable_notificacion', foreignKey: 'id_notificacion', onDelete: 'CASCADE' });
OrdenProduccion.belongsTo(Responsable, { as: 'responsable_autorizacion', foreignKey: 'id_autorizacion', onDelete: 'CASCADE' });

export default OrdenProduccion;
