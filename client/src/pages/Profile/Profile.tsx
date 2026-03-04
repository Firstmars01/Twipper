import { Box, Heading, Text, Spinner, Button, VStack } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  apiGetUserByUsername,
  apiFollowUser,
  apiUnfollowUser,
  apiGetFollowers,
  apiGetFollowing,
  apiGetUserTweets,
  getStoredUser,
  type AuthResponse,
} from "../../service/api";
import type { Tweet } from "../../service/api";
import Page404 from "../page404/Page404";
import FollowListDialog, { type FollowUser } from "../../ui/follow-list-dialog/FollowListDialog";
import TweetCard from "../../ui/tweet-card/TweetCard";
import ProfileEditForm from "../../ui/profile-edit-form/ProfileEditForm";
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
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();
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

  function handleTweetUpdated(updated: Tweet) {
    setTweets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTweetDeleted(id: string) {
    setTweets((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      setUser({ ...user, _count: { ...user._count, tweets: user._count.tweets - 1 } });
    }
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

  function handleProfileSaved(updated: { username: string; bio?: string }) {
    setEditing(false);
    setUser((prev) => prev ? { ...prev, username: updated.username, bio: updated.bio } : prev);
    // Si le username a changé, naviguer vers la nouvelle URL
    if (updated.username !== username) {
      navigate(`/profile/${updated.username}`, { replace: true });
    }
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
          {isOwnProfile ? (
            <Button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
              size="sm"
            >
              Modifier le profil
            </Button>
          ) : currentUser ? (
            <Button
              className={`follow-btn ${user.isFollowing ? "following" : ""}`}
              onClick={handleFollow}
              disabled={followLoading}
              size="sm"
            >
              {followLoading ? "..." : user.isFollowing ? "Abonné" : "Suivre"}
            </Button>
          ) : null}
        </Box>

        {editing && (
          <ProfileEditForm
            currentUsername={user.username}
            currentBio={user.bio || ""}
            onSaved={handleProfileSaved}
            onCancel={() => setEditing(false)}
          />
        )}

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
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                currentUserId={currentUser?.id}
                onUpdated={handleTweetUpdated}
                onDeleted={handleTweetDeleted}
                onLikeChanged={handleLikeChanged}
                onRetweeted={handleRetweeted}
                hideAuthorLink
              />
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
