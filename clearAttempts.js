const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.quizAttempt.deleteMany({});
  console.log("Deleted all QuizAttempts");
}

main().catch(console.error).finally(() => prisma.$disconnect());
