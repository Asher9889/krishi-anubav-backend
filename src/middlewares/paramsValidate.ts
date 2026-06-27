import { ZodObject } from "zod";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import { StatusCodes } from "http-status-codes";

const paramsValidate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        const errors = result.error.issues.map((error) => ({ field: error.path[0], message: error.message }));
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide valid data", errors);
    }

    req.validatedParams = result.data;
    
    next();
};

export default paramsValidate;