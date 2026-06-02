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
    fullName: z.string().trim().min(1, "Full name is required"),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscore are allowed"),
    bio: z.string().trim().nullable().default(null),
    avatar: z.string().trim().nullable().default(null),
    gender: z.enum(GENDER),
    address: z.object({
        line1: z.string().trim().nullable().default(null),
        line2:  z.string().trim().nullable().default(null),

        latitude: z.number().nullable().default(null),
        longitude: z.number().nullable().default(null),
        city: z.string().trim().nullable().default(null),
        district: z.string().trim().nullable().default(null),

        state: z.string().trim().nullable().default(null),

        postalCode: z.number().nullable().default(null),

        // country: z.string().trim(),
    }),
    isProfileCompleted: z.boolean().default(false),
});

export { checkUsernameSchema, updateUserParamsSchema, updateUserSchema };