import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import ProveedorInsumo from "./proveedoresInsumos.mjs";
import Inventario from "./inventarioInsumos.mjs";
import Responsable from "./responsable.mjs";

const Insumo = sequelize.define(
  "Insumos",
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
    fechaVencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_item: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    defectos: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cantidad_def: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProveedorInsumo,
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
    lote: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    olor: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    estado_fisico: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "registro_insumo",
    timestamps: false,
  }
);

Insumo.belongsTo(ProveedorInsumo, {
  as: "proveedor",
  foreignKey: "id_proveedor",
});
Insumo.belongsTo(Responsable, {
  as: "responsable",
  foreignKey: "id_responsable",
});

export default Insumo;
