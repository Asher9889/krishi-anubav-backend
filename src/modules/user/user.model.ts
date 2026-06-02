import mongoose, { Document, ObjectId } from "mongoose";
import { OCCUPATIONS, TLanguage, LANGUAGES, TOccupation, TUserRole, USER_ROLE, TUserStatus, USER_STATUS, TJwtPayloadToken, GENDER, TGender } from "./user.types";
import { parsePhoneNumberFromString } from "libphonenumber-js"
import jwt from "jsonwebtoken";
import { envConfig } from "../../config";



interface IUser extends Document {

    username?: string // should be unique, normalized to lowercase

    phone: string

    fullName?: string

    role: TUserRole

    gender?: TGender

    avatar?: string | null

    isProfileCompleted?: boolean

    preferredLanguage?: TLanguage

    occupation?: TOccupation
    bio?: string | null

    address?: {
        line1?: string | null
        line2?: string | null

        latitude?: number | null
        longitude?: number | null
        city?: string | null
        district?: string | null

        state?: string | null

        postalCode?: string | null

        country?: string | null
    }

    isPhoneVerified: boolean

    status: TUserStatus,

    lastLoginAt?: Date

    createdAt: Date
    updatedAt: Date
    generateJWTToken: () => { accessToken: string; refreshToken: string };
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

    phone: { type: String, required: true, unique: true, trim: true, validate: (value:string) => {
        const phoneNumber = parsePhoneNumberFromString(value, 'IN');
        return phoneNumber && phoneNumber.isValid();
    } },

    fullName: { type: String, trim: true },

    role: { type: String, enum: Object.values(USER_ROLE), default: USER_ROLE.USER },

    avatar: { type: String, trim: true},

    gender: {type: String, enum: Object.values(GENDER) },

    isProfileCompleted: { type: Boolean, default: false },

    preferredLanguage: { type: String, enum: Object.values(LANGUAGES) },

    occupation: { type: String, enum: Object.values(OCCUPATIONS) },

    bio: { type: String, trim: true },

    address: {
        line1: { type: String },
        line2:  { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        city: { type: String },
        district: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, default: "India" },
    },

    isPhoneVerified: { type: Boolean, required: true, default: false },

    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },

    lastLoginAt: { type: Date },

}, { timestamps: true, versionKey: false });


userSchema.methods.generateJWTToken =  function() {
    const payload: TJwtPayloadToken = {
        phone: this.phone,
        role: this.role,
    };

    const accessToken = jwt.sign(payload, envConfig.jwtAccessTokenSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, envConfig.jwtRefreshTokenSecret, { expiresIn: "1d" });

    return { accessToken, refreshToken };
}


const UserModel = mongoose.model<IUser>("User", userSchema);

export { UserModel, type IUser };