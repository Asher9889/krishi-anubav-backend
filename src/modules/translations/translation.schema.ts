import { z } from "zod";
import { TLanguages } from "./translation.types";
import { Languages } from "./translation.constant";


const translateSchema = z.object({
    text: z.string().min(1, "Text is required"),
    sourceLanguage: z.enum(Object.values(Languages), `Source language must be one of: ${Object.values(Languages).join(", ")}`).default("auto"),
    targetLanguage: z.enum(Object.values(Languages), `Target language must be one of: ${Object.values(Languages).join(", ")}`),
});

const batchTranslateSchema = z.object({ 
    texts: z.array(z.string().min(1)).min(1, "At least one text is required").max(50, "Maximum 50 texts allowed per batch"),
    targetLanguage: z.string().min(2, "Language code must be at least 2 characters").max(10, "Language code is too long"),
});

export { translateSchema, batchTranslateSchema };
