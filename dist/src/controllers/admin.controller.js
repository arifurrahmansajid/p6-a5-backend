"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = dashboard;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
async function dashboard(req, res) {
    const [pendingReviews, publishedReviews, users, totalMedia, ratings] = await Promise.all([
        prisma_1.prisma.review.count({ where: { status: client_1.ReviewStatus.PENDING } }),
        prisma_1.prisma.review.count({ where: { status: client_1.ReviewStatus.PUBLISHED } }),
        prisma_1.prisma.user.count(),
        prisma_1.prisma.media.count(),
        prisma_1.prisma.review.groupBy({
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
