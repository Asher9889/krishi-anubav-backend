import z from "zod";

const getPostsSchema = z.object({
    pagination: z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(10),
    }),
    filters: z.object({
        location: z.string().optional(),
        state: z.string().optional(),
        district: z.string().optional(),
    }).optional(),
})


export { getPostsSchema };