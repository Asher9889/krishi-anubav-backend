import z from "zod";
import { parsePhoneNumberFromString, type PhoneNumber } from "libphonenumber-js";

const loginSchema = z.object({
    email: z.email().lowercase().trim(),
    password: z.string(),
});


const sendOTPSchema = z.object({
    phone: z.string().refine((value) => {
        const phoneNumber = parsePhoneNumberFromString(value, "IN");
        return phoneNumber?.isValid() || false;
    }, { message: "Please provide a valid phone number." }).transform((value) => {
        const phoneNumber = parsePhoneNumberFromString(value, "IN");
        return phoneNumber?.number; // default to E.164 format, e.g., +919876543210
    })
});

const verifyOTPSchema = z.object({
    phone: z.string().refine((value) => {
        const phoneNumber = parsePhoneNumberFromString(value, "IN");
        return phoneNumber?.isValid() || false;
    }, { message: "Please provide a valid phone number." }).transform((value) => {
        const phoneNumber = parsePhoneNumberFromString(value, "IN");
        return phoneNumber?.number;
    }),
    reqId: z.string({error: "Request ID is required"}),
    otp: z.string().length(4, { error: "OTP must be 4 digits" }),
})



const registerSchema = z.object({
    email: z.email().lowercase().trim(),
    password: z.string(),
    name: z.string().min(1, "Name is required").trim()
})

export { loginSchema, registerSchema, sendOTPSchema, verifyOTPSchema }; 