import { Box, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  apiGetUserByUsername,
  apiFollowUser,
  apiUnfollowUser,
  getStoredUser,
  type AuthResponse,
} from "../../service/api";
import Page404 from "../page404/Page404";
import "./Profile.css";

type UserProfile = AuthResponse["user"] & {
  _count: { tweets: number; followers: number; following: number };
  isFollowing: boolean;
};

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const currentUser = getStoredUser();
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    apiGetUserByUsername(username)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    if (!user || !username) return;
    setFollowLoading(true);
    try {
      if (user.isFollowing) {
        await apiUnfollowUser(username);
        setUser({
          ...user,
          isFollowing: false,
          _count: { ...user._count, followers: user._count.followers - 1 },
        });
      } else {
        await apiFollowUser(username);
        setUser({
          ...user,
          isFollowing: true,
          _count: { ...user._count, followers: user._count.followers + 1 },
        });
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="profile" style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (notFound || !user) {
    return <Page404 />;
  }

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
            {followLoading
              ? "..."
              : user.isFollowing
              ? "Abonné"
              : "Suivre"}
          </Button>
        )}
      </Box>
      <Box style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
        <Text><strong>{user._count.tweets}</strong> tweets</Text>
        <Text><strong>{user._count.followers}</strong> abonnés</Text>
        <Text><strong>{user._count.following}</strong> abonnements</Text>
      </Box>
    </Box>
  );
}

export default Profile;
