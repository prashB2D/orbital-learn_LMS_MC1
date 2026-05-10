-- AlterTable
ALTER TABLE ""Course"" ADD COLUMN     ""badgeText"" TEXT,
ADD COLUMN     ""category"" TEXT,
ADD COLUMN     ""isFeatured"" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE ""WebsiteProgram"" ADD COLUMN     ""courses"" TEXT,
ADD COLUMN     ""workshops"" TEXT;

-- AlterTable
ALTER TABLE ""WebsiteTestimonial"" ADD COLUMN     ""avatarUrl"" TEXT;
