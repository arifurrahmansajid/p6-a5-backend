"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const watchlist_routes_1 = __importDefault(require("./routes/watchlist.routes"));
const purchase_routes_1 = __importDefault(require("./routes/purchase.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => res.json({ message: "API is running" }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/media", media_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/watchlist", watchlist_routes_1.default);
app.use("/api/purchases", purchase_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
