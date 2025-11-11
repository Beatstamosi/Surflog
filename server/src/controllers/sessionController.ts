import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import handleError from "../services/handleError.js";
import addForecastToPrisma from "../utils/addForecastToPrisma.js";

const addSession = async (req: Request, res: Response) => {
  const {
    forecast,
    shareInFeed,
    sessionMatchForecast,
    description,
    image,
    boardId,
  } = req.body;
  const user = req.user;

  try {
    if (!user) throw Error("Missing user id.");

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Create forecast
      const savedForecast = await addForecastToPrisma(forecast, tx);

      // 2. Create session
      const session = await tx.session.create({
        data: {
          startTime: savedForecast.date,
          description,
          sessionMatchForecast,
          image: image ? image : null,
          shared: shareInFeed,
          userId: user.id,
          forecastId: savedForecast.id,
          boardId,
        },
      });

      // 3. Create post if shared
      if (shareInFeed) {
        await tx.post.create({
          data: {
            creatorId: user.id,
            sessionId: session.id,
          },
        });
      }

      return session;
    });

    res.sendStatus(201);
  } catch (err) {
    handleError(err, res);
  }
};

export { addSession };
