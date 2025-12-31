import {
  create,
  getAll,
  getById,
  update,
  statusDelete,
  getList,
} from "../../services/proveedoresService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
  try {
    const { body: data } = req;
    const nuevoProveedor = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoProveedor,
      "Proveedor registrado exitosamente."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const proveedores = await getAll();

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      proveedores,
      "Lista de Proveedores."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

export const getProveedoresLista = async (req, res) => {
  try {
    const proveedores = await getList();

    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      proveedores,
      "Lista de Proveedores."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
// Obtener un proveedor por ID
export const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      data,
      "Proveedor disponible."
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Actualizar un proveedor por ID
export const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { body: data } = req;
    const actualizado = await update(id, data);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Proveedor actualizado correctamente"
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};

// Eliminar un proveedor por ID
export const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Proveedor eliminado");
  } catch (error) {
    console.log(error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
