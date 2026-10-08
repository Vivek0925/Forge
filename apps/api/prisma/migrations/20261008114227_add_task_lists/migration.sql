-- CreateTable
CREATE TABLE "task_lists" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_lists_workspaceId_idx"
ON "task_lists"("workspaceId");

CREATE INDEX "task_lists_workspaceId_position_idx"
ON "task_lists"("workspaceId", "position");

-- Create the default Trello-style lists for every existing workspace.
-- The workspace owner becomes the creator of the lists.
INSERT INTO "task_lists"
    ("id", "workspaceId", "name", "position", "createdById", "createdAt", "updatedAt")
SELECT
    'task_list_' || w."id" || '_todo',
    w."id",
    'TODO',
    0,
    w."ownerId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "workspaces" w;

INSERT INTO "task_lists"
    ("id", "workspaceId", "name", "position", "createdById", "createdAt", "updatedAt")
SELECT
    'task_list_' || w."id" || '_in_progress',
    w."id",
    'IN PROGRESS',
    1,
    w."ownerId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "workspaces" w;

INSERT INTO "task_lists"
    ("id", "workspaceId", "name", "position", "createdById", "createdAt", "updatedAt")
SELECT
    'task_list_' || w."id" || '_done',
    w."id",
    'DONE',
    2,
    w."ownerId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "workspaces" w;

-- Add listId as nullable temporarily so existing tasks can be migrated.
ALTER TABLE "tasks"
ADD COLUMN "listId" TEXT;

-- Move existing tasks into their corresponding lists.
UPDATE "tasks" t
SET "listId" = 'task_list_' || t."workspaceId" || '_todo'
WHERE t."status" = 'TODO';

UPDATE "tasks" t
SET "listId" = 'task_list_' || t."workspaceId" || '_in_progress'
WHERE t."status" = 'IN_PROGRESS';

UPDATE "tasks" t
SET "listId" = 'task_list_' || t."workspaceId" || '_done'
WHERE t."status" = 'DONE';

-- Make listId required now that every existing task has a list.
ALTER TABLE "tasks"
ALTER COLUMN "listId" SET NOT NULL;

-- Remove the old status index.
DROP INDEX "tasks_workspaceId_status_idx";

-- Remove the old status column.
ALTER TABLE "tasks"
DROP COLUMN "status";

-- Remove the old enum.
DROP TYPE "TaskStatus";

-- Create the new task/list index.
CREATE INDEX "tasks_workspaceId_listId_idx"
ON "tasks"("workspaceId", "listId");

-- Add foreign keys.
ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_listId_fkey"
FOREIGN KEY ("listId")
REFERENCES "task_lists"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "task_lists"
ADD CONSTRAINT "task_lists_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "task_lists"
ADD CONSTRAINT "task_lists_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;