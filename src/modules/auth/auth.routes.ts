import express from "express";
import { schemaValidate } from "../../middlewares";
import { loginSchema, registerSchema, sendOTPSchema } from "./auth.schema";
import { authController } from "./auth.module";
    
const router = express.Router();

router.post("/send-otp", schemaValidate(sendOTPSchema), authController.sendOTP);
// router.post("/verify-otp", authController.verifyOTP);
router.post("/register", schemaValidate(registerSchema),  authController.registerUser);

router.post("/login", schemaValidate(loginSchema), authController.loginUser);

export default router;