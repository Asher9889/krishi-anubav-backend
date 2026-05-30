import express from "express";
import queryValidate from "../../middlewares/queryValidate";
import { userController } from "./user.module";
import { checkUsernameSchema } from "./user.schema";

const router = express.Router();

router.get("/check-username", queryValidate(checkUsernameSchema), userController.checkUsernameAvailability);

export default router;