import { Languages } from "./translation.constant";


export type TLanguages = typeof Languages[keyof typeof Languages];

export interface TranslationResponse {
    alternatives: string[];
    translatedText: string;
}

export interface TranslateResult {
    translatedText: string;
}

export interface BatchTranslateResult {
    translations: TranslateResult[];
}
