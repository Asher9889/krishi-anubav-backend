import mongoose, { Document, ObjectId } from "mongoose";
import { OCCUPATIONS, TLanguage, LANGUAGES, TOccupation, TUserRole, USER_ROLE, TUserStatus, USER_STATUS, TJwtPayloadToken } from "./user.types";
import { parsePhoneNumberFromString } from "libphonenumber-js"
import jwt from "jsonwebtoken";
import { envConfig } from "../../config";



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


userSchema.methods.generateJWTToken =  function() {
    const payload: TJwtPayloadToken = { phone: this.phone };
    if(this.role) {
        payload.role = this.role;
    }
    if(this.username){
        payload.username = this.username;
    }

    const accessToken = jwt.sign(payload, envConfig.jwtSecret, { expiresIn: "1h" });
    const secretToken = jwt.sign(payload, envConfig.jwtSecret, { expiresIn: "1d" });

    return { accessToken, secretToken };
}


const UserModel = mongoose.model<IUser>("User", userSchema);

export { UserModel, type IUser };