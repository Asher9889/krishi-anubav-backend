import express from "express";
import schemaValidate from "../../middlewares/schemaValidate";
import queryValidate from "../../middlewares/queryValidate";
import paramsValidate from "../../middlewares/paramsValidate";
import { userController } from "./user.module";
import { checkUsernameSchema, updateUserParamsSchema, updateUserSchema } from "./user.schema";
import { authenticate } from "../../middlewares";

const router = express.Router();

router.get("/check-username", queryValidate(checkUsernameSchema), userController.checkUsernameAvailability);
router.patch("/me",  authenticate,
    // paramsValidate(updateUserParamsSchema),
     schemaValidate(updateUserSchema), userController.updateMe);

export default router;