import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  apiGetUserByUsername,
  apiFollowUser,
  apiUnfollowUser,
  apiGetUserTweets,
  getStoredUser,
} from "../../service/api";
import type { FollowUser } from "../../ui/followListDialog/FollowListDialog";
import { DIALOG_CONFIG, type UserProfile, type DialogKind } from "./Types";
import { useTweetList } from "../../ui/tweet-list/useTweetList";

export function useProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<DialogKind>("followers");
  const [dialogUsers, setDialogUsers] = useState<FollowUser[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const { tweets, setTweets: replaceTweets, handleUpdated: handleTweetUpdated, handleDeleted: baseTweetDeleted, handleLikeChanged, handleRetweeted } = useTweetList();
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const isOwnProfile = currentUser?.username === username;
  const dialogTitle = DIALOG_CONFIG[dialogKind].title;

  // ── Fetch user + tweets ──
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
      .then(replaceTweets)
      .catch(() => replaceTweets([]))
      .finally(() => setTweetsLoading(false));
  }, [username]);

  // ── Follow / Unfollow ──
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

  // ── Followers / Following dialog ──
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

  // ── Tweet callbacks ──
  function handleTweetDeleted(id: string) {
    baseTweetDeleted(id);
    if (user) {
      setUser({ ...user, _count: { ...user._count, tweets: user._count.tweets - 1 } });
    }
  }

  // ── Profile edit ──
  function handleProfileSaved(updated: { username: string; bio?: string; flag?: string }) {
    setEditing(false);
    setUser((prev) => (prev ? { ...prev, username: updated.username, bio: updated.bio, flag: updated.flag } : prev));
    // Rafraîchir currentUser depuis le storage (mis à jour par ProfileEditForm)
    setCurrentUser(getStoredUser());
    if (updated.username !== username) {
      navigate(`/profile/${updated.username}`, { replace: true });
    }
  }

  return {
    username,
    user,
    loading,
    notFound,
    currentUser,
    isOwnProfile,
    // follow
    followLoading,
    handleFollow,
    // dialog
    dialogOpen,
    setDialogOpen,
    dialogTitle,
    dialogUsers,
    dialogLoading,
    openDialog,
    // tweets
    tweets,
    tweetsLoading,
    handleTweetUpdated,
    handleTweetDeleted,
    handleLikeChanged,
    handleRetweeted,
    // editing
    editing,
    setEditing,
    handleProfileSaved,
  };
}
