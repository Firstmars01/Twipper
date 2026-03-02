import { useState, useEffect, type FormEvent } from "react";
import {
  Box,
  Button,
  Textarea,
  VStack,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import type { Tweet } from "../../service/api";
import { apiUpdateTweet, apiDeleteTweet, apiLikeTweet, apiUnlikeTweet } from "../../service/api";
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
  /** Masquer le lien vers le profil (utile sur la page profil) */
  hideAuthorLink?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TweetCard({
  tweet,
  currentUserId,
  onUpdated,
  onDeleted,
  onLikeChanged,
  hideAuthorLink = false,
}: TweetCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(tweet.isLiked);
  const [likesCount, setLikesCount] = useState(tweet._count.likes);

  // Sync si le tweet prop change (ex: après rechargement)
  useEffect(() => {
    setLiked(tweet.isLiked);
    setLikesCount(tweet._count.likes);
  }, [tweet.isLiked, tweet._count.likes]);

  const isOwner = currentUserId === tweet.author.id;

  function startEdit() {
    setEditing(true);
    setEditContent(tweet.content);
  }

  function cancelEdit() {
    setEditing(false);
    setEditContent("");
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editContent.trim()) return;

    if (editContent.length > 280) {
      toaster.create({
        title: "Tweet trop long",
        description: "280 caractères maximum",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setEditLoading(true);
    try {
      const updated = await apiUpdateTweet(tweet.id, editContent);
      setEditing(false);
      setEditContent("");
      toaster.create({ title: "Tweet modifié !", type: "success", duration: 3000 });
      onUpdated?.(updated);
    } catch (err: any) {
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await apiDeleteTweet(tweet.id);
      toaster.create({ title: "Tweet supprimé", type: "success", duration: 3000 });
      onDeleted?.(tweet.id);
    } catch (err: any) {
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    }
  }

  async function handleToggleLike() {
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
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    } finally {
      setLikeLoading(false);
    }
  }

  const dateLabel =
    tweet.updatedAt && tweet.updatedAt !== tweet.createdAt
      ? `modifié le ${formatDate(tweet.updatedAt)}`
      : formatDate(tweet.createdAt);

  return (
    <Box className="tweet-card">
      <HStack align="start" gap={3}>
        <Avatar.Root size="sm">
          <Avatar.Fallback name={tweet.author.username} />
          {tweet.author.avatar && <Avatar.Image src={tweet.author.avatar} />}
        </Avatar.Root>
        <Box flex="1" minW={0}>
          {/* En-tête : auteur + date */}
          <div className="tweet-card-header">
            <div className="tweet-card-info">
              {hideAuthorLink ? (
                <span className="tweet-card-author">
                  @{tweet.author.username}
                </span>
              ) : (
                <RouterLink to={`/profile/${tweet.author.username}`}>
                  <span className="tweet-card-author">
                    @{tweet.author.username}
                  </span>
                </RouterLink>
              )}
              <span className="tweet-card-date">
                {dateLabel}
              </span>
            </div>
          </div>

          {/* Contenu ou formulaire d'édition */}
          {editing ? (
            <form onSubmit={handleUpdate}>
              <VStack align="stretch" gap={2} mt={1}>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={280}
                  resize="none"
                  rows={2}
                  size="sm"
                />
                <HStack justify="space-between">
                  <span
                    className={`tweet-card-edit-counter ${editContent.length > 260 ? "tweet-card-edit-counter--warn" : "tweet-card-edit-counter--normal"}`}
                  >
                    {editContent.length}/280
                  </span>
                  <HStack gap={2}>
                    <Button size="xs" variant="ghost" onClick={cancelEdit}>
                      Annuler
                    </Button>
                    <Button
                      size="xs"
                      className="tweet-card-save-btn"
                      type="submit"
                      disabled={editLoading || !editContent.trim()}
                    >
                      {editLoading ? "Envoi..." : "Enregistrer"}
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </form>
          ) : (
            <p className="tweet-card-content">
              {tweet.content}
            </p>
          )}

          {/* Pied : likes + actions */}
          <div className="tweet-card-footer">
            <button
              className={`tweet-card-like-btn ${liked ? "tweet-card-like-btn--liked" : ""}`}
              onClick={handleToggleLike}
              disabled={likeLoading || !currentUserId}
              type="button"
            >
              {liked ? <FaHeart /> : <FaRegHeart />} {likesCount}
            </button>
            {isOwner && !editing && (
              <div className="tweet-card-actions">
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="blue"
                  onClick={startEdit}
                >
                  Modifier
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </Box>
      </HStack>
    </Box>
  );
}

export default TweetCard;
