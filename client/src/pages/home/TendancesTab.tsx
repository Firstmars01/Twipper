import { useEffect, useCallback } from "react";
import { apiGetTrendingFeed, getStoredUser } from "../../service/api";
import { toaster } from "../../utils/toaster";
import { useTweetList } from "../../ui/tweet-list/useTweetList";
import TweetList from "../../ui/tweet-list/TweetList";

function TendancesTab() {
  const currentUser = getStoredUser();
  const { tweets, setTweets, handleUpdated, handleDeleted, handleLikeChanged, handleRetweeted } = useTweetList();

  const loadTrending = useCallback(async () => {
    try {
      const data = await apiGetTrendingFeed();
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
    loadTrending();
  }, [loadTrending]);

  return (
    <TweetList
      tweets={tweets}
      currentUserId={currentUser?.id}
      emptyMessage="Aucune tendance pour le moment."
      onUpdated={handleUpdated}
      onDeleted={handleDeleted}
      onLikeChanged={handleLikeChanged}
      onRetweeted={handleRetweeted}
    />
  );
}

export default TendancesTab;
