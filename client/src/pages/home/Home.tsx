import { useState, useEffect, type FormEvent } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Textarea,
  VStack,
  HStack,
} from "@chakra-ui/react";
import {
  apiCreateTweet,
  apiGetFeed,
  getStoredUser,
} from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import TweetCard from "../../ui/tweet-card/TweetCard";
import "./Style.css";

function Home() {
  const [content, setContent] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = getStoredUser();

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
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
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!content.trim()) return;

    if (content.length > 280) {
      toaster.create({
        title: "Tweet trop long",
        description: "280 caract\u00e8res maximum",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const tweet = await apiCreateTweet(content);
      setTweets((prev) => [tweet, ...prev]);
      setContent("");
      toaster.create({
        title: "Tweet publi\u00e9 !",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleUpdated(updated: Tweet) {
    setTweets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDeleted(id: string) {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  }

  function handleLikeChanged(id: string, isLiked: boolean, likes: number) {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isLiked, _count: { ...t._count, likes } } : t
      )
    );
  }

  return (
    <Box className="home">
      <Heading size="lg" mb={4}>
        Fil d'actualit
      </Heading>

      {/* Formulaire de tweet */}
      <Box className="tweet-form-card" mb={6}>
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={3}>
            <Textarea
              placeholder="Quoi de neuf ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              resize="none"
              rows={3}
            />
            <HStack justify="space-between">
              <Text fontSize="sm" color={content.length > 260 ? "red.400" : "gray.500"}>
                {content.length}/280
              </Text>
              <Button
                className="home-btn"
                type="submit"
                disabled={loading || !content.trim()}
                size="sm"
              >
                {loading ? "Envoi..." : "Tweeter"}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>

      {/* Liste des tweets */}
      <VStack align="stretch" gap={4}>
        {tweets.length === 0 && (
          <Text color="gray.500" textAlign="center">
            Aucun tweet pour le moment. Publiez le premier !
          </Text>
        )}

        {tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            currentUserId={currentUser?.id}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onLikeChanged={handleLikeChanged}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default Home;