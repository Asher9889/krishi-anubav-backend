import z, { ZodObject} from "zod";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import { StatusCodes } from "http-status-codes";


const schemaValidate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    console.log("Validating request body:", req.body); // Log the request body for debugging
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((error) => ({ field: error.path[0], message: error.message }))
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide valid data", errors);
    }
    req.body = result.data;
    next();
};


export default schemaValidate;