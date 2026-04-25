import { Router } from "express";
import { Role } from "@prisma/client";
import {
  addComment,
  createReview,
  deleteOwnPendingReview,
  listPublishedReviews,
  moderateReview,
  toggleLike,
  updateOwnPendingReview,
} from "../controllers/review.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listPublishedReviews);
router.post("/", requireAuth, createReview);
router.patch("/:id", requireAuth, updateOwnPendingReview);
router.delete("/:id", requireAuth, deleteOwnPendingReview);
router.patch("/:id/moderate", requireAuth, requireRole(Role.ADMIN), moderateReview);
router.post("/:id/like", requireAuth, toggleLike);
router.post("/:id/comments", requireAuth, addComment);

export default router;
