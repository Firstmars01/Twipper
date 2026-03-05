import { useEffect, useCallback } from "react";
import { apiGetFeed, getStoredUser } from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import { useTweetList } from "../../ui/tweet-list/useTweetList";
import TweetList from "../../ui/tweet-list/TweetList";

interface SuivisTabProps {
  newTweet: Tweet | null;
}

function SuivisTab({ newTweet }: SuivisTabProps) {
  const currentUser = getStoredUser();
  const { tweets, setTweets, addTweet, handleUpdated, handleDeleted, handleLikeChanged, handleRetweeted } = useTweetList();

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
  }, [setTweets]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (newTweet) addTweet(newTweet);
  }, [newTweet, addTweet]);

  return (
    <TweetList
      tweets={tweets}
      currentUserId={currentUser?.id}
      emptyMessage="Aucun tweet pour le moment. Publiez le premier !"
      onUpdated={handleUpdated}
      onDeleted={handleDeleted}
      onLikeChanged={handleLikeChanged}
      onRetweeted={handleRetweeted}
    />
  );
}

export default SuivisTab;
