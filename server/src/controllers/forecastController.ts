import { Request, Response } from "express";
import { getSurfReport } from "../utils/getSurfReport.js";
import handleError from "../services/handleError.js";
import createSessionDateString from "../utils/createSessionDateString.js";

const getForeCast = async (req: Request, res: Response) => {
  const { spotName, startTimeSession } = req.query;

  try {
    if (!spotName || !startTimeSession)
      throw Error("Missing Spot or start time.");

    const sessionStart = createSessionDateString(startTimeSession as string);

    const report = await getSurfReport(sessionStart, spotName as string);

    res.status(201).json({ report });
  } catch (err) {
    handleError(err, res);
  }
};

export { getForeCast };
