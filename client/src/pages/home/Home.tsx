import { useState, useEffect, type FormEvent } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Textarea,
  VStack,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  apiCreateTweet,
  apiGetFeed,
  apiUpdateTweet,
  apiDeleteTweet,
  getStoredUser,
} from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import "./Style.css";

function Home() {
  const [content, setContent] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
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
        description: "280 caractères maximum",
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

  function startEdit(tweet: Tweet) {
    setEditingId(tweet.id);
    setEditContent(tweet.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingId || !editContent.trim()) return;

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
      const updated = await apiUpdateTweet(editingId, editContent);
      setTweets((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setEditingId(null);
      setEditContent("");
      toaster.create({
        title: "Tweet modifié !",
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
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteTweet(id);
      setTweets((prev) => prev.filter((t) => t.id !== id));
      toaster.create({
        title: "Tweet supprimé",
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
    }
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

  return (
    <Box className="home">
      <Heading size="lg" mb={4}>
        Fil d'actualité
      </Heading>

      {/* Formulaire de création de tweet */}
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
          <Box key={tweet.id} className="tweet-card">
            <HStack align="start" gap={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback name={tweet.author.username} />
                {tweet.author.avatar && <Avatar.Image src={tweet.author.avatar} />}
              </Avatar.Root>
              <Box flex="1">
                <HStack justify="space-between" mb={1}>
                  <HStack gap={2}>
                    <RouterLink to={`/profile/${tweet.author.username}`}>
                      <Text fontWeight="bold" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                        @{tweet.author.username}
                      </Text>
                    </RouterLink>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(tweet.createdAt)}
                    </Text>
                    {tweet.updatedAt && tweet.updatedAt !== tweet.createdAt && (
                      <Text fontSize="xs" color="orange.400" fontStyle="italic">
                        (modifié)
                      </Text>
                    )}
                  </HStack>
                  {currentUser?.id === tweet.author.id && (
                    <HStack gap={1}>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={() => startEdit(tweet)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleDelete(tweet.id)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  )}
                </HStack>

                {editingId === tweet.id ? (
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
                        <Text fontSize="xs" color={editContent.length > 260 ? "red.400" : "gray.500"}>
                          {editContent.length}/280
                        </Text>
                        <HStack gap={2}>
                          <Button size="xs" variant="ghost" onClick={cancelEdit}>
                            Annuler
                          </Button>
                          <Button
                            size="xs"
                            className="home-btn"
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
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {tweet.content}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {tweet._count.likes} like{tweet._count.likes !== 1 ? "s" : ""}
                </Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default Home;