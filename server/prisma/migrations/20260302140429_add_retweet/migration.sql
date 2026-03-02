-- AlterTable
ALTER TABLE "tweets" ADD COLUMN     "retweetOfId" TEXT;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_retweetOfId_fkey" FOREIGN KEY ("retweetOfId") REFERENCES "tweets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
