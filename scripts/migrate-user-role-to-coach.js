/**
 * One-time script: update all User rows with role 'USER' to role 'COACH'
 * so that prisma db push can remove USER from the Role enum.
 * Run: node scripts/migrate-user-role-to-coach.js
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load prisma/.env or prisma/.Env into process.env
for (const name of [".env", ".Env"]) {
  const envPath = join(root, "prisma", name);
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
    break;
  }
}

const prisma = new PrismaClient();

async function main() {
  // Raw SQL: Prisma client no longer has USER in enum, so we use raw query
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "User" SET role = 'COACH' WHERE role = 'USER'
  `);
  console.log(`Updated ${result} user(s) from role USER to COACH.`);
  console.log("You can now run: npm run db:push");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
