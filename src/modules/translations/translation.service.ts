import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { logger } from "../../config";
import LibreTranslationService from "./libreTranslateService";
import TranslationModel from "./translation.model";
import { TranslateResult, BatchTranslateResult, TLanguages } from "./translation.types";
import { languageRegex } from "../../shared";

class TranslationService {
    private libreTranslateService: LibreTranslationService;

    constructor(libreTranslateService: LibreTranslationService) {
        this.libreTranslateService = libreTranslateService;
    }

    translate = async (text: string, targetLanguage: TLanguages): Promise<TranslateResult> => {
        try {
            const normalizedText = text.trim().toLowerCase();

            const existing = await TranslationModel.findOne({ normalizedText });

            if (existing) {
                const cached = existing.translations.get(targetLanguage);
                if (cached) {
                    logger.info(`Translation DB hit for "${text}" -> ${targetLanguage}`);
                    return { translatedText: cached.text};
                }
            }

            const result = await this.libreTranslateService.translate(text, "auto", targetLanguage);
            const isHindi = languageRegex.containsHindi(result.translatedText);
            const alternatives = result.alternatives[0];

            console.log(`Translation result for "${text}" -> ${targetLanguage}: ${result.translatedText}, isHindi: ${isHindi}, alternatives: ${alternatives}`);

            const translatedText = isHindi ? result.translatedText : alternatives ?? "";

            if (existing) {
                existing.translations.set(targetLanguage, {
                    text: translatedText,
                    provider: "libre",
                });
                await existing.save();
            } else {
                const translations = new Map<string, { text: string; provider: string }>();
                translations.set(targetLanguage, {
                    text: translatedText,
                    provider: "libre",
                });

                try {
                    await TranslationModel.create({
                        text,
                        normalizedText,
                        translations,
                    });
                } catch (createError: any) {
                    if (createError?.code === 11000) {
                        const doc = await TranslationModel.findOne({ normalizedText });
                        if (doc) {
                            doc.translations.set(targetLanguage, {
                                text: translatedText,
                                provider: "libre",
                            });
                            await doc.save();
                        }
                    } else {
                        throw createError;
                    }
                }
            }

            logger.info(`Translation saved: "${text}" -> "${translatedText}" (${targetLanguage})`);
            return { translatedText };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to translate text");
        }
    }

    batchTranslate = async (texts: string[], targetLanguage: TLanguages): Promise<BatchTranslateResult> => {
        try {
            const results = await Promise.all(
                texts.map((text) => this.translate(text, targetLanguage))
            );
            return { translations: results };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to batch translate texts");
        }
    }
}

export default TranslationService;
