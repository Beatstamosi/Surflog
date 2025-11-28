import { Router } from "express";
import validateJWTToken from "../middlewares/validateJWTToken.js";
import {
  deleteUser,
  updateUser,
  getUserFollowing,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.use(validateJWTToken);

userRouter.put("/update", updateUser);
userRouter.delete("/delete", deleteUser);
userRouter.get("/following", getUserFollowing);

export default userRouter;
