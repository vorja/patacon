import { getAll } from "../../services/materiaService.mjs";

import { sendResponse, StatusCodes } from "../../helpers/statusCode.mjs";

export const getItems = async (req, res) => {
  try {
    const items = await getAll();
    return sendResponse(
      res,
      StatusCodes.SUCCESS,
      items,
      "Invetario de Materia Prima."
    );
  } catch (error) {
    console.log("Error", error);
    return sendResponse(res, StatusCodes.NOT_FOUND, null, `${error}`);
  }
};
