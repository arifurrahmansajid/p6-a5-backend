"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.listPublishedReviews = listPublishedReviews;
exports.updateOwnPendingReview = updateOwnPendingReview;
exports.deleteOwnPendingReview = deleteOwnPendingReview;
exports.moderateReview = moderateReview;
exports.toggleLike = toggleLike;
exports.addComment = addComment;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../config/prisma");
const reviewSchema = zod_1.z.object({
    mediaId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(10),
    content: zod_1.z.string().min(10),
    spoiler: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
async function createReview(req, res) {
    const data = reviewSchema.parse(req.body);
    const review = await prisma_1.prisma.review.create({
        data: {
            ...data,
            userId: req.user.id,
            status: client_1.ReviewStatus.PENDING,
        },
    });
    return res.status(201).json(review);
}
async function listPublishedReviews(req, res) {
    const reviews = await prisma_1.prisma.review.findMany({
        where: { status: client_1.ReviewStatus.PUBLISHED },
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
async function updateOwnPendingReview(req, res) {
    const id = String(req.params.id);
    const data = reviewSchema.partial().parse(req.body);
    const review = await prisma_1.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user.id) {
        return res.status(404).json({ message: "Review not found" });
    }
    if (review.status !== client_1.ReviewStatus.PENDING) {
        return res.status(400).json({ message: "Only pending reviews can be edited" });
    }
    const updated = await prisma_1.prisma.review.update({ where: { id }, data });
    return res.json(updated);
}
async function deleteOwnPendingReview(req, res) {
    const id = String(req.params.id);
    const review = await prisma_1.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== req.user.id) {
        return res.status(404).json({ message: "Review not found" });
    }
    if (review.status !== client_1.ReviewStatus.PENDING) {
        return res.status(400).json({ message: "Only pending reviews can be deleted" });
    }
    await prisma_1.prisma.review.delete({ where: { id } });
    return res.status(204).send();
}
async function moderateReview(req, res) {
    const schema = zod_1.z.object({
        status: zod_1.z.enum([client_1.ReviewStatus.PUBLISHED, client_1.ReviewStatus.UNPUBLISHED]),
    });
    const { status } = schema.parse(req.body);
    const review = await prisma_1.prisma.review.update({
        where: { id: String(req.params.id) },
        data: { status },
    });
    return res.json(review);
}
async function toggleLike(req, res) {
    const reviewId = String(req.params.id);
    const userId = req.user.id;
    const existing = await prisma_1.prisma.like.findUnique({
        where: { userId_reviewId: { userId, reviewId } },
    });
    if (existing) {
        await prisma_1.prisma.like.delete({ where: { userId_reviewId: { userId, reviewId } } });
        return res.json({ liked: false });
    }
    await prisma_1.prisma.like.create({ data: { userId, reviewId } });
    return res.json({ liked: true });
}
async function addComment(req, res) {
    const schema = zod_1.z.object({
        content: zod_1.z.string().min(1),
        parentId: zod_1.z.string().optional(),
    });
    const data = schema.parse(req.body);
    const comment = await prisma_1.prisma.comment.create({
        data: {
            content: data.content,
            parentId: data.parentId,
            reviewId: String(req.params.id),
            userId: req.user.id,
        },
    });
    return res.status(201).json(comment);
}
