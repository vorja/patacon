import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import rol from "./rol.mjs";

const Usuarios = sequelize.define(
  "Usuarios",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
    tableName: "usuarios",
    timestamps: false,
  }
);

Usuarios.belongsTo(rol, {
  foreignKey: "id_rol",
  onDelete: "CASCADE",
});

export default Usuarios;
