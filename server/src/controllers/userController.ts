import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import handleError from "../services/handleError.js";

const updateUser = async (req: Request, res: Response) => {
  try {
    const { bio, profilePicture } = req.body;

    const updateData: { bio?: string; profilePicture?: string } = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;

    await prisma.user.update({
      where: { id: req.user?.id },
      data: updateData,
    });

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    handleError(err, res);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.user?.id } });
    res.status(201).json({ message: "User deleted successfully." });
  } catch (err) {
    handleError(err, res);
  }
};

const getUserFollowing = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    if (!userId) throw new Error("Missing user Id");

    const userFollowing = await prisma.userFollowing.findMany({
      where: {
        userId,
      },
    });

    res.status(201).json({ userFollowing });
  } catch (err) {
    handleError(err, res);
  }
};

export { updateUser, deleteUser, getUserFollowing };
