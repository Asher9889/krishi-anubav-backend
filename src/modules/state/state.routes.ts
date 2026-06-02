import express from "express";
import { stateController } from "./state.module";

const router = express.Router();

router.get("/", stateController.getStateNames);

export default router;