import { Request, Response } from "express";
import { getSurfReport } from "./getSurfReport.js";
import handleError from "../services/handleError.js";

const getForeCast = async (req: Request, res: Response) => {
  const spot = "Popoyo";
  const sessionStart = "2025-11-03 08:00";

  try {
    const report = await getSurfReport(sessionStart, spot);
    console.log(JSON.stringify(report, null, 2));

    res.status(201).json({ report });
  } catch (err) {
    handleError(err, res);
  }
};

export { getForeCast };
