import { Request, Response } from "express";
import { ReviewStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";

const reviewSchema = z.object({
  mediaId: z.string(),
  rating: z.number().int().min(1).max(10),
  content: z.string().min(10),
  spoiler: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export async function createReview(req: Request, res: Response) {
  const data = reviewSchema.parse(req.body);
  const review = await prisma.review.create({
    data: {
      ...data,
      userId: req.user!.id,
      status: ReviewStatus.PENDING,
    },
  });
  return res.status(201).json(review);
}

export async function listPublishedReviews(req: Request, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { status: ReviewStatus.PUBLISHED },
    include: {
      user: { select: { id: true, name: true } },
      media: { select: { id: true, title: true, releaseYear: true } },
      likes: true,
      comments: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(reviews);
}

export async function updateOwnPendingReview(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = reviewSchema.partial().parse(req.body);

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.userId !== req.user!.id) {
    return res.status(404).json({ message: "Review not found" });
  }
  if (review.status !== ReviewStatus.PENDING) {
    return res.status(400).json({ message: "Only pending reviews can be edited" });
  }

  const updated = await prisma.review.update({ where: { id }, data });
  return res.json(updated);
}

export async function deleteOwnPendingReview(req: Request, res: Response) {
  const id = String(req.params.id);
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.userId !== req.user!.id) {
    return res.status(404).json({ message: "Review not found" });
  }
  if (review.status !== ReviewStatus.PENDING) {
    return res.status(400).json({ message: "Only pending reviews can be deleted" });
  }
  await prisma.review.delete({ where: { id } });
  return res.status(204).send();
}

export async function moderateReview(req: Request, res: Response) {
  const schema = z.object({
    status: z.enum([ReviewStatus.PUBLISHED, ReviewStatus.UNPUBLISHED]),
  });
  const { status } = schema.parse(req.body);

  const review = await prisma.review.update({
    where: { id: String(req.params.id) },
    data: { status },
  });
  return res.json(review);
}

export async function toggleLike(req: Request, res: Response) {
  const reviewId = String(req.params.id);
  const userId = req.user!.id;

  const existing = await prisma.like.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_reviewId: { userId, reviewId } } });
    return res.json({ liked: false });
  }

  await prisma.like.create({ data: { userId, reviewId } });
  return res.json({ liked: true });
}

export async function addComment(req: Request, res: Response) {
  const schema = z.object({
    content: z.string().min(1),
    parentId: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      parentId: data.parentId,
      reviewId: String(req.params.id),
      userId: req.user!.id,
    },
  });
  return res.status(201).json(comment);
}
