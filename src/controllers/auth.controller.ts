import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/token";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.USER,
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
