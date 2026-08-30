ALTER TABLE "Player" ADD COLUMN "currentServerKey" TEXT;

ALTER TABLE "ServerState" ADD COLUMN "serverKey" TEXT;
ALTER TABLE "ServerState" ADD COLUMN "displayName" TEXT;
UPDATE "ServerState" SET "serverKey" = 'survival', "displayName" = 'Survival';
ALTER TABLE "ServerState" ALTER COLUMN "serverKey" SET NOT NULL;
ALTER TABLE "ServerState" ALTER COLUMN "displayName" SET NOT NULL;
ALTER TABLE "ServerState" DROP CONSTRAINT "ServerState_pkey";
ALTER TABLE "ServerState" DROP COLUMN "id";
ALTER TABLE "ServerState" ADD CONSTRAINT "ServerState_pkey" PRIMARY KEY ("serverKey");
