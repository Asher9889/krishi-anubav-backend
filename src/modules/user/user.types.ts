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
  AGRI_EXPERT: 'AGRI_EXPERT',
  TRADER: 'TRADER',
  VENDOR: 'VENDOR',
  AGRI_WORKER: 'AGRI_WORKER',
  OTHER: 'OTHER',
} as const

type TJwtPayloadToken = {
    phone: string;
    role?: string;
}

type TUserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
type TLanguage = typeof LANGUAGES[keyof typeof LANGUAGES];
type TOccupation = typeof OCCUPATIONS[keyof typeof OCCUPATIONS];
type TUserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export { USER_ROLE, LANGUAGES, OCCUPATIONS, USER_STATUS, type TJwtPayloadToken, type TUserRole, type TLanguage, type TOccupation, type TUserStatus }