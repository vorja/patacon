import {
  create,
  getAll,
  getById,
  update,
  statusDelete,
} from "../../services/clienteService.mjs";
import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

// Crear un nuevo Cliente
export const createCliente = async (req, res) => {
  try {
    const { body: data } = req;
    const nuevoCliente = await create(data);
    return sendResponse(
      res,
      StatusCodes.CREATED,
      nuevoCliente,
      "Cliente registrado exitosamente."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

// Obtener todos los Cliente
export const getClientes = async (req, res) => {
  try {
    const clientes = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      clientes,
      "Lista de clientes disponibles"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

// Obtener un Cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getById(id);
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      cliente,
      "Cliente encontrado."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

// Actualizar un Cliente por ID
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const actualizado = await update(id, body);
    return sendResponse(
      res,
      StatusCodes.UPDATED,
      actualizado,
      "Cliente actualizado correctamente"
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};

// Eliminar un Cliente por ID
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await statusDelete(id);
    return sendResponse(res, StatusCodes.DELETED, null, "Cliente eliminado.");
  } catch (error) {
    console.log("Error", error);
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      null,
     `${error}`
    );
  }
};
