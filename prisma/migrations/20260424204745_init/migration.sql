-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('connection_request', 'message');

-- CreateTable
CREATE TABLE "contacts"
(
    "slug"       TEXT NOT NULL,
    "full_name"  TEXT,
    "title"      TEXT,
    "company"    TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "sent_messages"
(
    "id"                 UUID           NOT NULL DEFAULT gen_random_uuid(),
    "contact_id"         TEXT           NOT NULL,
    "template_id"        UUID           NOT NULL,
    "type"               "message_type" NOT NULL,
    "filled_wildcards"   JSONB,
    "final_message_text" TEXT,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates"
(
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"    UUID NOT NULL,
    "title"      TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sent_messages"
    ADD CONSTRAINT "sent_messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("slug") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sent_messages"
    ADD CONSTRAINT "sent_messages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
