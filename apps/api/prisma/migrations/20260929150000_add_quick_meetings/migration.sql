-- Create quick meetings without a workspace.
ALTER TABLE "meetings" ALTER COLUMN "workspaceId" DROP NOT NULL;

ALTER TABLE "meetings" ADD COLUMN "isQuick" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "meetings_isQuick_status_idx" ON "meetings"("isQuick", "status");
