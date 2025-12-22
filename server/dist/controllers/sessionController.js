import prisma from "../lib/prisma.js";
import handleError from "../services/handleError.js";
import addForecastToPrisma from "../utils/addForecastToPrisma.js";
const addSession = async (req, res) => {
    const { forecast, shareInFeed, sessionMatchForecast, description, sessionImageUrl, boardId, startTimeSession, endTimeSession, sessionRating, } = req.body;
    const user = req.user;
    try {
        if (!user)
            throw Error("Missing user id.");
        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
            // 1. Create forecast
            const savedForecast = await addForecastToPrisma(forecast, tx);
            // 2. Create session
            const session = await tx.session.create({
                data: {
                    startTime: startTimeSession,
                    endTime: endTimeSession,
                    rating: sessionRating,
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
    }
    catch (err) {
        handleError(err, res);
    }
};
const getAllUserSessions = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId)
            throw new Error("Missing userId");
        const sessions = await prisma.session.findMany({
            where: {
                userId: userId,
                shared: false,
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
    }
    catch (err) {
        handleError(err, res);
    }
};
const updateSession = async (req, res) => {
    const { sessionId, shareInFeed, sessionMatchForecast, description, sessionImageUrl, boardId, sessionRating, } = req.body;
    const user = req.user;
    try {
        if (!user)
            throw Error("Missing user id.");
        // Use transaction to ensure data consistency
        const updatedSession = await prisma.$transaction(async (tx) => {
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
                    rating: sessionRating,
                },
                include: {
                    forecast: {
                        include: {
                            swells: true,
                        },
                    },
                    board: true,
                    post: true,
                },
            });
            // 2. Create post if shared
            if (shareInFeed && !session.post) {
                await tx.post.create({
                    data: {
                        creatorId: user.id,
                        sessionId: session.id,
                    },
                });
            }
            else {
                if (session.post && !shareInFeed) {
                    await tx.post.delete({
                        where: {
                            id: session.post?.id,
                        },
                    });
                }
            }
            return session;
        });
        res.status(201).json({ updatedSession });
    }
    catch (err) {
        handleError(err, res);
    }
};
const deleteSession = async (req, res) => {
    const { sessionId } = req.body;
    try {
        if (!sessionId)
            throw new Error("Missing Session Id");
        await prisma.session.delete({
            where: {
                id: sessionId,
            },
        });
        res.status(204).json({ message: "Session deleted successfully" });
    }
    catch (err) {
        handleError(err, res);
    }
};
const toggleSharedStatus = async (req, res) => {
    // get session
    const { sessionId, shared } = req.body;
    const user = req.user;
    try {
        if (!user || !sessionId || shared === undefined || shared === null)
            throw new Error("Missing info to toggle shared status.");
        // Use transaction to ensure data consistency
        const updatedSession = await prisma.$transaction(async (tx) => {
            // 1. Update session
            const session = await tx.session.update({
                where: {
                    id: sessionId,
                },
                data: {
                    shared: !shared,
                },
                include: {
                    forecast: {
                        include: {
                            swells: true,
                        },
                    },
                    board: true,
                    post: true,
                },
            });
            // 2. Create post if shared or delete if unshared
            if (session.shared) {
                await tx.post.create({
                    data: {
                        creatorId: user.id,
                        sessionId: session.id,
                    },
                });
            }
            else {
                await tx.post.delete({
                    where: {
                        id: session.post?.id,
                    },
                });
            }
            return session;
        });
        res.status(201).json({ updatedSession });
    }
    catch (err) {
        handleError(err, res);
    }
};
export { addSession, getAllUserSessions, updateSession, deleteSession, toggleSharedStatus, };
