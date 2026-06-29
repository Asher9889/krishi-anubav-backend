import type { updateUserSchema } from "./user.schema"
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
  FARMER: "Farmer",
  AGRONOMIST: "Agronomist",
  VETERINARIAN: "Veterinarian",
  AGRICULTURE_STUDENT: "Agriculture Student",
  RESEARCHER: "Researcher",
  AGRICULTURE_OFFICER: "Agriculture Officer",
  TRADER: "Trader",
  COMMISSION_AGENT: "Commission Agent",
  INPUT_DEALER: "Input Dealer",
  FARM_CONSULTANT: "Farm Consultant",
  DAIRY_FARMER: "Dairy Farmer",
  POULTRY_FARMER: "Poultry Farmer",
  HORTICULTURE_FARMER: "Horticulture Farmer",
  OTHER: "Other",
} as const;

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
    id: string;
    phone: string;
    role?: string;
}

type TUserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
type TLanguage = typeof LANGUAGES[keyof typeof LANGUAGES];
type TOccupation = typeof OCCUPATIONS[keyof typeof OCCUPATIONS];
type TUserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
type TGender = typeof GENDER[keyof typeof GENDER];

type TUpdateUserRequest = z.infer<typeof updateUserSchema>;

type TUserPublicProfileResponse = {
    id: string;
    fullName: string;
    name: string | null;
    username: string;
    bio: string;
    occupation: string | null;
    avatar: string | null;
    state: string | null;
    city: string | null;
    district: string | null;
    village: string | null;
    postsCount: number;
    followersCount: number;
    followingCount: number;
}

export { USER_ROLE, LANGUAGES, OCCUPATIONS, USER_STATUS, GENDER, type TJwtPayloadToken, type TUserRole, type TLanguage, type TOccupation, type TUserStatus, type TGender, type TUpdateUserRequest, type TUpdateUserParams, type TUserProfileResponse, type TUserPublicProfileResponse }