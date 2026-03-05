import { useState } from "react";
import { Avatar } from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";
import type { Comment as CommentType } from "../../service/api";
import { apiLikeComment, apiUnlikeComment, apiDeleteComment } from "../../service/api";

interface CommentItemProps {
  comment: CommentType;
  currentUserId?: string;
  onDeleted: (id: string) => void;
  onReplyClick: (commentId: string) => void;
}

export function CommentItem({ comment, currentUserId, onDeleted, onReplyClick }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === comment.author.id;

  const dateLabel = new Date(comment.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleToggleLike() {
    if (likeLoading || !currentUserId) return;
    setLikeLoading(true);
    try {
      const result = liked
        ? await apiUnlikeComment(comment.id)
        : await apiLikeComment(comment.id);
      setLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await apiDeleteComment(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  return (
    <div className="comment-item">
      <Avatar.Root size="xs">
        <Avatar.Fallback name={comment.author.username} />
        {comment.author.avatar && <Avatar.Image src={comment.author.avatar} />}
      </Avatar.Root>

      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">@{comment.author.username}</span>
          <span className="comment-date">{dateLabel}</span>
        </div>
        <p className="comment-content">{comment.content}</p>

        <div className="comment-footer">
          <button
            className={`comment-like-btn ${liked ? "comment-like-btn--liked" : ""}`}
            onClick={handleToggleLike}
            disabled={likeLoading || !currentUserId}
          >
            {liked ? <FaHeart /> : <FaRegHeart />} {likesCount}
          </button>

          {currentUserId && (
            <button className="comment-reply-btn" onClick={() => onReplyClick(comment.id)}>
              <FaReply /> Répondre
            </button>
          )}

          {isOwner && (
            <button className="comment-delete-btn" onClick={handleDelete} disabled={deleting} title="Supprimer">
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
