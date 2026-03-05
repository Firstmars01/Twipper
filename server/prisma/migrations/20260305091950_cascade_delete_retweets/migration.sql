-- DropForeignKey
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_retweetOfId_fkey";

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_retweetOfId_fkey" FOREIGN KEY ("retweetOfId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
