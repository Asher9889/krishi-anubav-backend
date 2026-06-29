import express from "express";
import queryValidate from "../../middlewares/queryValidate";
import paramsValidate from "../../middlewares/paramsValidate";
import { userController } from "./user.module";
import { checkUsernameSchema, updateUserParamsSchema, getUserParamsSchema } from "./user.schema";
import { authenticate, schemaValidate } from "../../middlewares";

const router = express.Router();

router.get("/check-username", queryValidate(checkUsernameSchema), userController.checkUsernameAvailability);
router.get("/:userId", authenticate, paramsValidate(getUserParamsSchema), userController.getUserProfile);
router.patch("/me",  authenticate,
    // paramsValidate(updateUserParamsSchema),
    //  schemaValidate(updateUserParamsSchema),
       userController.updateMe);



export default router;