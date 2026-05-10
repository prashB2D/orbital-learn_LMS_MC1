import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProgramTypes() {
  console.log('Starting program type migration...');

  try {
    // Update existing programs with old enum values
    const updateSummer = await prisma.websiteProgram.updateMany({
      where: { type: 'SUMMER_INTERNSHIP' },
      data: { type: 'SUMMER' }
    });

    const updateWinter = await prisma.websiteProgram.updateMany({
      where: { type: 'WINTER_INTERNSHIP' },
      data: { type: 'WINTER' }
    });

    console.log(`Updated ${updateSummer.count} SUMMER_INTERNSHIP programs to SUMMER`);
    console.log(`Updated ${updateWinter.count} WINTER_INTERNSHIP programs to WINTER`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateProgramTypes();