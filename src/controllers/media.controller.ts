import { Request, Response } from "express";
import { MediaType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";

const mediaSchema = z.object({
  title: z.string().min(1),
  synopsis: z.string().min(10),
  type: z.nativeEnum(MediaType),
  genres: z.array(z.string()).min(1),
  releaseYear: z.number().int(),
  director: z.string(),
  cast: z.array(z.string()).min(1),
  streamingPlatform: z.array(z.string()).min(1),
  priceType: z.string().default("free"),
  monthlyPrice: z.number().optional(),
  yearlyPrice: z.number().optional(),
  streamingLink: z.string().url(),
  featured: z.boolean().optional(),
});

export async function listMedia(req: Request, res: Response) {
  const { search, genre, platform, year, sort } = req.query;

  const media = await prisma.media.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: String(search), mode: "insensitive" } },
                { director: { contains: String(search), mode: "insensitive" } },
              ],
            }
          : {},
        genre ? { genres: { has: String(genre) } } : {},
        platform ? { streamingPlatform: { has: String(platform) } } : {},
        year ? { releaseYear: Number(year) } : {},
      ],
    },
    orderBy: sort === "latest" ? { createdAt: "desc" } : { title: "asc" },
  });

  return res.json(media);
}

export async function createMedia(req: Request, res: Response) {
  const data = mediaSchema.parse(req.body);
  const media = await prisma.media.create({ data });
  return res.status(201).json(media);
}

export async function updateMedia(req: Request, res: Response) {
  const data = mediaSchema.partial().parse(req.body);
  const id = String(req.params.id);
  const media = await prisma.media.update({
    where: { id },
    data,
  });
  return res.json(media);
}

export async function deleteMedia(req: Request, res: Response) {
  const id = String(req.params.id);
  await prisma.media.delete({ where: { id } });
  return res.status(204).send();
}
