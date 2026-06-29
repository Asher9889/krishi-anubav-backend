import express from "express";
import queryValidate from "../../middlewares/queryValidate";
import { userController } from "./user.module";
import { checkUsernameSchema, updateUserParamsSchema } from "./user.schema";
import { authenticate, schemaValidate } from "../../middlewares";

const router = express.Router();

router.get("/check-username", queryValidate(checkUsernameSchema), userController.checkUsernameAvailability);
router.patch("/me",  authenticate,
    // paramsValidate(updateUserParamsSchema),
     schemaValidate(updateUserParamsSchema),
      userController.updateMe);

     

export default router;