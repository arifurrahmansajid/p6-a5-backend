import { Router } from "express";
import { Role } from "@prisma/client";
import { createMedia, deleteMedia, listMedia, updateMedia } from "../controllers/media.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listMedia);
router.post("/", requireAuth, requireRole(Role.ADMIN), createMedia);
router.patch("/:id", requireAuth, requireRole(Role.ADMIN), updateMedia);
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), deleteMedia);

export default router;
