import z from "zod";
import { getPostsSchema } from "./posts.schema";

type TCreatePostPayloadDTO = {
    name: string; location: string, state: string, district: string, knowledge: string
}

type TCreatePostDTO = {
    userId: string;
    postData: TCreatePostPayloadDTO;
    images: Express.Multer.File[];
}


type TGetPostsPayload = z.infer<typeof getPostsSchema>;
export type { TCreatePostPayloadDTO, TCreatePostDTO, TGetPostsPayload };
