import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash password for demo user
  const hashedPassword = await bcrypt.hash("password", 10);

  // Upsert user to avoid duplicates on rerun
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: hashedPassword,
      role: "student",
      name: "Dovydas Šilinskas",
      vaikoVardas: "Vaiko Vardas",
      // updatedAt will auto-update on each save, no need to set manually
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
