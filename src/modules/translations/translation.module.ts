import LibreTranslationService from "./libreTranslateService";
import TranslationController from "./translation.controller";
import TranslationService from "./translation.service";

const libreTranslationService = new LibreTranslationService();
const translationService = new TranslationService(libreTranslationService);
const translationController = new TranslationController(translationService);

export { translationController, translationService };
