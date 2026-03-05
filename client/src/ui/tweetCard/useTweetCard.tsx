import { useState, useEffect, useCallback, useMemo, type FormEvent, type ChangeEvent } from "react";
import type { Tweet } from "../../service/api";
import { apiUpdateTweet, apiDeleteTweet, apiLikeTweet, apiUnlikeTweet, apiRetweetTweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import { MAX_TWEET_LENGTH, TOAST_ERROR_DURATION, TOAST_SUCCESS_DURATION, formatDate, showError } from "../../utils/tweet";

interface UseTweetCardOptions {
  tweet: Tweet;
  currentUserId?: string;
  onUpdated?: (updated: Tweet) => void;
  onDeleted?: (id: string) => void;
  onLikeChanged?: (id: string, isLiked: boolean, likes: number) => void;
  onRetweeted?: (retweet: Tweet) => void;
}

export function useTweetCard({
  tweet,
  currentUserId,
  onUpdated,
  onDeleted,
  onLikeChanged,
  onRetweeted,
}: UseTweetCardOptions) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [retweetLoading, setRetweetLoading] = useState(false);
  const [liked, setLiked] = useState(tweet.isLiked);
  const [likesCount, setLikesCount] = useState(tweet._count.likes);

  useEffect(() => {
    setLiked(tweet.isLiked);
    setLikesCount(tweet._count.likes);
  }, [tweet.isLiked, tweet._count.likes]);

  const isOwner = currentUserId === tweet.author.id;
  const isRetweet = !!tweet.retweetOf;
  const displayTweet = isRetweet ? tweet.retweetOf! : tweet;

  const dateLabel = useMemo(
    () =>
      displayTweet.updatedAt && displayTweet.updatedAt !== displayTweet.createdAt
        ? `modifié le ${formatDate(displayTweet.updatedAt)}`
        : formatDate(displayTweet.createdAt),
    [displayTweet.updatedAt, displayTweet.createdAt],
  );

  // ---- Edit handlers ----
  const startEdit = useCallback(() => {
    setEditing(true);
    setEditContent(tweet.content);
  }, [tweet.content]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditContent("");
  }, []);

  const handleEditChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  }, []);

  const handleUpdate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!editContent.trim()) return;

      if (editContent.length > MAX_TWEET_LENGTH) {
        toaster.create({
          title: "Tweet trop long",
          description: `${MAX_TWEET_LENGTH} caractères maximum`,
          type: "error",
          duration: TOAST_ERROR_DURATION,
        });
        return;
      }

      setEditLoading(true);
      try {
        const updated = await apiUpdateTweet(tweet.id, editContent);
        setEditing(false);
        setEditContent("");
        toaster.create({ title: "Tweet modifié !", type: "success", duration: TOAST_SUCCESS_DURATION });
        onUpdated?.(updated);
      } catch (err: any) {
        showError(err.message);
      } finally {
        setEditLoading(false);
      }
    },
    [editContent, tweet.id, onUpdated],
  );

  // ---- Delete ----
  const handleDelete = useCallback(async () => {
    try {
      await apiDeleteTweet(tweet.id);
      toaster.create({ title: "Tweet supprimé", type: "error", duration: TOAST_SUCCESS_DURATION });
      onDeleted?.(tweet.id);
    } catch (err: any) {
      showError(err.message);
    }
  }, [tweet.id, onDeleted]);

  // ---- Like / Unlike (optimistic) ----
  const handleToggleLike = useCallback(async () => {
    if (!currentUserId) return;
    const wasLiked = liked;
    const prevCount = likesCount;
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);
    try {
      const result = wasLiked ? await apiUnlikeTweet(tweet.id) : await apiLikeTweet(tweet.id);
      setLiked(result.isLiked);
      setLikesCount(result.likes);
      onLikeChanged?.(tweet.id, result.isLiked, result.likes);
    } catch (err: any) {
      setLiked(wasLiked);
      setLikesCount(prevCount);
      showError(err.message);
    } finally {
      setLikeLoading(false);
    }
  }, [currentUserId, liked, likesCount, tweet.id, onLikeChanged]);

  // ---- Retweet ----
  const handleRetweet = useCallback(async () => {
    if (!currentUserId) return;
    setRetweetLoading(true);
    try {
      const targetId = tweet.retweetOfId || tweet.id;
      const retweet = await apiRetweetTweet(targetId);
      toaster.create({ title: "Retweeté !", type: "success", duration: TOAST_SUCCESS_DURATION });
      onRetweeted?.(retweet);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setRetweetLoading(false);
    }
  }, [currentUserId, tweet.retweetOfId, tweet.id, onRetweeted]);

  return {
    // State
    editing,
    editContent,
    editLoading,
    likeLoading,
    retweetLoading,
    liked,
    likesCount,
    // Derived
    isOwner,
    isRetweet,
    displayTweet,
    dateLabel,
    // Handlers
    startEdit,
    cancelEdit,
    handleEditChange,
    handleUpdate,
    handleDelete,
    handleToggleLike,
    handleRetweet,
  };
}
