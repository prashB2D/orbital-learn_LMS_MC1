const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mentors = await prisma.user.findMany({ where: { role: 'MENTOR' } });
  console.log(mentors);
}
main().finally(() => prisma.$disconnect());
