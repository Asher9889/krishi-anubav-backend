import FollowController from "./follow.controller";
import FollowService from "./follow.service";

const followService = new FollowService();
const followController = new FollowController(followService);

export { followController, followService };
