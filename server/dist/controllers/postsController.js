import prisma from "../lib/prisma.js";
import handleError from "../services/handleError.js";
const getAllUserPosts = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId)
            throw new Error("Missing user Id.");
        const posts = await prisma.post.findMany({
            where: {
                creatorId: userId,
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: {
                    include: {
                        user: true,
                    },
                },
                comments: {
                    include: {
                        author: true,
                    },
                },
            },
        });
        res.status(201).json({ posts });
    }
    catch (err) {
        handleError(err, res);
    }
};
const unlikePost = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    try {
        if (!user || !postId)
            throw new Error("Missing user or postId.");
        await prisma.like.delete({
            where: {
                postId_userId: {
                    postId: parseInt(postId),
                    userId: user.id,
                },
            },
        });
        res.sendStatus(204);
    }
    catch (err) {
        handleError(err, res);
    }
};
const likePost = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    try {
        if (!user)
            throw new Error("Missing user Id");
        if (!postId)
            throw new Error("Missing postId.");
        await prisma.like.create({
            data: {
                postId: parseInt(postId),
                userId: user.id,
            },
        });
        res.sendStatus(201);
    }
    catch (err) {
        handleError(err, res);
    }
};
const unsavePost = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    try {
        if (!user)
            throw new Error("Missing user Id");
        if (!postId)
            throw new Error("Missing postId.");
        await prisma.savedPosts.delete({
            where: {
                userId_postId: {
                    postId: parseInt(postId),
                    userId: user.id,
                },
            },
        });
        res.sendStatus(204);
    }
    catch (err) {
        handleError(err, res);
    }
};
const savePost = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    try {
        if (!user)
            throw new Error("Missing user Id");
        if (!postId)
            throw new Error("Missing postId.");
        await prisma.savedPosts.create({
            data: {
                postId: parseInt(postId),
                userId: user.id,
            },
        });
        res.sendStatus(201);
    }
    catch (err) {
        handleError(err, res);
    }
};
const addComment = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    const { content } = req.body;
    try {
        if (!user)
            throw new Error("Missing user Id");
        if (!postId)
            throw new Error("Missing postId.");
        if (!content)
            throw new Error("Missing content.");
        const comment = await prisma.comment.create({
            data: {
                postId: parseInt(postId),
                authorId: user.id,
                content,
            },
            include: {
                author: true,
            },
        });
        res.status(201).json({ comment });
    }
    catch (err) {
        handleError(err, res);
    }
};
const getAllFeedPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: {
                session: {
                    shared: true, // safety check
                },
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: {
                    include: {
                        user: true,
                    },
                },
                comments: {
                    include: {
                        author: true,
                    },
                },
                savedBy: true,
            },
        });
        res.status(201).json({ posts });
    }
    catch (err) {
        handleError(err, res);
    }
};
const getLikedFeedPosts = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId)
            throw new Error("Missing user Id");
        const posts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId: userId,
                    },
                },
                session: {
                    shared: true,
                },
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: true,
                comments: {
                    include: {
                        author: true,
                    },
                },
                savedBy: true,
            },
        });
        res.status(201).json({ posts });
    }
    catch (err) {
        handleError(err, res);
    }
};
const getSavedFeedPosts = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId)
            throw new Error("Missing user Id");
        const posts = await prisma.post.findMany({
            where: {
                savedBy: {
                    some: {
                        userId: userId,
                    },
                },
                session: {
                    shared: true,
                },
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: true,
                comments: {
                    include: {
                        author: true,
                    },
                },
                savedBy: true,
            },
        });
        res.status(201).json({ posts });
    }
    catch (err) {
        handleError(err, res);
    }
};
const getFollowingFeedPosts = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId)
            throw new Error("Missing user Id");
        // Get the users that the current user is following
        const userFollowing = await prisma.userFollowing.findMany({
            where: {
                userId: userId, // Current user is the follower
            },
            select: {
                followingUserId: true,
            },
        });
        const followingUserIds = userFollowing.map((follow) => follow.followingUserId);
        // If user isn't following anyone, return empty array
        if (followingUserIds.length === 0) {
            return res.status(200).json({ posts: [] });
        }
        // Then get posts from those users
        const posts = await prisma.post.findMany({
            where: {
                creatorId: {
                    in: followingUserIds, // Posts from users that current user follows
                },
                session: {
                    shared: true,
                },
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: true,
                comments: {
                    include: {
                        author: true,
                    },
                },
                savedBy: true,
            },
            orderBy: {
                posted: "desc",
            },
        });
        res.status(200).json({ posts });
    }
    catch (err) {
        handleError(err, res);
    }
};
const getSinglePost = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await prisma.post.findFirst({
            where: {
                id: parseInt(postId),
            },
            include: {
                session: {
                    include: {
                        forecast: true,
                        board: true,
                    },
                },
                creator: true,
                likes: {
                    include: {
                        user: true,
                    },
                },
                comments: {
                    include: {
                        author: true,
                    },
                },
                savedBy: true,
            },
        });
        res.status(201).json({ post });
    }
    catch (err) {
        handleError(err, res);
    }
};
export { getAllUserPosts, unlikePost, likePost, unsavePost, savePost, addComment, getAllFeedPosts, getLikedFeedPosts, getSavedFeedPosts, getFollowingFeedPosts, getSinglePost, };
