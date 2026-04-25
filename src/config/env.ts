import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
