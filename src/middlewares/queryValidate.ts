import { ZodObject } from "zod";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import { StatusCodes } from "http-status-codes";

const queryValidate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {

    console.log("Validating query parameters:", req.query); // Log the incoming query parameters for debugging


    const result = schema.safeParse(req.query);

    if (!result.success) {
        const errors = result.error.issues.map((error) => ({ field: error.path[0], message: error.message }));
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide valid data", errors);
    }

    // req.query = result.data as any;
    // req.validatedQuery = result.data;
    next();
};

export default queryValidate;