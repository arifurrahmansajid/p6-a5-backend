import { Router } from "express";
import { addToWatchlist, listWatchlist, removeFromWatchlist } from "../controllers/watchlist.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, listWatchlist);
router.post("/:mediaId", requireAuth, addToWatchlist);
router.delete("/:mediaId", requireAuth, removeFromWatchlist);

export default router;
