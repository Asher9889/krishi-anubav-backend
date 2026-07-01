import mongoose from "mongoose";

interface Translation {
    text: string;
    provider: string;
}

interface TranslationDocument extends mongoose.Document {
    text: string;
    normalizedText: string;
    translations: Map<string, Translation>;
}

const translationSchema = new mongoose.Schema<TranslationDocument>({
    text: { type: String, required: true },
    normalizedText: { type: String, required: true },
    translations: {
        type: Map,
        of: new mongoose.Schema({
            text: { type: String, required: true },
            provider: { type: String, required: true },
        }, { _id: false, versionKey: false, timestamps: false }),
    },
}, { timestamps: true, versionKey: false });

translationSchema.index({ normalizedText: 1 }, { unique: true });

const TranslationModel = mongoose.model<TranslationDocument>("Translation", translationSchema);

export default TranslationModel;