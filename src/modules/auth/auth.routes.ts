import express from "express";
import { schemaValidate } from "../../middlewares";
import { loginSchema, registerSchema } from "./auth.schema";
import { authController } from "./auth.module";
    
const router = express.Router();

router.post("/register", schemaValidate(registerSchema),  authController.registerUser);

router.post("/login", schemaValidate(loginSchema), authController.loginUser);

export default router;