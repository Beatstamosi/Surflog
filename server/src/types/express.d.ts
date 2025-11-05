import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    // 👇 Extends Express.User with all fields except password
    interface User extends Omit<PrismaUser, "password"> {}
  }
}

export {};
