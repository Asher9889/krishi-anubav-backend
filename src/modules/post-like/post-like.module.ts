import PostLikeController from "./post-like.controller";
import PostLikeService from "./post-like.service";

const postLikeService = new PostLikeService();
const postLikeController = new PostLikeController(postLikeService);

export { postLikeController, postLikeService };
