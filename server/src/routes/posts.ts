import { Router } from "express";
import validateJWTToken from "../middlewares/validateJWTToken.js";
import {
  getAllUserPosts,
  likePost,
  unlikePost,
  unsavePost,
  savePost,
  addComment,
  getAllFeedPosts,
} from "../controllers/postsController.js";

const postsRouter = Router();

postsRouter.use(validateJWTToken);

postsRouter.get("/user/all", getAllUserPosts);
postsRouter.delete("/:postId/unlike", unlikePost);
postsRouter.post("/:postId/like", likePost);
postsRouter.delete("/:postId/unsave", unsavePost);
postsRouter.post("/:postId/save", savePost);
postsRouter.post("/:postId/comments", addComment);
postsRouter.get("/feed/all", getAllFeedPosts);

export default postsRouter;
