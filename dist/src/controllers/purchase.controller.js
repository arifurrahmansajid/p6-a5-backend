"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchase = createPurchase;
exports.listMyPurchases = listMyPurchases;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const stripe = env_1.env.STRIPE_SECRET_KEY ? new stripe_1.default(env_1.env.STRIPE_SECRET_KEY) : null;
const purchaseSchema = zod_1.z.object({
    mediaId: zod_1.z.string(),
    type: zod_1.z.enum([client_1.PurchaseType.BUY, client_1.PurchaseType.RENT, client_1.PurchaseType.SUBSCRIPTION]),
    amount: zod_1.z.number().positive(),
    paymentMethodId: zod_1.z.string().optional(),
});
async function createPurchase(req, res) {
    const data = purchaseSchema.parse(req.body);
    if (!stripe) {
        const purchase = await prisma_1.prisma.purchase.create({
            data: {
                userId: req.user.id,
                mediaId: data.mediaId,
                type: data.type,
                amount: data.amount,
                transactionId: "mock-transaction",
            },
        });
        return res.status(201).json({ mocked: true, purchase });
    }
    const intent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: "usd",
        payment_method: data.paymentMethodId,
        confirm: !!data.paymentMethodId,
        automatic_payment_methods: data.paymentMethodId ? undefined : { enabled: true },
    });
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId: req.user.id,
            mediaId: data.mediaId,
            type: data.type,
            amount: data.amount,
            transactionId: intent.id,
        },
    });
    return res.status(201).json({
        purchase,
        clientSecret: intent.client_secret,
        status: intent.status,
    });
}
async function listMyPurchases(req, res) {
    const purchases = await prisma_1.prisma.purchase.findMany({
        where: { userId: req.user.id },
        include: { media: true },
        orderBy: { createdAt: "desc" },
    });
    return res.json(purchases);
}
