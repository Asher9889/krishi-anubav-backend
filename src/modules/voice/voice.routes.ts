import express from "express";
import { authenticate } from "../../middlewares";
import { voiceController } from "./voice.module";


const router = express.Router();


router.post("/session", authenticate, voiceController.startSession);


export default router;