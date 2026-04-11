import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@lms.com';
  const passwordText = '123456';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(passwordText, 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN' // Required string enum matching schema!
      }
    });
    console.log(`Successfully created ADMIN user: ${adminEmail}`);
  } else {
    console.log(`ADMIN user ${adminEmail} already exists!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
