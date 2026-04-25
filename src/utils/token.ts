import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export function signToken(payload: { id: string; email: string; role: Role }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}
