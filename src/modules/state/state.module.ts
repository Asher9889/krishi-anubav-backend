import StateController from "./state.controller";
import StateService from "./state.service";

const stateService = new StateService();
const stateController = new StateController(stateService);

export { stateService, stateController };