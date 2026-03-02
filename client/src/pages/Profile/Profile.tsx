import { Box, Heading, Text, Spinner, Button, VStack, HStack, Textarea, Avatar } from "@chakra-ui/react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo, type FormEvent } from "react";
import {
  apiGetUserByUsername,
  apiFollowUser,
  apiUnfollowUser,
  apiGetFollowers,
  apiGetFollowing,
  apiGetUserTweets,
  apiUpdateTweet,
  apiDeleteTweet,
  getStoredUser,
  type AuthResponse,
} from "../../service/api";
import type { Tweet } from "../../service/api";
import { toaster } from "../../utils/toaster";
import Page404 from "../page404/Page404";
import FollowListDialog, { type FollowUser } from "../../ui/follow-list-dialog/FollowListDialog";
import "./Style.css";

type UserProfile = AuthResponse["user"] & {
  _count: { tweets: number; followers: number; following: number };
  isFollowing: boolean;
};

type DialogKind = "followers" | "following";

const DIALOG_CONFIG: Record<DialogKind, { title: string; fetcher: (u: string) => Promise<FollowUser[]> }> = {
  followers: { title: "Abonnés", fetcher: apiGetFollowers },
  following: { title: "Abonnements", fetcher: apiGetFollowing },
};

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<DialogKind>("followers");
  const [dialogUsers, setDialogUsers] = useState<FollowUser[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const currentUser = useMemo(() => getStoredUser(), []);
  const isOwnProfile = currentUser?.username === username;
  const dialogTitle = DIALOG_CONFIG[dialogKind].title;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    apiGetUserByUsername(username)
      .then((data) => (data ? setUser(data) : setNotFound(true)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    setTweetsLoading(true);
    apiGetUserTweets(username)
      .then(setTweets)
      .catch(() => setTweets([]))
      .finally(() => setTweetsLoading(false));
  }, [username]);

  const handleFollow = useCallback(async () => {
    if (!user || !username) return;
    setFollowLoading(true);
    try {
      const willFollow = !user.isFollowing;
      willFollow ? await apiFollowUser(username) : await apiUnfollowUser(username);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: willFollow,
              _count: { ...prev._count, followers: prev._count.followers + (willFollow ? 1 : -1) },
            }
          : prev
      );
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setFollowLoading(false);
    }
  }, [user, username]);

  const openDialog = useCallback(
    async (kind: DialogKind) => {
      if (!username) return;
      setDialogKind(kind);
      setDialogOpen(true);
      setDialogLoading(true);
      try {
        setDialogUsers(await DIALOG_CONFIG[kind].fetcher(username));
      } catch {
        setDialogUsers([]);
      } finally {
        setDialogLoading(false);
      }
    },
    [username]
  );

  function startEdit(tweet: Tweet) {
    setEditingId(tweet.id);
    setEditContent(tweet.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleUpdateTweet(e: FormEvent) {
    e.preventDefault();
    if (!editingId || !editContent.trim()) return;

    if (editContent.length > 280) {
      toaster.create({ title: "Tweet trop long", description: "280 caractères maximum", type: "error", duration: 4000 });
      return;
    }

    setEditLoading(true);
    try {
      const updated = await apiUpdateTweet(editingId, editContent);
      setTweets((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setEditingId(null);
      setEditContent("");
      toaster.create({ title: "Tweet modifié !", type: "success", duration: 3000 });
    } catch (err: any) {
      toaster.create({ title: "Erreur", description: err.message, type: "error", duration: 4000 });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteTweet(id: string) {
    try {
      await apiDeleteTweet(id);
      setTweets((prev) => prev.filter((t) => t.id !== id));
      if (user) {
        setUser({ ...user, _count: { ...user._count, tweets: user._count.tweets - 1 } });
      }
      toaster.create({ title: "Tweet supprimé", type: "success", duration: 3000 });
    } catch (err: any) {
      toaster.create({ title: "Erreur", description: err.message, type: "error", duration: 4000 });
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

  if (loading) {
    return (
      <Box className="profile-loading">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (notFound || !user) return <Page404 />;

  return (
    <Box className="profile">
      <Box className="profile-banner" />
      <Box className="profile-body">
        <Box className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </Box>
        <Box className="profile-header">
          <Box>
            <Heading className="profile-title">@{user.username}</Heading>
            <Text className="profile-subtitle">{user.bio || "Aucune bio"}</Text>
          </Box>
          {!isOwnProfile && currentUser && (
            <Button
              className={`follow-btn ${user.isFollowing ? "following" : ""}`}
              onClick={handleFollow}
              disabled={followLoading}
              size="sm"
            >
              {followLoading ? "..." : user.isFollowing ? "Abonné" : "Suivre"}
            </Button>
          )}
        </Box>

        <Box className="profile-stats">
          <Text><strong>{user._count.tweets}</strong> tweets</Text>
          {isOwnProfile ? (
            <>
              <Text className="stat-link" onClick={() => openDialog("followers")}>
                <strong>{user._count.followers}</strong> abonnés
              </Text>
              <Text className="stat-link" onClick={() => openDialog("following")}>
                <strong>{user._count.following}</strong> abonnements
              </Text>
            </>
          ) : (
            <>
              <Text><strong>{user._count.followers}</strong> abonnés</Text>
              <Text><strong>{user._count.following}</strong> abonnements</Text>
            </>
          )}
        </Box>
      </Box>

      {/* Tweets de l'utilisateur */}
      <Box className="profile-tweets">
        <Heading size="md" mb={4}>
          Tweets
        </Heading>

        {tweetsLoading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
          </Box>
        ) : tweets.length === 0 ? (
          <Text color="gray.500" textAlign="center">
            Aucun tweet pour le moment.
          </Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {tweets.map((tweet) => (
              <Box key={tweet.id} className="profile-tweet-card">
                <HStack justify="space-between" mb={1} flexWrap="wrap" gap={1}>
                  <HStack gap={2} flexWrap="wrap">
                    <Text fontWeight="bold" fontSize="sm">
                      @{tweet.author.username}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {tweet.updatedAt && tweet.updatedAt !== tweet.createdAt
                        ? `modifié le ${formatDate(tweet.updatedAt)}`
                        : formatDate(tweet.createdAt)}
                    </Text>
                  </HStack>
                </HStack>

                {editingId === tweet.id ? (
                  <form onSubmit={handleUpdateTweet}>
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
                            colorPalette="blue"
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

                <HStack justify="space-between" mt={2}>
                  <Text fontSize="xs" color="gray.500">
                    {tweet._count.likes} like{tweet._count.likes !== 1 ? "s" : ""}
                  </Text>
                  {currentUser?.id === tweet.author.id && editingId !== tweet.id && (
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
                        onClick={() => handleDeleteTweet(tweet.id)}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <FollowListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        users={dialogUsers}
        loading={dialogLoading}
      />
    </Box>
  );
}

export default Profile;
