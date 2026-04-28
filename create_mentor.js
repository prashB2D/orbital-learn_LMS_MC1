const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('mentor123', 10);
  const mentor = await prisma.user.create({
    data: {
      name: 'Test Mentor',
      email: 'mentor@horbiteal.com',
      password: hashedPassword,
      role: 'MENTOR'
    }
  });
  console.log("Created mentor:", mentor.email, "Password: mentor123");
}
main().finally(() => prisma.$disconnect());
