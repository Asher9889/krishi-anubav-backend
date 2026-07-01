import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../utils";
import TranslationService from "./translation.service";

class TranslationController {
    private translationService: TranslationService;

    constructor(translationService: TranslationService) {
        this.translationService = translationService;
    }

    translate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { text, targetLanguage } = req.body;
            const result = await this.translationService.translate(text, targetLanguage);
            return ApiResponse.success(res, StatusCodes.OK, "Translation successful", result);
        } catch (error) {
            return next(error);
        }
    }

    batchTranslate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { texts, targetLanguage } = req.body;
            const result = await this.translationService.batchTranslate(texts, targetLanguage);
            return ApiResponse.success(res, StatusCodes.OK, "Batch translation successful", result);
        } catch (error) {
            return next(error);
        }
    }
}

export default TranslationController;
