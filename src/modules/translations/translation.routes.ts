import express from "express";
import { schemaValidate } from "../../middlewares";
import { translationController } from "./translation.module";
import { translateSchema, batchTranslateSchema } from "./translation.schema";

const router = express.Router();

router.post("/", schemaValidate(translateSchema), translationController.translate);

// router.post("/detect", schemaValidate(detectLanguageSchema), translationController.detectLanguage);

router.post("/batch-translate", schemaValidate(batchTranslateSchema), translationController.batchTranslate);

export default router;
