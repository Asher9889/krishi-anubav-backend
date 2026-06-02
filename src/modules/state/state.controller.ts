import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../utils";
import StateService from "./state.service";

class StateController {
    stateService: StateService;

    constructor(stateService: StateService) {
        this.stateService = stateService;
    }

    getStateNames = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.stateService.getStateNames();

            return ApiResponse.success(res, StatusCodes.OK, "State names fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    };
}

export default StateController;