import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import mediaRoutes from "./routes/media.routes";
import reviewRoutes from "./routes/review.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import purchaseRoutes from "./routes/purchase.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ message: "API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
