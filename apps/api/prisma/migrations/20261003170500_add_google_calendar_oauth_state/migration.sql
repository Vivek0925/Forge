-- CreateTable
CREATE TABLE "google_calendar_oauth_states" (
    "id" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "returnTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_calendar_oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_oauth_states_stateHash_key" ON "google_calendar_oauth_states"("stateHash");

-- CreateIndex
CREATE INDEX "google_calendar_oauth_states_userId_idx" ON "google_calendar_oauth_states"("userId");

-- CreateIndex
CREATE INDEX "google_calendar_oauth_states_expiresAt_idx" ON "google_calendar_oauth_states"("expiresAt");

-- AddForeignKey
ALTER TABLE "google_calendar_oauth_states" ADD CONSTRAINT "google_calendar_oauth_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
