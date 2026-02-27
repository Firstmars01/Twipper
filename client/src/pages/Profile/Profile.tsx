import { Box, Heading, Text, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGetUserByUsername, type AuthResponse } from "../../service/api";
import Page404 from "../page404/Page404";
import "./Profile.css";

type UserProfile = AuthResponse["user"] & {
  _count: { tweets: number; followers: number; following: number };
};

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      <Heading className="profile-title">@{user.username}</Heading>
      <Text className="profile-subtitle">{user.bio || "Aucune bio"}</Text>
      <Box style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
        <Text><strong>{user._count.tweets}</strong> tweets</Text>
        <Text><strong>{user._count.followers}</strong> abonnés</Text>
        <Text><strong>{user._count.following}</strong> abonnements</Text>
      </Box>
    </Box>
  );
}

export default Profile;
