"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcrypt_1.default.hash("Admin123!", 10);
    const userPassword = await bcrypt_1.default.hash("User123!", 10);
    await prisma.user.upsert({
        where: { email: "admin@portal.dev" },
        update: {},
        create: {
            name: "Portal Admin",
            email: "admin@portal.dev",
            passwordHash: adminPassword,
            role: client_1.Role.ADMIN,
        },
    });
    await prisma.user.upsert({
        where: { email: "user@portal.dev" },
        update: {},
        create: {
            name: "Demo User",
            email: "user@portal.dev",
            passwordHash: userPassword,
            role: client_1.Role.USER,
        },
    });
    await prisma.media.createMany({
        data: [
            {
                title: "Inception",
                synopsis: "A skilled thief enters dreams to steal secrets.",
                type: client_1.MediaType.MOVIE,
                genres: ["Sci-Fi", "Thriller"],
                releaseYear: 2010,
                director: "Christopher Nolan",
                cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
                streamingPlatform: ["Netflix"],
                priceType: "premium",
                monthlyPrice: 9.99,
                yearlyPrice: 99.99,
                streamingLink: "https://youtube.com/watch?v=YoHD9XEInc0",
                featured: true,
            },
            {
                title: "Stranger Things",
                synopsis: "Kids in a small town uncover supernatural mysteries.",
                type: client_1.MediaType.SERIES,
                genres: ["Drama", "Fantasy"],
                releaseYear: 2016,
                director: "The Duffer Brothers",
                cast: ["Millie Bobby Brown", "Finn Wolfhard"],
                streamingPlatform: ["Netflix"],
                priceType: "free",
                streamingLink: "https://youtube.com/watch?v=b9EkMc79ZSU",
                featured: true,
            },
        ],
        skipDuplicates: true,
    });
}
main()
    .then(async () => prisma.$disconnect())
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
