CREATE TABLE "Player" ("id" TEXT NOT NULL, "minecraftUuid" TEXT NOT NULL, "username" TEXT NOT NULL, "firstJoinedAt" TIMESTAMP(3) NOT NULL, "lastJoinedAt" TIMESTAMP(3) NOT NULL, "lastSeenAt" TIMESTAMP(3) NOT NULL, "playtimeSeconds" INTEGER NOT NULL DEFAULT 0, "sessionCount" INTEGER NOT NULL DEFAULT 0, "online" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Player_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Player_minecraftUuid_key" ON "Player"("minecraftUuid");
CREATE INDEX "Player_username_idx" ON "Player"("username");
CREATE INDEX "Player_firstJoinedAt_idx" ON "Player"("firstJoinedAt");
CREATE TABLE "ServerState" ("id" INTEGER NOT NULL DEFAULT 1, "version" TEXT, "playersOnline" INTEGER NOT NULL DEFAULT 0, "playersMax" INTEGER NOT NULL DEFAULT 0, "serverStartedAt" TIMESTAMP(3), "lastHeartbeatAt" TIMESTAMP(3), "stoppedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ServerState_pkey" PRIMARY KEY ("id"));
CREATE TABLE "World" ("id" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL, "displayName" TEXT NOT NULL DEFAULT 'Our World', CONSTRAINT "World_pkey" PRIMARY KEY ("id"));

