import { Router } from "express";
import { getForeCast } from "../controllers/forecastController.js";

const forecastRouter = Router();

forecastRouter.get("/", getForeCast);

export default forecastRouter;
