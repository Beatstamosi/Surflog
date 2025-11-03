import prisma from "../lib/prisma.js";

export default async function userExists(userEmail: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: { id: true },
    });
    return !!user;
  } catch (err) {
    console.log("Error checking if user exists: ", err);
    return false;
  }
}
