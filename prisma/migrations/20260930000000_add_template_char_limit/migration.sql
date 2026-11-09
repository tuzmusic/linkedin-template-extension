-- AlterTable
-- char_limit: NULL means the template has no character limit
ALTER TABLE "templates"
    ADD COLUMN "char_limit" INTEGER DEFAULT 300;
