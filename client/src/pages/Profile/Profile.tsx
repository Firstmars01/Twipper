import { Box, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  apiGetUserByUsername,
  apiFollowUser,
  apiUnfollowUser,
  apiGetFollowers,
  apiGetFollowing,
  getStoredUser,
  type AuthResponse,
} from "../../service/api";
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
        <Text className="stat-link" onClick={() => openDialog("followers")}>
          <strong>{user._count.followers}</strong> abonnés
        </Text>
        <Text className="stat-link" onClick={() => openDialog("following")}>
          <strong>{user._count.following}</strong> abonnements
        </Text>
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
