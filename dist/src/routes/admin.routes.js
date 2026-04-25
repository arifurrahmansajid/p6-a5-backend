"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_1.requireAuth, (0, auth_1.requireRole)(client_1.Role.ADMIN), admin_controller_1.dashboard);
exports.default = router;
