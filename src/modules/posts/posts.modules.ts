import PostsService from "./posts.service";
import PostsController from "./posts.controller";

const postsService = new PostsService();
const postsController = new PostsController(postsService);

export { postsController, postsService };