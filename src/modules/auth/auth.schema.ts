import z from "zod";

const loginSchema = z.object({
    email: z.email().lowercase().trim(),
    password: z.string(),
});

const registerSchema = z.object({
    email: z.email().lowercase().trim(),
    password: z.string(),
    name: z.string().min(1, "Name is required").trim()
})

export {loginSchema, registerSchema}; 