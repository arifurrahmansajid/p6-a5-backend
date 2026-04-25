import { Request, Response } from "express";
import { ReviewStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function dashboard(req: Request, res: Response) {
  const [pendingReviews, publishedReviews, users, totalMedia, ratings] = await Promise.all([
    prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    prisma.review.count({ where: { status: ReviewStatus.PUBLISHED } }),
    prisma.user.count(),
    prisma.media.count(),
    prisma.review.groupBy({
      by: ["mediaId"],
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  return res.json({
    pendingReviews,
    publishedReviews,
    users,
    totalMedia,
    averageRatingsByMedia: ratings,
  });
}
