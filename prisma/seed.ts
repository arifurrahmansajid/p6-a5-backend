import bcrypt from "bcrypt";
import { PrismaClient, Role, MediaType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@portal.dev" },
    update: {},
    create: {
      name: "Portal Admin",
      email: "admin@portal.dev",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@portal.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@portal.dev",
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  await prisma.media.createMany({
    data: [
      {
        title: "Inception",
        synopsis: "A skilled thief enters dreams to steal secrets.",
        type: MediaType.MOVIE,
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
        type: MediaType.SERIES,
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
