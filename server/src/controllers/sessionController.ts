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
    sessionImageUrl,
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
          image: sessionImageUrl ? sessionImageUrl : null,
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

const getAllUserSessions = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    if (!userId) throw new Error("Missing userId");
    const sessions = await prisma.session.findMany({
      where: {
        userId: userId,
      },
      include: {
        forecast: {
          include: {
            swells: true,
          },
        },
        board: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    res.status(201).json({ sessions });
  } catch (err) {
    handleError(err, res);
  }
};

const updateSession = async (req: Request, res: Response) => {
  const {
    sessionId,
    shareInFeed,
    sessionMatchForecast,
    description,
    sessionImageUrl,
    boardId,
  } = req.body;
  const user = req.user;

  try {
    if (!user) throw Error("Missing user id.");

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Update session
      const session = await tx.session.update({
        where: {
          id: sessionId,
        },
        data: {
          description,
          sessionMatchForecast,
          image: sessionImageUrl ? sessionImageUrl : null,
          shared: shareInFeed,
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

export { addSession, getAllUserSessions, updateSession };
