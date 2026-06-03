import z from "zod";
import { GENDER } from "./user.types";
import mongoose from "mongoose";
import { UserModel } from "./user.model";

const usernameSchema = z.string().trim().toLowerCase().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters")
    .refine(
        (value) => /^[a-z0-9_]+$/.test(value),
        {
            message:
                "Only lowercase letters, numbers and underscore are allowed",
        }
    )
    .refine(
        (value) => /^[a-z]/.test(value),
        {
            message:
                "Username must start with a letter",
        }
    )

const IdScheme = z.string().trim().min(1, "User id is required").refine((value) => {
    const isValidObjectId = mongoose.isValidObjectId(value);
    return isValidObjectId;
}, {error: "Invalid user id format"});

const checkUsernameSchema = z.object({
    username: usernameSchema,
});
const updateUserParamsSchema = z.object({
    id: IdScheme
});

const updateUserSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required").optional(),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscore are allowed").optional(),
    bio: z.string().trim().nullable().optional(),
    avatar: z.string().trim().nullable().optional(),
    gender: z.enum(GENDER).optional(),
    occupation: z.string().trim().optional(),
    address: z.object({
        line1: z.string().trim().optional(),
        line2:  z.string().trim().optional(),

        latitude: z.number().optional(),
        longitude: z.number().optional(),
        city: z.string().trim().optional(),
        district: z.string().trim().optional(),

        state: z.string().trim().optional(),

        postalCode: z.number().optional(),

        // country: z.string().trim(),
    }).optional(),
    isProfileCompleted: z.boolean().default(false),
});

export { checkUsernameSchema, updateUserParamsSchema, updateUserSchema };