import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { username } = useParams();

  return (
    <Box className="profile">
      <Heading className="profile-title">@{username}</Heading>
      <Text className="profile-subtitle">
        Page de profil (à compléter)
      </Text>
    </Box>
  );
}

export default Profile;
