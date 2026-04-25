import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function listWatchlist(req: Request, res: Response) {
  const data = await prisma.watchlist.findMany({
    where: { userId: req.user!.id },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(data);
}

export async function addToWatchlist(req: Request, res: Response) {
  const mediaId = String(req.params.mediaId);
  const item = await prisma.watchlist.upsert({
    where: { userId_mediaId: { userId: req.user!.id, mediaId } },
    update: {},
    create: { userId: req.user!.id, mediaId },
  });
  return res.status(201).json(item);
}

export async function removeFromWatchlist(req: Request, res: Response) {
  const mediaId = String(req.params.mediaId);
  await prisma.watchlist.delete({
    where: {
      userId_mediaId: { userId: req.user!.id, mediaId },
    },
  });
  return res.status(204).send();
}
