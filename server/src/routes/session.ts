import { Router } from "express";
import validateJWTToken from "../middlewares/validateJWTToken.js";
import { addSession } from "../controllers/sessionController.js";

const sessionRouter = Router();

sessionRouter.use(validateJWTToken);

sessionRouter.post("/", addSession);

export default sessionRouter;
