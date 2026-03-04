import { useState, type FormEvent } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Textarea,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { apiCreateTweet } from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import SuivisTab from "./SuivisTab";
import TendancesTab from "./TendancesTab";
import GlobalTab from "./GlobalTab";
import "./Style.css";

type FeedTab = "suivis" | "tendances" | "global";

function Home() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("suivis");
  const [lastTweet, setLastTweet] = useState<Tweet | null>(null);

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
        description: "280 caractères maximum",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const tweet = await apiCreateTweet(content);
      setLastTweet(tweet);
      setContent("");
      toaster.create({
        title: "Tweet publié !",
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

      {/* Contenu de l'onglet actif */}
      {activeTab === "suivis" && <SuivisTab newTweet={lastTweet} />}
      {activeTab === "tendances" && <TendancesTab />}
      {activeTab === "global" && <GlobalTab newTweet={lastTweet} />}
    </Box>
  );
}

export default Home;