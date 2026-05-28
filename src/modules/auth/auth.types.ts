import { registerSchema, sendOTPSchema, verifyOTPSchema } from "./auth.schema";
import { Request } from "express";
import z from "zod";


type TRegister = z.infer<typeof registerSchema>;
type TSendOTP = z.infer<typeof sendOTPSchema>;
type TVerifyOTP = z.infer<typeof verifyOTPSchema>;

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

// make `user` optional so handlers remain compatible with Express Request type
type AuthRequest = Request & { user?: { userId: string } };

export type { TRegister, TSendOTP, TVerifyOTP, TVerifyOTPResponse, AuthRequest };  