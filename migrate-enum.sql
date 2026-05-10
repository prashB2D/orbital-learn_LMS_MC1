-- Update existing program records to use new enum values
UPDATE "WebsiteProgram" SET "type" = 'SUMMER' WHERE "type" = 'SUMMER_INTERNSHIP';
UPDATE "WebsiteProgram" SET "type" = 'WINTER' WHERE "type" = 'WINTER_INTERNSHIP';