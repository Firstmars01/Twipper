import { Button } from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaRetweet, FaPen, FaTrash, FaRegComment } from "react-icons/fa";

interface TweetCardFooterProps {
  liked: boolean;
  likesCount: number;
  likeDisabled: boolean;
  retweetDisabled: boolean;
  isOwner: boolean;
  isRetweet: boolean;
  editing: boolean;
  commentsOpen: boolean;
  onToggleLike: () => void;
  onRetweet: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
}

export function TweetCardFooter({
  liked,
  likesCount,
  likeDisabled,
  retweetDisabled,
  isOwner,
  isRetweet,
  editing,
  commentsOpen,
  onToggleLike,
  onRetweet,
  onStartEdit,
  onDelete,
  onToggleComments,
}: TweetCardFooterProps) {
  const likeButtonClass = `tweet-card-like-btn ${liked ? "tweet-card-like-btn--liked" : ""}`;

  return (
    <div className="tweet-card-footer">
      <div className="tweet-card-footer-left">
        <Button className={likeButtonClass} onClick={onToggleLike} disabled={likeDisabled} type="button">
          {liked ? <FaHeart /> : <FaRegHeart />} {likesCount}
        </Button>
        <Button className="tweet-card-retweet-btn" onClick={onRetweet} disabled={retweetDisabled} type="button">
          <FaRetweet /> <span className="tweet-card-btn-label"></span>
        </Button>
        <Button className="tweet-card-comment-btn" onClick={onToggleComments} type="button">
          <FaRegComment /> <span className="tweet-card-btn-label">{commentsOpen ? "" : ""}</span>
        </Button>
      </div>

      {isOwner && !editing && (
        <div className="tweet-card-actions">
          {isRetweet ? (
            <Button size="xs" variant="ghost" colorPalette="red" onClick={onDelete}>
              <FaTrash /> <span className="tweet-card-btn-label">Supprimer le retweet</span>
            </Button>
          ) : (
            <>
              <Button size="xs" variant="ghost" colorPalette="blue" onClick={onStartEdit}>
                <FaPen /> <span className="tweet-card-btn-label"></span>
              </Button>
              <Button size="xs" variant="ghost" colorPalette="red" onClick={onDelete}>
                <FaTrash /> <span className="tweet-card-btn-label"></span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
