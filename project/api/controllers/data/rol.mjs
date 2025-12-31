import {
  crearRol,
  obtenerRolesActivos,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
  obtenerRolesMod,
} from "../../services/rolService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const createRol = async (req, res) => {
  try {
    const { body: data } = req;
    const nuevoRol = await crearRol(data);

    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoRol,
      "Rol creado exitosamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await obtenerRolesActivos();
    return sendResponse(res, StatusCodes.SUCCESS, roles, "Lista de Roles.");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRolesMod = async (req, res) => {
  try {
    const roles = await obtenerRolesMod();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      roles,
      "Lista de Roles Disponibles"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await obtenerRolPorId(id);
    return sendResponse(res, StatusCodes.SUCCESS, rol, "Rol Disponible");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const actualizado = await actualizarRol(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Rol actualizado correctamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await eliminarRol(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Rol eliminado");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
