"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchase_controller_1 = require("../controllers/purchase.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, purchase_controller_1.createPurchase);
router.get("/mine", auth_1.requireAuth, purchase_controller_1.listMyPurchases);
exports.default = router;
