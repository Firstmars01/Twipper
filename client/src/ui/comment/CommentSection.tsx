import { useState, useCallback, useEffect } from "react";
import type { Comment as CommentType } from "../../service/api";
import { apiGetComments, apiCreateComment } from "../../service/api";
import { CommentItem } from "./CommentItem";
import "./Comment.css";

interface CommentSectionProps {
  tweetId: string;
  currentUserId?: string;
}

export function CommentSection({ tweetId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // New comment form
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const res = await apiGetComments(tweetId, p);
      setComments((prev) => append ? [...prev, ...res.data] : res.data);
      setTotal(res.total);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tweetId]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await apiCreateComment(tweetId, content.trim(), replyTo ?? undefined);
      setComments((prev) => [newComment, ...prev]);
      setTotal((t) => t + 1);
      setContent("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleted(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  function handleReplyClick(commentId: string) {
    const author = comments.find((c) => c.id === commentId)?.author.username;
    setReplyTo(commentId);
    setContent(author ? `@${author} ` : "");
  }

  function cancelReply() {
    setReplyTo(null);
    setContent("");
  }

  const hasMore = comments.length < total;

  return (
    <div className="comment-section">
      {/* Form */}
      {currentUserId && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? "Votre réponse..." : "Écrire un commentaire..."}
            maxLength={280}
          />
          <button type="submit" disabled={submitting || !content.trim()}>
            {submitting ? "..." : "Envoyer"}
          </button>
          {replyTo && (
            <button type="button" onClick={cancelReply} className="comment-cancel-reply-btn">
              ✕
            </button>
          )}
        </form>
      )}

      {/* Comments list */}
      {comments.length === 0 && !loading && (
        <p className="comment-empty">Aucun commentaire</p>
      )}

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDeleted={handleDeleted}
          onReplyClick={handleReplyClick}
        />
      ))}

      {hasMore && (
        <button
          className="comment-load-more"
          onClick={() => loadComments(page + 1, true)}
          disabled={loading}
        >
          {loading ? "Chargement..." : "Voir plus de commentaires"}
        </button>
      )}
    </div>
  );
}
