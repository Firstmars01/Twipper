import { memo, useState } from "react";
import { Box, HStack, Avatar } from "@chakra-ui/react";
import { FaRetweet } from "react-icons/fa";
import type { TweetCardProps } from "../../utils/tweetTypes";
import { useTweetCard } from "./useTweetCard";
import { TweetCardHeader } from "./TweetCardHeader";
import { TweetEditForm } from "./TweetEditForm";
import { TweetCardFooter } from "./TweetCardFooter";
import { CommentSection } from "../comment/CommentSection";
import "./TweetCard.css";

function TweetCard({
  tweet,
  currentUserId,
  onUpdated,
  onDeleted,
  onLikeChanged,
  onRetweeted,
  hideAuthorLink = false,
}: TweetCardProps) {
  const {
    editing,
    editContent,
    editLoading,
    likeLoading,
    retweetLoading,
    liked,
    likesCount,
    isOwner,
    isRetweet,
    displayTweet,
    dateLabel,
    startEdit,
    cancelEdit,
    handleEditChange,
    handleUpdate,
    handleDelete,
    handleToggleLike,
    handleRetweet,
  } = useTweetCard({ tweet, currentUserId, onUpdated, onDeleted, onLikeChanged, onRetweeted });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const realTweetId = isRetweet && tweet.retweetOf ? tweet.retweetOf.id : tweet.id;

  return (
    <Box className="tweet-card">
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
          <TweetCardHeader
            username={displayTweet.author.username}
            dateLabel={dateLabel}
            hideAuthorLink={hideAuthorLink}
          />

          {editing && !isRetweet ? (
            <TweetEditForm
              editContent={editContent}
              editLoading={editLoading}
              onChange={handleEditChange}
              onSubmit={handleUpdate}
              onCancel={cancelEdit}
            />
          ) : (
            <p className="tweet-card-content">{displayTweet.content}</p>
          )}

          <TweetCardFooter
            liked={liked}
            likesCount={likesCount}
            likeDisabled={likeLoading || !currentUserId}
            retweetDisabled={retweetLoading || !currentUserId}
            isOwner={isOwner}
            isRetweet={isRetweet}
            editing={editing}
            commentsOpen={commentsOpen}
            onToggleLike={handleToggleLike}
            onRetweet={handleRetweet}
            onStartEdit={startEdit}
            onDelete={handleDelete}
            onToggleComments={() => setCommentsOpen((o) => !o)}
          />

          {commentsOpen && (
            <CommentSection tweetId={realTweetId} currentUserId={currentUserId} />
          )}
        </Box>
      </HStack>
    </Box>
  );
}

export default memo(TweetCard);
