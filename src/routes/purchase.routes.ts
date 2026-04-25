import { Router } from "express";
import { createPurchase, listMyPurchases } from "../controllers/purchase.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createPurchase);
router.get("/mine", requireAuth, listMyPurchases);

export default router;
