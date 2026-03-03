import { useState, useEffect, useCallback, type FormEvent } from "react";
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
  apiGetGlobalFeed,
  getStoredUser,
} from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import TweetCard from "../../ui/tweet-card/TweetCard";
import "./Style.css";

type FeedTab = "suivis" | "tendances" | "global";

function Home() {
  const [content, setContent] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("suivis");
  const currentUser = getStoredUser();

  const loadFeed = useCallback(async (tab: FeedTab) => {
    try {
      let data: Tweet[];
      switch (tab) {
        case "global":
          data = await apiGetGlobalFeed();
          break;
        case "tendances":
          // TODO : implémenter le endpoint tendances
          data = [];
          break;
        case "suivis":
        default:
          data = await apiGetFeed();
          break;
      }
      setTweets(data);
    } catch (err: any) {
      toaster.create({
        title: "Erreur",
        description: err.message,
        type: "error",
        duration: 4000,
      });
    }
  }, []);

  useEffect(() => {
    loadFeed(activeTab);
  }, [activeTab, loadFeed]);

  function handleTabChange(tab: FeedTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
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

  function handleRetweeted(retweet: Tweet) {
    setTweets((prev) => [retweet, ...prev]);
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

      {/* Onglets de navigation */}
      <div className="home-tabs">
        <button
          className={`home-tab ${activeTab === "suivis" ? "home-tab--active" : ""}`}
          onClick={() => handleTabChange("suivis")}
          type="button"
        >
          Suivis
        </button>
        <button
          className={`home-tab ${activeTab === "tendances" ? "home-tab--active" : ""}`}
          onClick={() => handleTabChange("tendances")}
          type="button"
        >
          Tendances
        </button>
        <button
          className={`home-tab ${activeTab === "global" ? "home-tab--active" : ""}`}
          onClick={() => handleTabChange("global")}
          type="button"
        >
          Global
        </button>
      </div>

      {/* Liste des tweets */}
      <VStack align="stretch" gap={4}>
        {tweets.length === 0 && (
          <Text color="gray.500" textAlign="center">
            {activeTab === "tendances"
              ? "Les tendances arrivent bientôt !"
              : "Aucun tweet pour le moment. Publiez le premier !"}
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
            onRetweeted={handleRetweeted}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default Home;