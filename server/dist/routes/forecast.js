import { Router } from "express";
import { getForeCast } from "../controllers/forecastController.js";
import validateJWTToken from "../middlewares/validateJWTToken.js";
const forecastRouter = Router();
forecastRouter.use(validateJWTToken);
forecastRouter.get("/", getForeCast);
export default forecastRouter;
