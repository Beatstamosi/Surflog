import { Router } from "express";
import validateJWTToken from "../middlewares/validateJWTToken.js";
import { getBoardsOfUser, addBoardToUserQuiver, deleteBoard, } from "../controllers/boardsController.js";
const boardsRouter = Router();
boardsRouter.use(validateJWTToken);
boardsRouter.get("/user", getBoardsOfUser);
boardsRouter.post("/user", addBoardToUserQuiver);
boardsRouter.delete("/", deleteBoard);
export default boardsRouter;
