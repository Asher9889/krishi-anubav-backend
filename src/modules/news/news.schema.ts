import z from "zod";


const newsIdSchema = z.object({
    id: z.string().trim().min(1, "News id is required")
});


export { newsIdSchema };