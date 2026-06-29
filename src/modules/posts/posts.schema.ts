import z from "zod";

const getPostsSchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    userId: z.string().optional(),
})

 
export { getPostsSchema };