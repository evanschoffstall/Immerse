import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/data/prisma";

async function main() {
  const testUserId = "test-user-id";
  const testEmail = "admin@example.com";

  // Check if user already exists
  const existing = await prisma.users.findUnique({
    where: { id: testUserId },
  });

  if (existing) {
    console.log("Test user already exists:", existing.email);
    return;
  }

  // Create test user
  const hashedPassword = await bcrypt.hash("admin", 10);

  const user = await prisma.users.create({
    data: {
      id: testUserId,
      email: testEmail,
      name: "Test Superuser",
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  console.log("✅ Test user created:", user.email);
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Password: admin");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
