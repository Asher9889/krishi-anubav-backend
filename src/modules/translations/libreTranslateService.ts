import { apiEndPoints, translationApi } from "../../config";
import { TranslationResponse } from "./translation.types";


class LibreTranslationService {
    translate = async (text: string, sourceLang: string = "auto", targetLang: string) => {
        const { url, method } = apiEndPoints.translation.translate;
        const data = {
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text",
            alternatives: 2,
            // api_key: ""
        }
        // Implementation for translating text using LibreTranslate API

        const response = await translationApi.request<TranslationResponse>({
            url,
            method,
            data
        })
        const translatedText = response.data;
        return translatedText;
    }
}

export default LibreTranslationService;