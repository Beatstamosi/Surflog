import { User as DBUser } from "../User.ts";

declare global {
  namespace Express {
    interface User extends DBUser {}
  }
}
