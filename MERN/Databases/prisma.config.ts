import { defineConfig, env } from "prisma/config";
import  "dotenv";
import { configDotenv } from "dotenv";
configDotenv();
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("NEON_DATABASE_URL"),
  },
});
