import { DataTypes } from "sequelize";
import sequelize from "../config/database.mjs";
import Usuario from "./usuarios.mjs";

const Sesion = sequelize.define(
  "Sesion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    direccion_ip: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "ERROR AL REGISTRAR",
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ERROR AL REGISTRAR",
    },
    so: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ERROR AL REGISTRAR",
    },
    dispositivo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ERROR AL REGISTRAR",
    },
    ingreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expira_en: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    salida: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "sesiones_usuarios",
    timestamps: false,
  }
);
Sesion.belongsTo(Usuario, {
  as: "usuario",
  foreignKey: "id_usuario",
});
export default Sesion;
