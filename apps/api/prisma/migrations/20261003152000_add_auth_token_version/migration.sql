ALTER TABLE "users"
ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "users_provider_providerId_key"
ON "users" ("provider", "providerId");
