import passport from "passport";
import bcrypt from "bcryptjs";
import userExists from "../services/userServices.js";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const signUpHandler = async (req, res) => {
    try {
        const exists = await userExists(req.body.email);
        if (!exists) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await prisma.user.create({
                data: {
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    password: hashedPassword,
                },
            });
            res.status(201).json({ message: "User signed up successfully." });
        }
        else {
            res.status(409).json({ error: "User already exists." });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: `Error signing up user: ${err.message}` });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred during sign-up." });
        }
    }
};
const loginHandler = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).json({ error: info?.message || "Login failed" });
        }
        // Generate token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
        // Log the user in
        return res.status(200).json({
            message: "Logged in successfully",
            token,
            user,
        });
    })(req, res, next);
};
function getUser(req, res) {
    if (req.user) {
        // Send limited user data
        const { id, email, firstName, lastName, bio, profilePicture } = req.user;
        res.json({
            user: {
                id,
                email,
                firstName,
                lastName,
                bio,
                profilePicture,
            },
        });
    }
    else {
        res.status(401).json({ user: null });
    }
}
async function userAlreadySignedUp(req, res) {
    try {
        const exists = await userExists(req.body.email);
        res.status(200).json({ exists });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: `Error signing up user: ${err.message}` });
        }
        else {
            res.status(500).json({
                error: "Unknown error occurred during check for existing user.",
            });
        }
    }
}
export { signUpHandler, loginHandler, getUser, userAlreadySignedUp };
