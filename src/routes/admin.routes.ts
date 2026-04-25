import { Router } from "express";
import { Role } from "@prisma/client";
import { dashboard } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/dashboard", requireAuth, requireRole(Role.ADMIN), dashboard);

export default router;
