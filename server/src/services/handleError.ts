import { Response } from "express";

function handleError(error: unknown, res: Response) {
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: "Unknown Error occurred" });
  }
}

export default handleError;
