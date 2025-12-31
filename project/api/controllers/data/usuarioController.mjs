import {
  create,
  getAll,
  getById,
  update,
  statusDelete,
} from "../../services/usuariosService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const createUsuario = async (req, res) => {
  try {
    const usuario = await create(req.body);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      usuario,
      "Usuario registrado correctamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      usuarios,
      "Lista de Usuarios."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getById(id);
    return sendResponse(res, StatusCodes.SUCCESS, data, "Usuario Encontrado.");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const dataUpdate = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      dataUpdate,
      "Usuario Actualizado Correctamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
export const statusUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await statusDelete(id);
    return sendResponse(
      res,
      StatusCodes.DELETED,
      null,
      data,
      "Usuario eliminado"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
