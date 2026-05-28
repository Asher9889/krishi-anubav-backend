import mongoose, { Document, ObjectId } from "mongoose";
import { OCCUPATIONS, TLanguage, LANGUAGES, TOccupation, TUserRole, USER_ROLE, TUserStatus, USER_STATUS } from "./user.types";

interface IUser extends Document {

    username?: string // should be unique, normalized to lowercase

    phone: string

    fullName?: string

    role: TUserRole

    preferredLanguage?: TLanguage

    occupation?: TOccupation
    bio?: string

    address?: {
        line1?: string
        line2?: string

        city?: string
        district?: string

        state?: string

        postalCode?: string

        country?: string
    }

    isPhoneVerified: boolean

    status: TUserStatus,

    lastLoginAt?: Date

    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({

    username: {
        type: String,
        sparse: true, // “Only index documents where this field actually exists.”
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9_]{3,30}$/
    },

    phone: { type: String, required: true, unique: true, trim: true },

    fullName: { type: String, trim: true },

    role: { type: String, enum: Object.values(USER_ROLE), default: USER_ROLE.USER },

    preferredLanguage: { type: String, enum: Object.values(LANGUAGES) },

    occupation: { type: String, enum: Object.values(OCCUPATIONS) },

    bio: { type: String, trim: true },

    address: {
        line1: { type: String },
        line2:  { type: String },
        city: { type: String },
        district: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },

    isPhoneVerified: { type: Boolean, required: true, default: false },

    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },

    lastLoginAt: { type: Date },

}, { timestamps: true, versionKey: false });

const UserModel = mongoose.model<IUser>("User", userSchema);

export { UserModel, type IUser };