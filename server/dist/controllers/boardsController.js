import prisma from "../lib/prisma.js";
import handleError from "../services/handleError.js";
const getBoardsOfUser = async (req, res) => {
    const userId = req.user?.id;
    try {
        const boards = await prisma.board.findMany({
            where: {
                ownerId: userId,
            },
        });
        res.status(200).json({ boards });
    }
    catch (err) {
        handleError(err, res);
    }
};
const addBoardToUserQuiver = async (req, res) => {
    const ownerId = req.user?.id;
    const { brand, size, volume, name } = req.body;
    try {
        if (!ownerId)
            throw new Error("Unauthorized: Missing ownerId");
        if (!brand || !size || !volume || !name)
            throw new Error("Missing data to store board.");
        const result = await prisma.$transaction(async (tx) => {
            const board = await tx.board.create({
                data: { brand, size, volume, name, ownerId },
            });
            await tx.quiver.create({
                data: { userId: ownerId, boardId: board.id },
            });
            return board;
        });
        console.log(result);
        res.status(201).json({ board: result });
    }
    catch (err) {
        handleError(err, res);
    }
};
const deleteBoard = async (req, res) => {
    const boardId = req.body.boardId;
    try {
        await prisma.board.delete({
            where: {
                id: boardId,
            },
        });
        res.sendStatus(204);
    }
    catch (err) {
        handleError(err, res);
    }
};
export { getBoardsOfUser, addBoardToUserQuiver, deleteBoard };
