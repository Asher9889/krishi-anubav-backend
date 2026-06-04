type TCreatePostPayloadDTO = {
    name: string; location: string, state: string, district: string, knowledge: string
}

type TCreatePostDTO = {
    userId: string;
    postData: TCreatePostPayloadDTO;
    images: Express.Multer.File[];
}

export type { TCreatePostPayloadDTO, TCreatePostDTO };
