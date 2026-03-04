import { useState, useEffect, useCallback } from "react";
import { VStack, Text } from "@chakra-ui/react";
import { apiGetFeed, getStoredUser } from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import TweetCard from "../../ui/tweet-card/TweetCard";

interface SuivisTabProps {
  newTweet: Tweet | null;
}

function SuivisTab({ newTweet }: SuivisTabProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const currentUser = getStoredUser();

  const loadFeed = useCallback(async () => {
    try {
      const data = await apiGetFeed();
      setTweets(data);
    } catch (err: any) {
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (newTweet) {
      setTweets((prev) => [newTweet, ...prev]);
    }
  }, [newTweet]);

  function handleUpdated(updated: Tweet) {
    setTweets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDeleted(id: string) {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  }

  function handleLikeChanged(id: string, isLiked: boolean, likes: number) {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isLiked, _count: { ...t._count, likes } } : t
      )
    );
  }

  function handleRetweeted(retweet: Tweet) {
    setTweets((prev) => [retweet, ...prev]);
  }

  return (
    <VStack align="stretch" gap={4}>
      {tweets.length === 0 && (
        <Text color="gray.500" textAlign="center">
          Aucun tweet pour le moment. Publiez le premier !
        </Text>
      )}

      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          currentUserId={currentUser?.id}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          onLikeChanged={handleLikeChanged}
          onRetweeted={handleRetweeted}
        />
      ))}
    </VStack>
  );
}

export default SuivisTab;
