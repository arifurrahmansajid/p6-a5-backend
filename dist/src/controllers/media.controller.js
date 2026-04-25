"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMedia = listMedia;
exports.createMedia = createMedia;
exports.updateMedia = updateMedia;
exports.deleteMedia = deleteMedia;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../config/prisma");
const mediaSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    synopsis: zod_1.z.string().min(10),
    type: zod_1.z.nativeEnum(client_1.MediaType),
    genres: zod_1.z.array(zod_1.z.string()).min(1),
    releaseYear: zod_1.z.number().int(),
    director: zod_1.z.string(),
    cast: zod_1.z.array(zod_1.z.string()).min(1),
    streamingPlatform: zod_1.z.array(zod_1.z.string()).min(1),
    priceType: zod_1.z.string().default("free"),
    monthlyPrice: zod_1.z.number().optional(),
    yearlyPrice: zod_1.z.number().optional(),
    streamingLink: zod_1.z.string().url(),
    featured: zod_1.z.boolean().optional(),
});
async function listMedia(req, res) {
    const { search, genre, platform, year, sort } = req.query;
    const media = await prisma_1.prisma.media.findMany({
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
async function createMedia(req, res) {
    const data = mediaSchema.parse(req.body);
    const media = await prisma_1.prisma.media.create({ data });
    return res.status(201).json(media);
}
async function updateMedia(req, res) {
    const data = mediaSchema.partial().parse(req.body);
    const id = String(req.params.id);
    const media = await prisma_1.prisma.media.update({
        where: { id },
        data,
    });
    return res.json(media);
}
async function deleteMedia(req, res) {
    const id = String(req.params.id);
    await prisma_1.prisma.media.delete({ where: { id } });
    return res.status(204).send();
}
