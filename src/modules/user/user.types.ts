import { updateUserSchema } from "./user.schema"
import { z } from "zod";

const USER_ROLE = {
    ADMIN: "ADMIN",
    USER: "USER",
} as const

const USER_STATUS = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED",
    SUSPENDED: "SUSPENDED",
} as const

const LANGUAGES = {
    ENGLISH: "en",
    HINDI: "hi",
} as const




const OCCUPATIONS = {
    FARMER: 'FARMER',
    AGRONOMIST: "agronomist",
    VETERINARIAN: "veterinarian",
    RESEARCHER: "researcher",
    STUDENT: "student",
    DEALER: "dealer",
    AGRI_EXPERT: 'AGRI_EXPERT',
    TRADER: 'TRADER',
    VENDOR: 'VENDOR',
    AGRI_WORKER: 'AGRI_WORKER',
    OTHER: 'OTHER',
} as const

const GENDER = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER"
} as const


type TUpdateUserParams = {
    id: string;
}

type TUserProfileResponse = {
    id: string;
    fullName: string;
    username: string;
    bio: string;
    avatar: string | null;
    gender: TGender;
    isProfileCompleted: boolean;
    phone: string;
    address: {
        line1: string | null;
        line2: string | null;

        latitude: number | null;
        longitude: number | null;
        city: string | null;
        district: string | null;

        state: string | null;
    }
}

type TJwtPayloadToken = {
    phone: string;
    role?: string;
}

type TUserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
type TLanguage = typeof LANGUAGES[keyof typeof LANGUAGES];
type TOccupation = typeof OCCUPATIONS[keyof typeof OCCUPATIONS];
type TUserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
type TGender = typeof GENDER[keyof typeof GENDER];

type TUpdateUserRequest = z.infer<typeof updateUserSchema>;

export { USER_ROLE, LANGUAGES, OCCUPATIONS, USER_STATUS, GENDER, type TJwtPayloadToken, type TUserRole, type TLanguage, type TOccupation, type TUserStatus, type TGender, type TUpdateUserRequest, type TUpdateUserParams, type TUserProfileResponse }