"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWatchlist = listWatchlist;
exports.addToWatchlist = addToWatchlist;
exports.removeFromWatchlist = removeFromWatchlist;
const prisma_1 = require("../config/prisma");
async function listWatchlist(req, res) {
    const data = await prisma_1.prisma.watchlist.findMany({
        where: { userId: req.user.id },
        include: { media: true },
        orderBy: { createdAt: "desc" },
    });
    return res.json(data);
}
async function addToWatchlist(req, res) {
    const mediaId = String(req.params.mediaId);
    const item = await prisma_1.prisma.watchlist.upsert({
        where: { userId_mediaId: { userId: req.user.id, mediaId } },
        update: {},
        create: { userId: req.user.id, mediaId },
    });
    return res.status(201).json(item);
}
async function removeFromWatchlist(req, res) {
    const mediaId = String(req.params.mediaId);
    await prisma_1.prisma.watchlist.delete({
        where: {
            userId_mediaId: { userId: req.user.id, mediaId },
        },
    });
    return res.status(204).send();
}
