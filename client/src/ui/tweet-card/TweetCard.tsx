import { useState, useEffect, useCallback, useMemo, memo, type FormEvent, type ChangeEvent } from "react";
import {
  Box,
  Button,
  Textarea,
  VStack,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRetweet, FaPen, FaTrash } from "react-icons/fa";
import type { Tweet } from "../../service/api";
import { apiUpdateTweet, apiDeleteTweet, apiLikeTweet, apiUnlikeTweet, apiRetweetTweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import "./TweetCard.css";

interface TweetCardProps {
  tweet: Tweet;
  currentUserId?: string;
  /** Appelé après une mise à jour réussie, avec le tweet mis à jour */
  onUpdated?: (updated: Tweet) => void;
  /** Appelé après une suppression réussie, avec l'id du tweet */
  onDeleted?: (id: string) => void;
  /** Appelé après un like/unlike, avec l'id, isLiked et le nouveau count */
  onLikeChanged?: (id: string, isLiked: boolean, likes: number) => void;
  /** Appelé après un retweet réussi, avec le nouveau tweet retweet */
  onRetweeted?: (retweet: Tweet) => void;
  /** Masquer le lien vers le profil (utile sur la page profil) */
  hideAuthorLink?: boolean;
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", DATE_FORMAT_OPTIONS);
}

const TOAST_ERROR_DURATION = 4000;
const TOAST_SUCCESS_DURATION = 3000;
const MAX_TWEET_LENGTH = 280;
const WARN_THRESHOLD = 260;

function showError(message: string) {
  toaster.create({ title: "Erreur", description: message, type: "error", duration: TOAST_ERROR_DURATION });
}

function TweetCard({
  tweet,
  currentUserId,
  onUpdated,
  onDeleted,
  onLikeChanged,
  onRetweeted,
  hideAuthorLink = false,
}: TweetCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [retweetLoading, setRetweetLoading] = useState(false);
  const [liked, setLiked] = useState(tweet.isLiked);
  const [likesCount, setLikesCount] = useState(tweet._count.likes);

  // Sync si le tweet prop change (ex: après rechargement)
  useEffect(() => {
    setLiked(tweet.isLiked);
    setLikesCount(tweet._count.likes);
  }, [tweet.isLiked, tweet._count.likes]);

  // Valeurs dérivées mémorisées
  const isOwner = currentUserId === tweet.author.id;
  const isRetweet = !!tweet.retweetOf;
  const displayTweet = isRetweet ? tweet.retweetOf! : tweet;

  const dateLabel = useMemo(() =>
    displayTweet.updatedAt && displayTweet.updatedAt !== displayTweet.createdAt
      ? `modifié le ${formatDate(displayTweet.updatedAt)}`
      : formatDate(displayTweet.createdAt),
    [displayTweet.updatedAt, displayTweet.createdAt]
  );

  // Handlers stabilisés avec useCallback
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

  const handleUpdate = useCallback(async (e: FormEvent) => {
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
  }, [editContent, tweet.id, onUpdated]);

  const handleDelete = useCallback(async () => {
    try {
      await apiDeleteTweet(tweet.id);
      toaster.create({ title: "Tweet supprimé", type: "error", duration: TOAST_SUCCESS_DURATION });
      onDeleted?.(tweet.id);
    } catch (err: any) {
      showError(err.message);
    }
  }, [tweet.id, onDeleted]);

  const handleToggleLike = useCallback(async () => {
    if (!currentUserId) return;
    // Mise à jour optimiste
    const wasLiked = liked;
    const prevCount = likesCount;
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);
    try {
      const result = wasLiked
        ? await apiUnlikeTweet(tweet.id)
        : await apiLikeTweet(tweet.id);
      // Sync avec le serveur
      setLiked(result.isLiked);
      setLikesCount(result.likes);
      onLikeChanged?.(tweet.id, result.isLiked, result.likes);
    } catch (err: any) {
      // Rollback
      setLiked(wasLiked);
      setLikesCount(prevCount);
      showError(err.message);
    } finally {
      setLikeLoading(false);
    }
  }, [currentUserId, liked, likesCount, tweet.id, onLikeChanged]);

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

  // Classes CSS mémorisées
  const likeButtonClass = `tweet-card-like-btn ${liked ? "tweet-card-like-btn--liked" : ""}`;
  const editCounterClass = `tweet-card-edit-counter ${editContent.length > WARN_THRESHOLD ? "tweet-card-edit-counter--warn" : "tweet-card-edit-counter--normal"}`;
  const likeDisabled = likeLoading || !currentUserId;
  const retweetDisabled = retweetLoading || !currentUserId;
  const saveDisabled = editLoading || !editContent.trim();

  return (
    <Box className="tweet-card">
      {/* Bandeau retweet */}
      {isRetweet && (
        <div className="tweet-card-retweet-banner">
          <FaRetweet /> <span>Retweeté par @{tweet.author.username}</span>
        </div>
      )}
      <HStack align="start" gap={3}>
        <Avatar.Root size="sm">
          <Avatar.Fallback name={displayTweet.author.username} />
          {displayTweet.author.avatar && <Avatar.Image src={displayTweet.author.avatar} />}
        </Avatar.Root>
        <Box flex="1" minW={0}>
          {/* En-tête : auteur + date */}
          <div className="tweet-card-header">
            <div className="tweet-card-info">
              {hideAuthorLink ? (
                <span className="tweet-card-author">
                  @{displayTweet.author.username}
                </span>
              ) : (
                <RouterLink to={`/profile/${displayTweet.author.username}`}>
                  <span className="tweet-card-author">
                    @{displayTweet.author.username}
                  </span>
                </RouterLink>
              )}
              <span className="tweet-card-date">
                {dateLabel}
              </span>
            </div>
          </div>

          {/* Contenu ou formulaire d'édition */}
          {editing && !isRetweet ? (
            <form onSubmit={handleUpdate}>
              <VStack align="stretch" gap={2} mt={1}>
                <Textarea
                  value={editContent}
                  onChange={handleEditChange}
                  maxLength={MAX_TWEET_LENGTH}
                  resize="none"
                  rows={2}
                  size="sm"
                />
                <HStack justify="space-between">
                  <span className={editCounterClass}>
                    {editContent.length}/{MAX_TWEET_LENGTH}
                  </span>
                  <HStack gap={2}>
                    <Button size="xs" variant="ghost" onClick={cancelEdit}>
                      Annuler
                    </Button>
                    <Button
                      size="xs"
                      className="tweet-card-save-btn"
                      type="submit"
                      disabled={saveDisabled}
                    >
                      {editLoading ? "Envoi..." : "Enregistrer"}
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </form>
          ) : (
            <p className="tweet-card-content">
              {displayTweet.content}
            </p>
          )}

          {/* Pied : likes + retweet + actions */}
          <div className="tweet-card-footer">
            <div className="tweet-card-footer-left">
              <button
                className={likeButtonClass}
                onClick={handleToggleLike}
                disabled={likeDisabled}
                type="button"
              >
                {liked ? <FaHeart /> : <FaRegHeart />} {likesCount}
              </button>
              <button
                className="tweet-card-retweet-btn"
                onClick={handleRetweet}
                disabled={retweetDisabled}
                type="button"
              >
                <FaRetweet /> <span className="tweet-card-btn-label"></span>
              </button>
            </div>
            {isOwner && !editing && (
              <div className="tweet-card-actions">
                {isRetweet ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={handleDelete}
                  >
                    <FaTrash /> <span className="tweet-card-btn-label">Supprimer le retweet</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="blue"
                      onClick={startEdit}
                    >
                      <FaPen /> <span className="tweet-card-btn-label"></span>
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={handleDelete}
                    >
                      <FaTrash /> <span className="tweet-card-btn-label"></span>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </Box>
      </HStack>
    </Box>
  );
}

export default memo(TweetCard);
