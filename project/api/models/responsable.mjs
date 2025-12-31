import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import rol from "./rol.mjs";

const Responsable = sequelize.define(
  "Responsable",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    identificacion: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_rol: {
      type: DataTypes.TINYINT,
      allowNull: false,
      references: {
        model: rol,
        key: "id",
      },
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    actualizado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1, // 1 for active, 0 for inactive
    },
  },
  {
    tableName: "empleados",
    timestamps: false,
  }
);

Responsable.belongsTo(rol, {
  foreignKey: "id_rol",
  onDelete: "CASCADE",
});

export default Responsable;
