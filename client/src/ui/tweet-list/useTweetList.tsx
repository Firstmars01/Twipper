import { useState, useCallback } from "react";
import type { Tweet } from "../../service/api";

/**
 * Hook réutilisable pour gérer une liste de tweets :
 * state + handlers (update, delete, like, retweet, ajout).
 */
export function useTweetList(initialTweets: Tweet[] = []) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets);

  const replaceTweets = useCallback((data: Tweet[]) => setTweets(data), []);

  const addTweet = useCallback((tweet: Tweet) => {
    setTweets((prev) =>
      prev.some((t) => t.id === tweet.id) ? prev : [tweet, ...prev]
    );
  }, []);

  const handleUpdated = useCallback((updated: Tweet) => {
    setTweets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setTweets((prev) => prev.filter((t) => t.id !== id && t.retweetOf?.id !== id));
  }, []);

  const handleLikeChanged = useCallback(
    (id: string, isLiked: boolean, likes: number) => {
      setTweets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isLiked, _count: { ...t._count, likes } } : t
        )
      );
    },
    []
  );

  const handleRetweeted = useCallback((retweet: Tweet) => {
    setTweets((prev) =>
      prev.some((t) => t.id === retweet.id) ? prev : [retweet, ...prev]
    );
  }, []);

  return {
    tweets,
    setTweets: replaceTweets,
    addTweet,
    handleUpdated,
    handleDeleted,
    handleLikeChanged,
    handleRetweeted,
  };
}
