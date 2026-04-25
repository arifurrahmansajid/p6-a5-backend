"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../config/prisma");
const token_1 = require("../utils/token");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
async function register(req, res) {
    const data = registerSchema.parse(req.body);
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
        return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: client_1.Role.USER,
        },
    });
    const token = (0, token_1.signToken)({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
}
async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const user = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = (0, token_1.signToken)({ id: user.id, email: user.email, role: user.role });
    return res.status(200).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
}
