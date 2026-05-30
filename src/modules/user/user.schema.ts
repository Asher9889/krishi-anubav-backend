import z from "zod";

const checkUsernameSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters")

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
        ),
});

export { checkUsernameSchema };