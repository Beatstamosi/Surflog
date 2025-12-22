import { Router } from "express";
import validateJWTToken from "../middlewares/validateJWTToken.js";
import { getAllUserPosts, likePost, unlikePost, unsavePost, savePost, addComment, getAllFeedPosts, getLikedFeedPosts, getSavedFeedPosts, getFollowingFeedPosts, getSinglePost, } from "../controllers/postsController.js";
const postsRouter = Router();
// no validation needed as it is a shared public link
postsRouter.get("/:postId", getSinglePost);
postsRouter.use(validateJWTToken);
postsRouter.get("/user/all", getAllUserPosts);
postsRouter.delete("/:postId/unlike", unlikePost);
postsRouter.post("/:postId/like", likePost);
postsRouter.delete("/:postId/unsave", unsavePost);
postsRouter.post("/:postId/save", savePost);
postsRouter.post("/:postId/comments", addComment);
postsRouter.get("/feed/all", getAllFeedPosts);
postsRouter.get("/feed/liked", getLikedFeedPosts);
postsRouter.get("/feed/saved", getSavedFeedPosts);
postsRouter.get("/feed/following", getFollowingFeedPosts);
export default postsRouter;
