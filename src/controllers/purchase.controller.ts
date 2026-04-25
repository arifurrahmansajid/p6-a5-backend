import { Request, Response } from "express";
import Stripe from "stripe";
import { PurchaseType } from "@prisma/client";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

const purchaseSchema = z.object({
  mediaId: z.string(),
  type: z.enum([PurchaseType.BUY, PurchaseType.RENT, PurchaseType.SUBSCRIPTION]),
  amount: z.number().positive(),
  paymentMethodId: z.string().optional(),
});

export async function createPurchase(req: Request, res: Response) {
  const data = purchaseSchema.parse(req.body);

  if (!stripe) {
    const purchase = await prisma.purchase.create({
      data: {
        userId: req.user!.id,
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

  const purchase = await prisma.purchase.create({
    data: {
      userId: req.user!.id,
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

export async function listMyPurchases(req: Request, res: Response) {
  const purchases = await prisma.purchase.findMany({
    where: { userId: req.user!.id },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(purchases);
}
