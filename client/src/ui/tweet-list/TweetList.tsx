import { VStack, Text } from "@chakra-ui/react";
import type { Tweet } from "../../service/api";
import TweetCard from "../tweetCard/TweetCard";

interface TweetListProps {
  tweets: Tweet[];
  currentUserId?: string;
  emptyMessage?: string;
  onUpdated: (updated: Tweet) => void;
  onDeleted: (id: string) => void;
  onLikeChanged: (id: string, isLiked: boolean, likes: number) => void;
  onRetweeted: (retweet: Tweet) => void;
  hideAuthorLink?: boolean;
}

function TweetList({
  tweets,
  currentUserId,
  emptyMessage = "Aucun tweet pour le moment.",
  onUpdated,
  onDeleted,
  onLikeChanged,
  onRetweeted,
  hideAuthorLink = false,
}: TweetListProps) {
  if (tweets.length === 0) {
    return (
      <Text color="gray.500" textAlign="center">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          currentUserId={currentUserId}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
          onLikeChanged={onLikeChanged}
          onRetweeted={onRetweeted}
          hideAuthorLink={hideAuthorLink}
        />
      ))}
    </VStack>
  );
}

export default TweetList;
