import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import StateModel from "./state.model";
import { TStateNamesResponse } from "./state.types";

class StateService {
    getStateNames = async (): Promise<TStateNamesResponse> => {
        try {
            const stateNames = await StateModel.distinct("state");

            return {
                states: stateNames.sort((first, second) => first.localeCompare(second)),
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch state names");
        }
    };
}

export default StateService;