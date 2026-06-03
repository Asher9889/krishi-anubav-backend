import { refreshTokenSchema, registerSchema, sendOTPSchema, verifyOTPSchema } from "./auth.schema";
import { Request } from "express";
import z from "zod";
import { TGender } from "../user/user.types";


type TRegister = z.infer<typeof registerSchema>;
type TSendOTP = z.infer<typeof sendOTPSchema>;
type TVerifyOTP = z.infer<typeof verifyOTPSchema>;
type TRefreshToken = z.infer<typeof refreshTokenSchema>;

type TVerifyOTPResponse = {
    user: {
        id: string;
        phone: string;
    },
    tokens: {
        accessToken: string;
        refreshToken: string;
    }
}

type MeResponse = {
    id: string;
    phone: string;
    fullName: string | null;
    username: string | null;
    avatar: string | null;
    bio: string | null;
    gender: TGender | null;
    occupation: string | null;
    village: string | null;
    district: string | null;
    state: string | null;
    createdAt: Date;
    role: string;
}

// make `user` optional so handlers remain compatible with Express Request type
type AuthRequest = Request & { user?: { phone: string; role: string } };

export type { TRegister, TSendOTP, TVerifyOTP, TVerifyOTPResponse, TRefreshToken, MeResponse, AuthRequest };