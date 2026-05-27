import { registerSchema } from "./auth.schema";
import { Request } from "express";
import z from "zod";


type TRegister = z.infer<typeof registerSchema>;


// make `user` optional so handlers remain compatible with Express Request type
type AuthRequest = Request & { user?: { userId: string } };

export type { TRegister, AuthRequest };  