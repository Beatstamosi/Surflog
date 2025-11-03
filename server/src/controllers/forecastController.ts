import { Request, Response } from "express";
import { getSurfReport } from "./getSurfReport.js";

const getForeCast = async (req: Request, res: Response) => {
  const spot = "Popoyo";
  const sessionStart = "2025-11-03 08:00";

  const report = await getSurfReport(sessionStart, spot);

  console.log(JSON.stringify(report, null, 2));
};

export { getForeCast };
