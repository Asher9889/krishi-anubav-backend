import express from "express";
import schemaValidate from "../../middlewares/schemaValidate";
import queryValidate from "../../middlewares/queryValidate";
import paramsValidate from "../../middlewares/paramsValidate";
import { userController } from "./user.module";
import { checkUsernameSchema, updateUserParamsSchema, updateUserSchema } from "./user.schema";

const router = express.Router();

router.get("/check-username", queryValidate(checkUsernameSchema), userController.checkUsernameAvailability);
router.patch("/:id", paramsValidate(updateUserParamsSchema), schemaValidate(updateUserSchema), userController.updateUser);

export default router;