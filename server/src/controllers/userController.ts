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

const getPublicUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.profileId);
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        boards: true,
        sessions: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: {
          where: {
            userId: currentUserId, // Check if current user follows this user
          },
        },
        posts: {
          include: {
            session: {
              include: {
                forecast: true,
              },
            },
            creator: true,
            likes: true,
            savedBy: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Transform the data to include isFollowing
    const userWithFollowStatus = {
      ...user,
      isFollowing: user.followers.length > 0,
      followers: undefined, // Remove the followers array from response
    };

    res.status(200).json({ user: userWithFollowStatus });
  } catch (err) {
    handleError(err, res);
  }
};

const followUser = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const userId = req.user?.id;

  try {
    if (!profileId) throw new Error("Missing profile Id");
    if (!userId) throw new Error("Missing user Id");

    await prisma.userFollowing.create({
      data: {
        userId,
        followingUserId: parseInt(profileId),
      },
    });
    res.sendStatus(201);
  } catch (err) {
    handleError(err, res);
  }
};

const unfollowUser = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const userId = req.user?.id;

  try {
    if (!profileId) throw new Error("Missing profile Id");
    if (!userId) throw new Error("Missing user Id");

    await prisma.userFollowing.delete({
      where: {
        userId_followingUserId: {
          userId,
          followingUserId: parseInt(profileId),
        },
      },
    });
    res.sendStatus(204);
  } catch (err) {
    handleError(err, res);
  }
};

export {
  updateUser,
  deleteUser,
  getPublicUserProfile,
  followUser,
  unfollowUser,
};
